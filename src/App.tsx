import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "./globals.css";
import LenisScroll from "./components/LenisScroll";
import GeneratePage from "./pages/GeneratePage";
import MyGenerationsPage from "./pages/MyGenerationsPage";
import YouTubePreviewPage from "./pages/YouTubePreviewPage";
import Login from "./components/Login";
import { useEffect } from "react";
import AboutUsPage from "./pages/AboutUsPage";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPage";
import CommunityPage from "./pages/CommunityPage";
import { AuthProvider } from "./context/AuthContext";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PricingPage from "./pages/PricingPage";

function AppContent() {
    const { pathname } = useLocation();

    useEffect(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", 
      });
    }, [pathname]);
    
    return (
        <>
            <Toaster position="top-right" />
            <LenisScroll />
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/about-creator" element={<AboutUsPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/generate" element={<GeneratePage />} />
                <Route path="/generate/:id" element={<GeneratePage />} />
                <Route path="/my-gallery" element={<MyGenerationsPage />} />
                <Route path="/youtube-preview" element={<YouTubePreviewPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}