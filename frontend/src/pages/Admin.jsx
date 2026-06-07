import React from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, LogOut, ShieldCheck, Inbox, Users, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { adminLogin, fetchLeads, fetchStats } from "@/lib/api";

const TOKEN_KEY = "mir_admin_token";

export default function Admin() {
    const [token, setToken] = React.useState(() => localStorage.getItem(TOKEN_KEY) || "");
    const [password, setPassword] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [leads, setLeads] = React.useState([]);
    const [stats, setStats] = React.useState(null);
    const [loadingData, setLoadingData] = React.useState(false);

    const loadData = React.useCallback(async (t) => {
        setLoadingData(true);
        try {
            const [l, s] = await Promise.all([fetchLeads(t), fetchStats(t)]);
            setLeads(l);
            setStats(s);
        } catch (e) {
            if (e?.response?.status === 401) {
                toast.error("Session expired. Please log in again.");
                localStorage.removeItem(TOKEN_KEY);
                setToken("");
            } else {
                toast.error("Failed to load leads.");
            }
        } finally {
            setLoadingData(false);
        }
    }, []);

    React.useEffect(() => {
        if (token) loadData(token);
    }, [token, loadData]);

    const onLogin = async (e) => {
        e.preventDefault();
        if (!password) return toast.error("Enter the admin password.");
        setLoading(true);
        try {
            const res = await adminLogin(password);
            localStorage.setItem(TOKEN_KEY, res.token);
            setToken(res.token);
            toast.success("Welcome back.");
        } catch (err) {
            toast.error(
                err?.response?.data?.detail || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setLeads([]);
        setStats(null);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-mir-surface flex items-center justify-center px-6 grain-overlay relative" data-testid="admin-login-page">
                <div className="absolute inset-0 grid-backdrop opacity-40 [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_70%)] pointer-events-none" />
                <div className="absolute top-6 left-6 z-10">
                    <Link
                        to="/"
                        data-testid="admin-back-home"
                        className="inline-flex items-center gap-2 text-mir-muted hover:text-mir-text text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to site
                    </Link>
                </div>
                <form
                    onSubmit={onLogin}
                    data-testid="admin-login-form"
                    className="relative border border-mir-border bg-white p-10 w-full max-w-md shadow-[0_8px_30px_0_rgba(15,23,42,0.06)]"
                >
                    <div className="w-12 h-12 border border-mir-blue/30 bg-mir-blue/8 flex items-center justify-center mb-6">
                        <ShieldCheck className="w-5 h-5 text-mir-blue" />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.25em] text-mir-blue mb-3">
                        MIR Consulting · Admin
                    </div>
                    <h1 className="font-heading text-3xl font-light tracking-tight mb-2 text-mir-text">
                        Secure Sign In
                    </h1>
                    <p className="text-sm text-mir-muted mb-8">
                        Restricted access. Enter the admin password to view consultation requests.
                    </p>
                    <div className="space-y-2 mb-6">
                        <Label htmlFor="password" className="text-xs uppercase tracking-[0.2em] text-mir-muted">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            data-testid="admin-password-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            className="bg-white border-mir-border rounded-none h-12 focus-visible:ring-mir-blue focus-visible:ring-offset-0 focus-visible:border-mir-blue text-mir-text"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="admin-login-submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-mir-midnight hover:bg-mir-blue disabled:opacity-60 text-white px-6 py-3 text-sm font-medium transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Sign in
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mir-surface" data-testid="admin-dashboard-page">
            <header className="border-b border-mir-border bg-white/85 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 border border-mir-blue/30 bg-mir-blue/8 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4 text-mir-blue" />
                        </div>
                        <div>
                            <div className="font-heading text-lg tracking-tight text-mir-text">
                                MIR <span className="text-mir-muted font-light">Admin</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-[0.25em] text-mir-blue">
                                Consultation Requests
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            data-testid="admin-link-home"
                            className="text-sm text-mir-muted hover:text-mir-text"
                        >
                            View site
                        </Link>
                        <button
                            onClick={logout}
                            data-testid="admin-logout-button"
                            className="inline-flex items-center gap-2 border border-mir-border hover:border-mir-blue px-4 py-2 text-sm text-mir-text bg-white"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="border border-mir-border bg-white p-6" data-testid="admin-stat-total">
                        <div className="flex items-center gap-3 text-mir-muted text-xs uppercase tracking-[0.2em] mb-3">
                            <Inbox className="w-4 h-4 text-mir-blue" />
                            Total Requests
                        </div>
                        <div className="font-heading text-4xl text-mir-text">
                            {stats?.total_leads ?? "—"}
                        </div>
                    </div>
                    <div className="border border-mir-border bg-white p-6" data-testid="admin-stat-new">
                        <div className="flex items-center gap-3 text-mir-muted text-xs uppercase tracking-[0.2em] mb-3">
                            <Users className="w-4 h-4 text-mir-blue" />
                            New (unread)
                        </div>
                        <div className="font-heading text-4xl text-mir-text">
                            {stats?.new_leads ?? "—"}
                        </div>
                    </div>
                    <div className="border border-mir-blue/30 bg-mir-blue/5 p-6">
                        <div className="text-mir-muted text-xs uppercase tracking-[0.2em] mb-3">
                            Status
                        </div>
                        <div className="font-heading text-xl text-mir-text">
                            All systems operational
                        </div>
                    </div>
                </div>

                <div className="border border-mir-border bg-white">
                    <div className="px-6 py-5 border-b border-mir-border flex items-center justify-between">
                        <div>
                            <div className="font-heading text-xl tracking-tight text-mir-text">
                                Consultation Requests
                            </div>
                            <div className="text-xs text-mir-muted mt-1">
                                {loadingData ? "Loading..." : `${leads.length} entries`}
                            </div>
                        </div>
                        <button
                            onClick={() => loadData(token)}
                            data-testid="admin-refresh-button"
                            className="text-sm border border-mir-border hover:border-mir-blue px-4 py-2 text-mir-text"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table data-testid="admin-leads-table">
                            <TableHeader>
                                <TableRow className="border-mir-border hover:bg-transparent">
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Name
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Email
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Company
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Industry
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Service
                                    </TableHead>
                                    <TableHead className="text-mir-muted uppercase text-[10px] tracking-[0.2em]">
                                        Message
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.length === 0 && !loadingData && (
                                    <TableRow className="border-mir-border hover:bg-transparent">
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-mir-muted py-12"
                                        >
                                            No consultation requests yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {leads.map((l) => (
                                    <TableRow
                                        key={l.id}
                                        data-testid={`admin-lead-row-${l.id}`}
                                        className="border-mir-border hover:bg-mir-surface"
                                    >
                                        <TableCell className="text-xs text-mir-muted whitespace-nowrap">
                                            {new Date(l.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-text">
                                            {l.full_name}
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-text">
                                            <a
                                                href={`mailto:${l.email}`}
                                                className="hover:text-mir-blue"
                                            >
                                                {l.email}
                                            </a>
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-textSoft">
                                            {l.company || "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-textSoft">
                                            {l.industry || "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-textSoft">
                                            {l.service_interest || "—"}
                                        </TableCell>
                                        <TableCell className="text-sm text-mir-textSoft max-w-md">
                                            <span className="block truncate" title={l.message}>
                                                {l.message}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
        </div>
    );
}
