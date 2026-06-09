import React from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Industries from "@/pages/Industries";
import CaseStudies from "@/pages/CaseStudies";
import CaseStudyDetail from "@/pages/CaseStudyDetail";
import Insights from "@/pages/Insights";
import InsightDetail from "@/pages/InsightDetail";
import OurWork from "@/pages/OurWork";
import VideoDetail from "@/pages/VideoDetail";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import AdminResetPassword from "@/pages/AdminResetPassword";
import NotFound from "@/pages/NotFound";
import PublicInvoice from "@/pages/PublicInvoice";

// Redirect helper: preserves the `:slug` URL segment when moving old paths
// (/insights/:slug) to the renamed routes (/blog/:slug).
function SlugRedirect({ to }) {
    const { slug } = useParams();
    return <Navigate to={`${to}/${slug || ""}`} replace />;
}

function App() {
    return (
        <HelmetProvider>
            <div className="App bg-mir-bg text-mir-text min-h-screen">
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/services" element={<Services />} />
                            <Route path="/industries" element={<Industries />} />
                            <Route path="/case-studies" element={<CaseStudies />} />
                            <Route
                                path="/case-studies/:slug"
                                element={<CaseStudyDetail />}
                            />
                            <Route path="/blog" element={<Insights />} />
                            <Route
                                path="/blog/:slug"
                                element={<InsightDetail />}
                            />
                            {/* legacy redirects from the "Insights" naming */}
                            <Route path="/insights" element={<Navigate to="/blog" replace />} />
                            <Route
                                path="/insights/:slug"
                                element={<SlugRedirect to="/blog" />}
                            />
                            <Route path="/our-work" element={<OurWork />} />
                            <Route path="/our-work/video/:slug" element={<VideoDetail />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/reset/:token" element={<AdminResetPassword />} />
                        <Route path="/invoice/:token" element={<PublicInvoice />} />
                    </Routes>
                </BrowserRouter>
                <Toaster
                    theme="light"
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "hsl(0, 0%, 100%)",
                            color: "hsl(222, 47%, 11%)",
                            border: "1px solid hsl(220, 13%, 91%)",
                            borderRadius: 0,
                        },
                    }}
                />
            </div>
        </HelmetProvider>
    );
}

export default App;
