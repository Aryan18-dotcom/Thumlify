import { Route, Routes, useLocation } from "react-router-dom";
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
import PrivacyPolicy from "./pages/privacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPage";
import CommunityPage from "./pages/CommunityPage";

export default function App() {
    const {pathname} = useLocation();

    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
    
    return (
        <>
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
                <Route path="/my-generations" element={<MyGenerationsPage />} />
                <Route path="/youtube-preview" element={<YouTubePreviewPage />} />
                <Route path="/login" element={<Login />} />
            </Routes>
            <Footer />
        </>
    );
}