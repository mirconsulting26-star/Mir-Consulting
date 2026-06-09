import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";

export default function Layout() {
    const { pathname } = useLocation();
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);
    return (
        <div className="min-h-screen flex flex-col bg-mir-bg" data-testid="app-layout">
            <AnnouncementBar />
            <Navbar />
            <main
                className="flex-1 bg-mir-bg"
                style={{ paddingTop: "calc(5rem + var(--announcement-bar-h, 0px))" }}
            >
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
