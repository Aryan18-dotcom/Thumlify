import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface Credits {
  credits: number
  totalSpent: number
  username: string
}

interface AuthContextType {
  user: User | null
  credits: Credits | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
  fetchCredits: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const serverUrl = import.meta.env.VITE_SERVER_API_URI || 'http://localhost:3000';
      const response = await fetch(`${serverUrl}/api/auth/current-user`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCredits = async () => {
    try {
      const serverUrl = import.meta.env.VITE_SERVER_API_URI || 'http://localhost:3000';
      const response = await fetch(`${serverUrl}/api/credits/user-credits`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCredits({
          credits: data.credits,
          totalSpent: data.totalSpent,
          username: data.username
        });
      } else {
        setCredits(null);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const login = (userData: User) => setUser(userData);
  const logout = () => {
    setUser(null);
    setCredits(null);
  };

  return (
    <AuthContext.Provider value={{ user, credits, isLoading, isAuthenticated: !!user, login, logout, checkAuth, fetchCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const serverUrl = import.meta.env.VITE_SERVER_API_URI || 'http://localhost:3000';

export const checkUserCredits = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${serverUrl}/api/credits/user-credits`, {
      credentials: "include"
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data?.credits > 0;

  } catch (error) {
    console.error("Credit check failed:", error);
    return false;
  }
};

