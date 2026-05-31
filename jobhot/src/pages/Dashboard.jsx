import { useState, useRef, useEffect, useCallback } from "react";
import Logo from '../assets/img/Logo.png';

// ─── shared style helpers (mirrors Employer.jsx exactly) ────
const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: "1px solid #e5e7eb", fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", color: "#111827",
};
const smallSelectStyle = {
    width: "auto", padding: "6px 10px", borderRadius: 8,
    border: "1px solid #e5e7eb", fontSize: 12, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit", color: "#111827",
    background: "#fff",
};
const getSidebarTabStyle = (isActive) => {
    const style = {
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
        textAlign: "left", fontSize: 13.5, marginBottom: 3, transition: "all 0.15s",
    };
    if (isActive) { style.fontWeight = 600; style.background = "#f5f3ff"; style.color = "#7c3aed"; }
    else { style.fontWeight = 400; style.background = "transparent"; style.color = "#374151"; }
    return style;
};
const getMenuToggleButtonStyle = (isOpen) => {
    const style = {
        width: "100%", display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
    };
    if (isOpen) { style.border = "1px solid #e5e7eb"; style.background = "#f9fafb"; }
    else { style.border = "1px solid transparent"; style.background = "transparent"; }
    return style;
};
const getChevronStyle = (isOpen) => ({
    fontSize: 10, color: "#9ca3af", transition: "transform 0.2s", flexShrink: 0,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
});
const getSectionTitle = (text) => (
    <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>{text}</h3>
);
const getFieldLabel = (text) => (
    <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{text}</label>
);
const getInitials = (name = "") => {
    const words = name.split(" "); const last = words.slice(-2);
    return last.map(w => w[0]).join("").toUpperCase();
};
const AVATAR_COLORS = ["#7c3aed", "#0369a1", "#0f766e", "#b45309", "#be185d", "#6d28d9"];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const formatDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "—";

const SpinnerDot = () => (
    <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
);
const EmptyState = ({ icon, title, sub }) => (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</div>
        {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
);

// ─── API helper ──────────────────────────────────────────────
const API = '/server/index.php';
function authHeaders() {
    return { 'Authorization': 'Bearer ' + (localStorage.getItem('token') || '') };
}
async function apiFetch(action, opts = {}) {
    const method = opts.method || 'GET';
    const res = await fetch(API + '?action=' + action, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch {
        const jsonStart = text.indexOf('{');
        if (jsonStart > 0) return JSON.parse(text.slice(jsonStart));
        throw new Error('Invalid response: ' + text.slice(0, 200));
    }
}

// ─── Toast ───────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
    if (!msg) return null;
    const bg = type === 'error' ? '#ef4444' : '#22c55e';
    return (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, background: bg, color: "#fff", padding: "12px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,.15)" }}>
            {msg}
        </div>
    );
};

// ─── Modal ───────────────────────────────────────────────────
const Modal = ({ open, title, onClose, children }) => {
    if (!open) return null;
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 28, width: 480, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ margin: 0, color: "#111827", fontSize: 16, fontWeight: 700 }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
};

// ─── Status badge helpers ────────────────────────────────────
const jobStatusStyle = (s) => {
    const base = { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" };
    if (s === 'active') return { ...base, background: "#f0fdf4", color: "#15803d" };
    if (s === 'pending') return { ...base, background: "#fefce8", color: "#854d0e" };
    if (s === 'closed') return { ...base, background: "#f3f4f6", color: "#6b7280" };
    return { ...base, background: "#f3f4f6", color: "#6b7280" };
};
const jobStatusLabel = (s) => ({ active: "Đang tuyển", pending: "Chờ duyệt", closed: "Đã đóng" }[s] || s);
const userStatusStyle = (s) => {
    const base = { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" };
    if (s === 'active') return { ...base, background: "#f0fdf4", color: "#15803d" };
    return { ...base, background: "#fff1f2", color: "#be123c" };
};
const userStatusLabel = (s) => s === 'active' ? 'Hoạt động' : 'Bị khóa';
const roleStyle = (r) => {
    const base = { fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, whiteSpace: "nowrap" };
    if (r === 'employer') return { ...base, background: "#eff6ff", color: "#1d4ed8" };
    return { ...base, background: "#f5f3ff", color: "#7c3aed" };
};
const roleLabel = (r) => r === 'employer' ? 'Nhà tuyển dụng' : 'Người tìm việc';

// ─── Shared action button style ──────────────────────────────
const actionBtn = (variant = 'default') => {
    const base = { fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, transition: "opacity .15s" };
    if (variant === 'primary') return { ...base, background: "#7c3aed", color: "#fff" };
    if (variant === 'danger') return { ...base, background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" };
    if (variant === 'warning') return { ...base, background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" };
    if (variant === 'success') return { ...base, background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" };
    return { ...base, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" };
};

// ─── Sidebar ─────────────────────────────────────────────────
const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();
    const adminName = localStorage.getItem('name') || 'Quản trị viên';
    const adminEmail = localStorage.getItem('email') || 'admin@jobhot.vn';

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const tabs = [
        { id: "overview", icon: "📊", label: "Tổng quan" },
        { id: "users", icon: "👥", label: "Quản lý người dùng" },
        { id: "jobs", icon: "📋", label: "Quản lý bài đăng" },
        { id: "categories", icon: "🗂️", label: "Quản lý danh mục" },
    ];

    return (
        <aside style={{ width: 224, flexShrink: 0, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <img src={Logo} alt="JobHot Logo" style={{ height: 32, width: "auto" }} />
                    <div style={{ fontWeight: 700, fontSize: 20, color: "#7c3aed", letterSpacing: -0.5 }}>JobHot</div>
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Trang quản trị viên</div>
            </div>

            <nav style={{ flex: 1, padding: "12px 12px" }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={getSidebarTabStyle(activeTab === tab.id)}>
                        <span style={{ fontSize: 15 }}>{tab.icon}</span>{tab.label}
                    </button>
                ))}
            </nav>

            <div style={{ padding: "12px 12px", borderTop: "1px solid #f3f4f6", position: "relative" }} ref={menuRef}>
                <button onClick={() => setMenuOpen(o => !o)} style={getMenuToggleButtonStyle(menuOpen)}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {getInitials(adminName)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{adminName}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>Quản trị viên</div>
                    </div>
                    <span style={getChevronStyle(menuOpen)}>▲</span>
                </button>

                {menuOpen && (
                    <div style={{ position: "absolute", bottom: "calc(100% - 8px)", left: 12, right: 12, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 50 }}>
                        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{adminName}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{adminEmail}</div>
                        </div>
                        <div style={{ padding: "6px" }}>
                            <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", textAlign: "left" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#fff1f2"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span>🚪</span> Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

// ─── OverviewTab ─────────────────────────────────────────────
const OverviewTab = ({ stats, catStats, setActiveTab }) => {
    const cards = [
        { label: "Tổng bài đăng", value: stats.totalJobs, icon: "💼", color: "#7c3aed", bg: "#f5f3ff" },
        { label: "Đang tuyển", value: stats.activeJobs, icon: "✅", color: "#15803d", bg: "#f0fdf4" },
        { label: "Chờ duyệt", value: stats.pendingJobs, icon: "⏳", color: "#854d0e", bg: "#fefce8" },
        { label: "Tổng người dùng", value: stats.totalUsers, icon: "👥", color: "#0369a1", bg: "#eff6ff" },
        { label: "Nhà tuyển dụng", value: stats.totalEmployers, icon: "🏢", color: "#7c3aed", bg: "#f5f3ff" },
        { label: "Người tìm việc", value: stats.totalSeekers, icon: "🔍", color: "#15803d", bg: "#f0fdf4" },
        { label: "Danh mục", value: stats.totalCategories, icon: "🗂️", color: "#854d0e", bg: "#fefce8" },
        { label: "Lượt ứng tuyển", value: stats.totalApplications, icon: "📨", color: "#0369a1", bg: "#eff6ff" },
    ];
    const maxCat = Math.max(...(catStats || []).map(c => c.job_count), 1);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Tổng quan</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>Chào mừng trở lại! Đây là tình hình hệ thống hôm nay.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
                {cards.map(c => (
                    <div key={c.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{c.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value ?? '—'}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Bar chart */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Bài đăng theo danh mục</h3>
                        <button onClick={() => setActiveTab('categories')} style={{ fontSize: 12, color: "#7c3aed", border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}>Xem tất cả →</button>
                    </div>
                    {(catStats || []).slice(0, 7).map(c => (
                        <div key={c.name} style={{ marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: "#374151" }}>{c.icon} {c.name}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>{c.job_count}</span>
                            </div>
                            <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${(c.job_count / maxCat) * 100}%`, background: "#7c3aed", borderRadius: 3, transition: "width .5s ease" }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick links */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 20 }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#111827" }}>Thao tác nhanh</h3>
                    {[
                        { icon: "👥", label: "Quản lý người dùng", sub: "Xem, khóa, xóa tài khoản", tab: "users" },
                        { icon: "📋", label: "Quản lý bài đăng", sub: "Duyệt, đóng, xóa bài đăng", tab: "jobs" },
                        { icon: "🗂️", label: "Quản lý danh mục", sub: "Thêm, sửa, xóa danh mục", tab: "categories" },
                    ].map(q => (
                        <button key={q.tab} onClick={() => setActiveTab(q.tab)}
                            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 10px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", marginBottom: 4 }}
                            onMouseEnter={e => e.currentTarget.style.background = "#f5f3ff"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                            <div style={{ width: 38, height: 38, borderRadius: 9, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{q.icon}</div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{q.label}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{q.sub}</div>
                            </div>
                            <span style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 14 }}>›</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── UsersTab ─────────────────────────────────────────────────
const UsersTab = ({ toast }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        apiFetch('admin-get-users').then(r => { if (r.success) setUsers(r.data.users || []); setLoading(false); });
    }, []);
    useEffect(load, [load]);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return (u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
            && (roleFilter === 'all' || u.role === roleFilter);
    });

    async function toggleLock(u) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        // Optimistic update — flip the button immediately so the UI responds right away
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
        try {
            const r = await apiFetch('admin-update-user', { method: 'POST', body: { id: u.id, status: newStatus } });
            if (r.success) {
                toast(newStatus === 'suspended' ? '🔒 Đã khóa tài khoản' : '🔓 Đã mở khóa', 'success');
                load();
            } else {
                // Revert on failure
                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: u.status } : x));
                toast(r.message || 'Cập nhật thất bại', 'error');
            }
        } catch (err) {
            // Revert on network error
            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: u.status } : x));
            console.error('toggleLock error:', err);
            toast('Lỗi: ' + (err.message || String(err)), 'error');
        }
    }
    async function deleteUser() {
        const r = await apiFetch('admin-delete-user', { method: 'POST', body: { id: confirmDel.id } });
        if (r.success) { toast('🗑️ Đã xóa người dùng', 'success'); setConfirmDel(null); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }
    async function saveEdit() {
        setSaving(true);
        const r = await apiFetch('admin-update-user', { method: 'POST', body: { id: editUser.id, ...editForm } });
        setSaving(false);
        if (r.success) { toast('✅ Đã cập nhật', 'success'); setEditUser(null); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Quản lý người dùng</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{users.length} tài khoản trong hệ thống</p>
                </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên, email..."
                    style={{ ...inputStyle, maxWidth: 280 }} />
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={smallSelectStyle}>
                    <option value="all">Tất cả vai trò</option>
                    <option value="user">Người tìm việc</option>
                    <option value="employer">Nhà tuyển dụng</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Đang tải...</div>
            ) : (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                {["Người dùng", "Email", "Vai trò", "Trạng thái", "Ngày tạo", "Hành động"].map(h => (
                                    <th key={h} style={{ padding: "11px 16px", color: "#6b7280", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: getAvatarColor(u.full_name || ''), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                                {getInitials(u.full_name || '')}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#111827" }}>{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.email}</td>
                                    <td style={{ padding: "12px 16px" }}><span style={roleStyle(u.role)}>{roleLabel(u.role)}</span></td>
                                    <td style={{ padding: "12px 16px" }}><span style={userStatusStyle(u.status)}>{userStatusLabel(u.status)}</span></td>
                                    <td style={{ padding: "12px 16px", color: "#9ca3af", whiteSpace: "nowrap" }}>{formatDate(u.created_at)}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button style={actionBtn('default')} onClick={() => { setEditUser(u); setEditForm({ full_name: u.full_name, email: u.email, role: u.role, status: u.status }); }}>Sửa</button>
                                            <button style={actionBtn(u.status === 'active' ? 'warning' : 'success')} onClick={() => toggleLock(u)}>
                                                {u.status === 'active' ? '🔒 Khóa' : '🔓 Mở'}
                                            </button>
                                            <button style={actionBtn('danger')} onClick={() => setConfirmDel(u)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6}><EmptyState icon="👤" title="Không tìm thấy người dùng" sub="Thử thay đổi bộ lọc tìm kiếm" /></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit modal */}
            <Modal open={!!editUser} title="Chỉnh sửa người dùng" onClose={() => setEditUser(null)}>
                {editUser && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>{getFieldLabel("Họ và tên")}<input value={editForm.full_name} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} style={inputStyle} /></div>
                        <div>{getFieldLabel("Email")}<input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} /></div>
                        <div>{getFieldLabel("Vai trò")}
                            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle }}>
                                <option value="user">Người tìm việc</option>
                                <option value="employer">Nhà tuyển dụng</option>
                            </select>
                        </div>
                        <div>{getFieldLabel("Trạng thái")}
                            <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle }}>
                                <option value="active">Hoạt động</option>
                                <option value="suspended">Bị khóa</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                            <button onClick={() => setEditUser(null)} style={actionBtn('default')}>Hủy</button>
                            <button onClick={saveEdit} disabled={saving} style={{ ...actionBtn('primary'), opacity: saving ? .5 : 1 }}>
                                {saving ? <><SpinnerDot /> Đang lưu...</> : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm delete */}
            <Modal open={!!confirmDel} title="Xác nhận xóa tài khoản" onClose={() => setConfirmDel(null)}>
                {confirmDel && (
                    <div>
                        <p style={{ color: "#374151", marginBottom: 20 }}>Bạn có chắc muốn xóa tài khoản <strong>{confirmDel.full_name}</strong>? Hành động này không thể hoàn tác.</p>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setConfirmDel(null)} style={actionBtn('default')}>Hủy</button>
                            <button onClick={deleteUser} style={actionBtn('danger')}>Xóa tài khoản</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ─── JobsTab ──────────────────────────────────────────────────
const JobsTab = ({ toast }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [confirmDel, setConfirmDel] = useState(null);

    const load = useCallback(() => {
        setLoading(true);
        apiFetch('admin-get-jobs').then(r => { if (r.success) setJobs(r.data.jobs || []); setLoading(false); });
    }, []);
    useEffect(load, [load]);

    const filtered = jobs.filter(j => {
        const q = search.toLowerCase();
        return (j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q))
            && (statusFilter === 'all' || j.status === statusFilter);
    });

    async function setStatus(job, status) {
        const r = await apiFetch('admin-update-job', { method: 'POST', body: { id: job.id, status } });
        if (r.success) { toast({ active: '✅ Đã duyệt', closed: '🚫 Đã đóng' }[status] || 'Đã cập nhật', 'success'); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }
    async function deleteJob() {
        const r = await apiFetch('admin-delete-job', { method: 'POST', body: { id: confirmDel.id } });
        if (r.success) { toast('🗑️ Đã xóa bài đăng', 'success'); setConfirmDel(null); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }

    const counts = { all: jobs.length, active: jobs.filter(j => j.status === 'active').length, pending: jobs.filter(j => j.status === 'pending').length, closed: jobs.filter(j => j.status === 'closed').length };

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Quản lý bài đăng</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{jobs.length} bài đăng trong hệ thống</p>
                </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {[['all', 'Tất cả'], ['active', 'Đang tuyển'], ['pending', 'Chờ duyệt'], ['closed', 'Đã đóng']].map(([val, label]) => (
                    <button key={val} onClick={() => setStatusFilter(val)}
                        style={{
                            padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
                            border: statusFilter === val ? "1px solid #7c3aed" : "1px solid #e5e7eb",
                            background: statusFilter === val ? "#f5f3ff" : "#fff",
                            color: statusFilter === val ? "#7c3aed" : "#6b7280",
                            fontWeight: statusFilter === val ? 600 : 400
                        }}>
                        {label} <span style={{ fontSize: 11, opacity: .7 }}>({counts[val]})</span>
                    </button>
                ))}
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tiêu đề, công ty..."
                    style={{ ...inputStyle, maxWidth: 240, marginLeft: "auto" }} />
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Đang tải...</div>
            ) : (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                {["Tiêu đề", "Công ty", "Danh mục", "Địa điểm", "Trạng thái", "Ngày đăng", "Hành động"].map(h => (
                                    <th key={h} style={{ padding: "11px 16px", color: "#6b7280", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(j => (
                                <tr key={j.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <td style={{ padding: "12px 16px", maxWidth: 200 }}>
                                        <div style={{ fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
                                    </td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>{j.company}</td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>{j.category_icon} {j.category_name || '—'}</td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280", whiteSpace: "nowrap" }}>{j.location}</td>
                                    <td style={{ padding: "12px 16px" }}><span style={jobStatusStyle(j.status)}>{jobStatusLabel(j.status)}</span></td>
                                    <td style={{ padding: "12px 16px", color: "#9ca3af", whiteSpace: "nowrap" }}>{formatDate(j.created_at)}</td>
                                    <td style={{ padding: "12px 16px" }}>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {j.status !== 'active' && <button style={actionBtn('success')} onClick={() => setStatus(j, 'active')}>✅ Duyệt</button>}
                                            {j.status !== 'closed' && <button style={actionBtn('warning')} onClick={() => setStatus(j, 'closed')}>🚫 Đóng</button>}
                                            <button style={actionBtn('danger')} onClick={() => setConfirmDel(j)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7}><EmptyState icon="📋" title="Không tìm thấy bài đăng" sub="Thử thay đổi bộ lọc tìm kiếm" /></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={!!confirmDel} title="Xác nhận xóa bài đăng" onClose={() => setConfirmDel(null)}>
                {confirmDel && (
                    <div>
                        <p style={{ color: "#374151", marginBottom: 20 }}>Xóa bài đăng <strong>"{confirmDel.title}"</strong> của <strong>{confirmDel.company}</strong>? Hành động này không thể hoàn tác.</p>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setConfirmDel(null)} style={actionBtn('default')}>Hủy</button>
                            <button onClick={deleteJob} style={actionBtn('danger')}>Xóa bài đăng</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ─── CategoriesTab ────────────────────────────────────────────
const CategoriesTab = ({ toast }) => {
    const [cats, setCats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ id: null, name: '', icon: '📂' });
    const [saving, setSaving] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);

    const ICONS = ['💻', '📣', '🎨', '💰', '🏥', '📚', '🏗️', '🚚', '👥', '💼', '📞', '🏛️', '🔬', '⚖️', '✈️', '🍽️', '📦', '🌿', '📐', '🎮', '📂', '🖥️', '📊', '🧬', '🏦','🏦'];

    const load = useCallback(() => {
        setLoading(true);
        apiFetch('admin-get-categories').then(r => { if (r.success) setCats(r.data.categories || []); setLoading(false); });
    }, []);
    useEffect(load, [load]);

    async function save() {
        if (!form.name.trim()) { toast('Tên danh mục không được để trống', 'error'); return; }
        setSaving(true);
        const action = modal === 'add' ? 'admin-add-category' : 'admin-update-category';
        const r = await apiFetch(action, { method: 'POST', body: form });
        setSaving(false);
        if (r.success) { toast(modal === 'add' ? '✅ Đã thêm danh mục' : '✅ Đã cập nhật', 'success'); setModal(null); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }
    async function del() {
        const r = await apiFetch('admin-delete-category', { method: 'POST', body: { id: confirmDel.id } });
        if (r.success) { toast('🗑️ Đã xóa danh mục', 'success'); setConfirmDel(null); load(); }
        else toast(r.message || 'Lỗi', 'error');
    }

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Quản lý danh mục</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{cats.length} danh mục hiện có</p>
                </div>
                <button onClick={() => { setForm({ id: null, name: '', icon: '📂' }); setModal('add'); }}
                    style={{ padding: "9px 18px", borderRadius: 9, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    + Thêm danh mục
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Đang tải...</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                    {cats.map(c => (
                        <div key={c.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: "#111827", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                                <div style={{ color: "#9ca3af", fontSize: 11, marginTop: 2 }}>ID: {c.id}</div>
                            </div>
                            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button style={actionBtn('default')} onClick={() => { setForm({ id: c.id, name: c.name, icon: c.icon || '📂' }); setModal('edit'); }}>Sửa</button>
                                <button style={actionBtn('danger')} onClick={() => setConfirmDel(c)}>Xóa</button>
                            </div>
                        </div>
                    ))}
                    {cats.length === 0 && <EmptyState icon="🗂️" title="Chưa có danh mục" sub="Nhấn Thêm danh mục để bắt đầu" />}
                </div>
            )}

            {/* Add/Edit modal */}
            <Modal open={!!modal} title={modal === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'} onClose={() => setModal(null)}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>{getFieldLabel("Tên danh mục")}<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ví dụ: Công nghệ thông tin" style={inputStyle} /></div>
                    <div>
                        {getFieldLabel("Chọn icon")}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {ICONS.map(ic => (
                                <button key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                                    style={{ fontSize: 18, background: form.icon === ic ? "#f5f3ff" : "#fff", border: `2px solid ${form.icon === ic ? "#7c3aed" : "#e5e7eb"}`, borderRadius: 8, width: 36, height: 36, cursor: "pointer" }}>
                                    {ic}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Preview */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{form.icon}</div>
                        <span style={{ color: "#111827", fontWeight: 600, fontSize: 14 }}>{form.name || 'Xem trước danh mục'}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => setModal(null)} style={actionBtn('default')}>Hủy</button>
                        <button onClick={save} disabled={saving} style={{ ...actionBtn('primary'), opacity: saving ? .5 : 1 }}>
                            {saving ? <><SpinnerDot /> Đang lưu...</> : modal === 'add' ? 'Thêm danh mục' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Confirm delete */}
            <Modal open={!!confirmDel} title="Xác nhận xóa danh mục" onClose={() => setConfirmDel(null)}>
                {confirmDel && (
                    <div>
                        <p style={{ color: "#374151", marginBottom: 8 }}>Xóa danh mục <strong>"{confirmDel.name}"</strong>?</p>
                        <p style={{ color: "#854d0e", fontSize: 12, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", marginBottom: 20 }}>
                            ⚠️ Các bài đăng thuộc danh mục này sẽ không còn danh mục.
                        </p>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => setConfirmDel(null)} style={actionBtn('default')}>Hủy</button>
                            <button onClick={del} style={actionBtn('danger')}>Xóa danh mục</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// ─── Root ─────────────────────────────────────────────────────
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({});
    const [catStats, setCatStats] = useState([]);
    const [toastMsg, setToastMsg] = useState('');
    const [toastType, setToastType] = useState('success');

    const TAB_TITLES = {
        overview: 'Tổng quan',
        users: 'Quản lý người dùng',
        jobs: 'Quản lý bài đăng',
        categories: 'Quản lý danh mục',
    };

    useEffect(() => {
        apiFetch('admin-get-stats').then(r => {
            if (r.success) { setStats(r.data); setCatStats(r.data.categoryStats || []); }
        });
    }, []);

    function toast(msg, type = 'success') {
        setToastMsg(msg); setToastType(type);
        setTimeout(() => setToastMsg(''), 3000);
    }

    function handleLogout() {
        ['token', 'role', 'name', 'email', 'industry', 'company', 'avatar', 'rememberMe'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/login';
    }

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", background: "#f9fafb", overflow: "hidden" }}>
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

                <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                    {/* Top bar */}
                    <div style={{ padding: "14px 24px", borderBottom: "1px solid #f3f4f6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>{TAB_TITLES[activeTab]}</h1>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>JobHot - Quản trị viên</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ fontSize: 12, background: "#f0fdf4", color: "#15803d", padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>
                                {stats.activeJobs ?? '—'} tin đang tuyển
                            </div>
                            <div style={{ fontSize: 12, background: "#f5f3ff", color: "#7c3aed", padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>
                                {stats.totalUsers ?? '—'} người dùng
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                        {activeTab === 'overview' && <OverviewTab stats={stats} catStats={catStats} setActiveTab={setActiveTab} />}
                        {activeTab === 'users' && <UsersTab toast={toast} />}
                        {activeTab === 'jobs' && <JobsTab toast={toast} />}
                        {activeTab === 'categories' && <CategoriesTab toast={toast} />}
                    </div>
                </main>
            </div>

            <Toast msg={toastMsg} type={toastType} />
        </>
    );
}