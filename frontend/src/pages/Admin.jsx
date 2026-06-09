import React from "react";
import { toast } from "sonner";
import Seo from "@/lib/Seo";
import { adminLogin } from "@/lib/api";
import LoginScreen from "@/pages/admin/LoginScreen";
import Dashboard from "@/pages/admin/Dashboard";

export default function Admin() {
    // Token lives only in React state — never persisted. This means:
    //   • Navigating away from /admin (e.g. clicking "Back to site") clears the session.
    //   • Refreshing the page logs you out.
    //   • Closing the tab logs you out.
    // Re-visiting /admin always shows the password screen.
    const [token, setToken] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [loggingIn, setLoggingIn] = React.useState(false);

    // One-time cleanup: wipe any legacy token left in localStorage by older builds.
    React.useEffect(() => {
        try {
            window.localStorage.removeItem("mir_admin_token");
        } catch (_e) { /* noop */ }
    }, []);

    const onLogin = async (e) => {
        e.preventDefault();
        if (!password) return toast.error("Enter the admin password.");
        setLoggingIn(true);
        try {
            const res = await adminLogin(password);
            setToken(res.token);
            toast.success("Welcome back.");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Invalid credentials");
        } finally {
            setLoggingIn(false);
        }
    };

    const logout = () => setToken("");

    if (!token) {
        return (
            <>
                <Seo title="Admin Sign In" path="/admin" noIndex />
                <LoginScreen
                    password={password}
                    setPassword={setPassword}
                    onLogin={onLogin}
                    loading={loggingIn}
                />
            </>
        );
    }

    return (
        <>
            <Seo title="Admin Dashboard" path="/admin" noIndex />
            <Dashboard token={token} onLogout={logout} onAuthExpired={logout} />
        </>
    );
}
