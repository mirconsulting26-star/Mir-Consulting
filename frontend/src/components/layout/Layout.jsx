import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
    return (
        <div className="min-h-screen flex flex-col bg-mir-bg" data-testid="app-layout">
            <Navbar />
            <main className="flex-1 pt-20 bg-mir-bg">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
