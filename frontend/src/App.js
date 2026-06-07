import React from "react";
import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import Layout from "@/components/layout/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Industries from "@/pages/Industries";
import CaseStudies from "@/pages/CaseStudies";
import Insights from "@/pages/Insights";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

function App() {
    return (
        <div className="App bg-mir-bg text-mir-text min-h-screen">
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/industries" element={<Industries />} />
                        <Route path="/case-studies" element={<CaseStudies />} />
                        <Route path="/insights" element={<Insights />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="/admin" element={<Admin />} />
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
    );
}

export default App;
