import { useState, useRef, useEffect } from "react";
import Logo from '../assets/img/Logo.png';

const CATEGORIES = ["Công nghệ thông tin", "Marketing / PR", "Thiết kế", "Kế toán / Kiểm toán", "Kinh doanh / Bán hàng", "Nhân sự", "Dịch vụ khách hàng"];
const JOB_TYPES = ["Full-time", "Part-time", "Freelancer", "Thực tập"];
const LOCATIONS = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];
const EXPERIENCES = ["Không yêu cầu", "Dưới 1 năm", "1-2 năm", "2-3 năm", "3-5 năm", "Trên 5 năm"];
const COMPANY_SIZES = ["1-10 nhân viên", "10-50 nhân viên", "50-100 nhân viên", "100-500 nhân viên", "Trên 500 nhân viên"];

const STATUS_CONFIG = {
    new: { label: "Mới", bg: "#eff6ff", color: "#1d4ed8" },
    reviewing: { label: "Đang xem xét", bg: "#fefce8", color: "#854d0e" },
    shortlisted: { label: "Tiềm năng", bg: "#f0fdf4", color: "#15803d" },
    rejected: { label: "Từ chối", bg: "#fff1f2", color: "#be123c" },
};

const inputStyle = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#111827" };
const textareaStyle = { ...inputStyle, resize: "vertical" };
const autoSelectStyle = { ...inputStyle, width: "auto" };
const smallSelectStyle = { ...inputStyle, width: "auto", padding: "6px 10px", fontSize: 12 };

const getInitials = (name) => name.split(" ").slice(-2).map((w) => w[0]).join("").toUpperCase();
const getCompanyInitials = (name) => (name ? getInitials(name) : "CT");
const getDaysLeft = (dateString) => Math.max(0, Math.ceil((new Date(dateString) - new Date()) / 86400000));
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("vi-VN");

const AVATAR_COLORS = ["#7c3aed", "#0369a1", "#0f766e", "#b45309", "#be185d", "#6d28d9"];
const getAvatarColor = (name) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getSectionTitle = (text) => <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 0.5, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>{text}</h3>;
const getFieldLabel = (text) => <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{text}</label>;

const getJobStatusStyle = (status) => ({
    fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600,
    ...(status === "active" ? { background: "#f0fdf4", color: "#15803d" } : { background: "#f3f4f6", color: "#6b7280" }),
});
const getJobStatusLabel = (status) => (status === "active" ? "Đang tuyển" : "Đã đóng");
const getToggleButtonLabel = (status) => (status === "active" ? "Đóng tin" : "Mở lại");

const getSidebarTabStyle = (isActive) => ({
    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", fontSize: 13.5, marginBottom: 3, transition: "all 0.15s",
    ...(isActive ? { fontWeight: 600, background: "#f5f3ff", color: "#7c3aed" } : { fontWeight: 400, background: "transparent", color: "#374151" }),
});

const getFilterButtonStyle = (isActive) => ({
    padding: "7px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer",
    ...(isActive ? { border: "1px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed", fontWeight: 600 } : { border: "1px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 400 }),
});

const getSubmitButtonStyle = (isLoading) => ({
    flex: 1, padding: "11px", borderRadius: 10, border: "none", color: "#fff", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    ...(isLoading ? { background: "#c4b5fd", cursor: "not-allowed" } : { background: "#7c3aed", cursor: "pointer" }),
});

const getMenuToggleButtonStyle = (isOpen) => ({
    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
    ...(isOpen ? { border: "1px solid #e5e7eb", background: "#f9fafb" } : { border: "1px solid transparent", background: "transparent" }),
});

const getChevronStyle = (isOpen) => ({ fontSize: 10, color: "#9ca3af", transition: "transform 0.2s", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" });

const Badge = ({ status }) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
    return <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: config.bg, color: config.color, fontWeight: 600 }}>{config.label}</span>;
};

const EmptyState = ({ icon, title, sub }) => (
    <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
        <div style={{ fontSize: 48, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</div>
        {sub && <div style={{ fontSize: 13 }}>{sub}</div>}
    </div>
);

const SpinnerDot = () => <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;

const ModalBackdrop = ({ onClose, zIndex = 1000, children }) => (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        {children}
    </div>
);

const Sidebar = ({ activeTab, setActiveTab, onLogout, companyName }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => menuRef.current && !menuRef.current.contains(event.target) && setMenuOpen(false);
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const tabs = [
        { id: "overview", icon: "📊", label: "Tổng quan" },
        { id: "jobs", icon: "📋", label: "Quản lý tin đăng" },
        { id: "candidates", icon: "👥", label: "Quản lý ứng viên" },
        { id: "talent", icon: "🔍", label: "Tìm ứng viên" },
        { id: "company", icon: "🏢", label: "Thông tin công ty" },
    ];

    const handleMenuToggle = () => setMenuOpen((open) => !open);
    const handleGoToCompany = () => { setActiveTab("company"); setMenuOpen(false); };
    const handleLogout = () => { setMenuOpen(false); onLogout(); };

    return (
        <aside style={{ width: 224, flexShrink: 0, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <div style={{ padding: "20px 20px 12px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <img src={Logo} alt="JobHot Logo" style={{ height: 32, width: "auto" }} />
                    <div style={{ fontWeight: 700, fontSize: 20, color: "#7c3aed", letterSpacing: -0.5 }}>JobHot</div>
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Trang nhà tuyển dụng</div>
            </div>

            <nav style={{ flex: 1, padding: "12px 12px" }}>
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={getSidebarTabStyle(activeTab === tab.id)}>
                        <span style={{ fontSize: 15 }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div style={{ padding: "12px 12px", borderTop: "1px solid #f3f4f6", position: "relative" }} ref={menuRef}>
                <button onClick={handleMenuToggle} style={getMenuToggleButtonStyle(menuOpen)}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{getCompanyInitials(companyName)}</div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{companyName || 'Công ty của bạn'}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>Nhà tuyển dụng</div>
                    </div>
                    <span style={getChevronStyle(menuOpen)}>▲</span>
                </button>

                {menuOpen && (
                    <div style={{ position: "absolute", bottom: "calc(100% - 8px)", left: 12, right: 12, background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", overflow: "hidden", zIndex: 50 }}>
                        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{companyName || 'Công ty của bạn'}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>hr@jobhot.vn</div>
                        </div>
                        <div style={{ padding: "6px" }}>
                            <button onClick={handleGoToCompany} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#374151", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                <span>🏢</span> Thông tin công ty
                            </button>
                            <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ef4444", textAlign: "left" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                <span>🚪</span> Đăng xuất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

const OverviewTab = ({ jobs, candidates, setActiveTab }) => {
    const stats = [
        { label: "Tin đang tuyển", value: jobs.filter((j) => j.status === "active").length, icon: "📋", color: "#7c3aed", bg: "#f5f3ff" },
        { label: "Tổng ứng viên", value: candidates.length, icon: "👥", color: "#0369a1", bg: "#eff6ff" },
        { label: "Ứng viên mới", value: candidates.filter((c) => c.status === "new").length, icon: "🆕", color: "#b45309", bg: "#fefce8" },
        { label: "Tiềm năng", value: candidates.filter((c) => c.status === "shortlisted").length, icon: "⭐", color: "#15803d", bg: "#f0fdf4" },
    ];

    const recentJobs = jobs.slice(0, 3);
    const recentCandidates = candidates.slice(0, 4);

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Tổng quan</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>Chào mừng trở lại! Đây là tình hình tuyển dụng hôm nay.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontWeight: 500 }}>{stat.label}</div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{stat.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Tin tuyển dụng gần đây</h3>
                        <button onClick={() => setActiveTab("jobs")} style={{ fontSize: 12, color: "#7c3aed", border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}>Xem tất cả →</button>
                    </div>
                    {recentJobs.map((job) => (
                        <div key={job.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f9fafb" }}>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{job.title}</div>
                                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{job.applicants} ứng viên · {formatDate(job.posted)}</div>
                            </div>
                            <span style={getJobStatusStyle(job.status)}>{getJobStatusLabel(job.status)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>Ứng viên mới nhất</h3>
                        <button onClick={() => setActiveTab("candidates")} style={{ fontSize: 12, color: "#7c3aed", border: "none", background: "none", cursor: "pointer", fontWeight: 500 }}>Xem tất cả →</button>
                    </div>
                    {recentCandidates.map((candidate) => (
                        <div key={candidate.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f9fafb" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: "50%", background: getAvatarColor(candidate.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{getInitials(candidate.name)}</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{candidate.name}</div>
                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{candidate.position}</div>
                                </div>
                            </div>
                            <Badge status={candidate.status} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const JobFormModal = ({ job, onClose, onSave }) => {
    const [title, setTitle] = useState(job?.title ?? "");
    const [description, setDescription] = useState(job?.description ?? "");
    const [requirements, setRequirements] = useState(job?.requirements ?? "");
    const [salary, setSalary] = useState(job?.salary ?? "");
    const [location, setLocation] = useState(job?.location ?? "Hà Nội");
    const [category, setCategory] = useState(job?.category ?? "Công nghệ thông tin");
    const [type, setType] = useState(job?.type ?? "Full-time");
    const [deadline, setDeadline] = useState(job?.deadline ?? "");
    const [loading, setLoading] = useState(false);

    const handleSave = async (event) => {
        event.preventDefault();
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 900));

        const savedJob = job
            ? { ...job, title, description, requirements, salary, location, category, type, deadline }
            : { id: `JP${Date.now()}`, status: "active", applicants: 0, posted: new Date().toISOString().slice(0, 10), title, description, requirements, salary, location, category, type, deadline };

        onSave(savedJob);
        setLoading(false);
        onClose();
    };

    const modalTitle = job ? "Chỉnh sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới";
    const saveButtonLabel = loading ? "Đang lưu..." : job ? "Lưu thay đổi" : "Đăng tuyển dụng";

    return (
        <ModalBackdrop onClose={onClose}>
            <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>{modalTitle}</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
                </div>

                <form onSubmit={handleSave} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        {getFieldLabel("Tiêu đề công việc *")}
                        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="VD: Lập Trình Viên Full Stack" style={inputStyle} />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div>
                            {getFieldLabel("Mức lương")}
                            <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="VD: 20-35 triệu" style={inputStyle} />
                        </div>
                        <div>
                            {getFieldLabel("Địa điểm")}
                            <select value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle}>
                                {LOCATIONS.map((loc) => <option key={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div>
                            {getFieldLabel("Danh mục (tuỳ chọn)")}
                            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                                {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            {getFieldLabel("Loại công việc")}
                            <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        {getFieldLabel("Deadline")}
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={inputStyle} />
                    </div>

                    <div>
                        {getFieldLabel("Mô tả công việc *")}
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Mô tả chi tiết về công việc, trách nhiệm..." style={textareaStyle} />
                    </div>

                    <div>
                        {getFieldLabel("Yêu cầu kỹ năng *")}
                        <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} required rows={4} placeholder="Liệt kê các yêu cầu (mỗi yêu cầu một dòng)..." style={textareaStyle} />
                    </div>

                    <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                        <button type="submit" disabled={loading} style={getSubmitButtonStyle(loading)}>
                            {loading && <SpinnerDot />}
                            {saveButtonLabel}
                        </button>
                        <button type="button" onClick={onClose} style={{ padding: "11px 20px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, cursor: "pointer" }}>Huỷ</button>
                    </div>
                </form>
            </div>
        </ModalBackdrop>
    );
};

const DeleteModal = ({ job, onConfirm, onClose }) => (
    <ModalBackdrop onClose={onClose} zIndex={1100}>
        <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🗑️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111827" }}>Xoá tin tuyển dụng?</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>Bạn sắp xoá <strong>"{job?.title ?? "N/A"}"</strong>. Hành động này không thể hoàn tác.</p>
            <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, cursor: "pointer" }}>Huỷ</button>
                <button onClick={onConfirm} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Xoá</button>
            </div>
        </div>
    </ModalBackdrop>
);

const JOB_FILTER_OPTIONS = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang tuyển" },
    { value: "closed", label: "Đã đóng" },
];

const JobsTab = ({ jobs, setJobs }) => {
    const [showForm, setShowForm] = useState(false);
    const [editJob, setEditJob] = useState(null);
    const [deleteJob, setDeleteJob] = useState(null);
    const [filter, setFilter] = useState("all");

    const filteredJobs = jobs.filter((job) => filter === "all" || job.status === filter);

    const handleSave = (savedJob) => {
        const exists = jobs.some((j) => j.id === savedJob.id);
        setJobs(exists ? jobs.map((j) => (j.id === savedJob.id ? savedJob : j)) : [savedJob, ...jobs]);
    };

    const handleDelete = () => { setJobs(jobs.filter((j) => j.id !== deleteJob.id)); setDeleteJob(null); };
    const handleToggleStatus = (id) => setJobs(jobs.map((job) => (job.id === id ? { ...job, status: job.status === "active" ? "closed" : "active" } : job)));
    const handleOpenCreate = () => { setEditJob(null); setShowForm(true); };
    const handleOpenEdit = (job) => { setEditJob(job); setShowForm(true); };

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Quản lý tin đăng</h2>
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{jobs.length} tin tuyển dụng</p>
                </div>
                <button onClick={handleOpenCreate} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Tạo tin mới</button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {JOB_FILTER_OPTIONS.map((option) => (
                    <button key={option.value} onClick={() => setFilter(option.value)} style={getFilterButtonStyle(filter === option.value)}>{option.label}</button>
                ))}
            </div>

            {filteredJobs.length === 0 && <EmptyState icon="📋" title="Chưa có tin tuyển dụng" sub="Nhấn 'Tạo tin mới' để bắt đầu tuyển dụng" />}

            {filteredJobs.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {filteredJobs.map((job) => (
                        <div key={job.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#111827" }}>{job.title}</h3>
                                        <span style={getJobStatusStyle(job.status)}>{getJobStatusLabel(job.status)}</span>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>💰 {job.salary}</span>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>📍 {job.location}</span>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>💼 {job.type}</span>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>📅 Deadline: {job.deadline ? formatDate(job.deadline) : "-"}</span>
                                        <span style={{ fontSize: 12, color: "#6b7280" }}>👥 {job.applicants} ứng viên</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.5 }}>{`${job.description.slice(0, 120)}…`}</p>
                                </div>

                                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                                    <button onClick={() => handleToggleStatus(job.id)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 12, cursor: "pointer" }}>{getToggleButtonLabel(job.status)}</button>
                                    <button onClick={() => handleOpenEdit(job)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>✏️ Sửa</button>
                                    <button onClick={() => setDeleteJob(job)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff1f2", color: "#ef4444", fontSize: 12, cursor: "pointer" }}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && <JobFormModal job={editJob} onClose={() => setShowForm(false)} onSave={handleSave} />}
            {deleteJob && <DeleteModal job={deleteJob} onConfirm={handleDelete} onClose={() => setDeleteJob(null)} />}
        </div>
    );
};

const CVModal = ({ candidate, onClose }) => (
    <ModalBackdrop onClose={onClose} zIndex={1100}>
        <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Hồ sơ ứng viên</h2>
                <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
            </div>

            <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: getAvatarColor(candidate.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{getInitials(candidate.name)}</div>
                    <div>
                        <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#111827" }}>{candidate.name}</h3>
                        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 6 }}>{candidate.position}</div>
                        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9ca3af" }}>
                            <span>📍 {candidate.location}</span>
                            <span>⏱ {candidate.experience}</span>
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    {getSectionTitle("Liên hệ")}
                    <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
                        <span style={{ color: "#374151" }}>📧 {candidate.email}</span>
                        <span style={{ color: "#374151" }}>📱 {candidate.phone}</span>
                    </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                    {getSectionTitle("Giới thiệu")}
                    <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{candidate.bio}</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                    {getSectionTitle("Học vấn")}
                    <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>🎓 {candidate.education}</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                    {getSectionTitle("Kỹ năng")}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {candidate.skills.map((skill) => <span key={skill} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#f5f3ff", color: "#7c3aed", fontWeight: 500 }}>{skill}</span>)}
                    </div>
                </div>

                <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", fontSize: 12, color: "#6b7280" }}>
                    📄 CV đính kèm:{' '}
                    <span style={{ color: "#7c3aed", fontWeight: 500, cursor: "pointer" }}>{`CV_${candidate.name.replace(/ /g, "_")}.pdf`}</span>
                    <span style={{ marginLeft: 8, color: "#9ca3af" }}>(Demo - chưa tích hợp backend)</span>
                </div>
            </div>
        </div>
    </ModalBackdrop>
);

const CandidatesTab = ({ candidates, setCandidates, jobs }) => {
    const [viewCV, setViewCV] = useState(null);
    const [filterJob, setFilterJob] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredCandidates = candidates.filter((c) => (filterJob === "all" || c.appliedJob === filterJob) && (filterStatus === "all" || c.status === filterStatus));
    const updateStatus = (id, newStatus) => setCandidates(candidates.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Quản lý ứng viên</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>{filteredCandidates.length} ứng viên</p>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)} style={autoSelectStyle}>
                    <option value="all">Tất cả tin đăng</option>
                    {jobs.map((job) => <option key={job.id} value={job.id}>{`${job.title.slice(0, 40)}…`}</option>)}
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={autoSelectStyle}>
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(STATUS_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                </select>
            </div>

            {filteredCandidates.length === 0 && <EmptyState icon="👥" title="Chưa có ứng viên" sub="Ứng viên sẽ xuất hiện ở đây khi họ nộp hồ sơ" />}

            {filteredCandidates.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {filteredCandidates.map((candidate) => {
                        const appliedJob = jobs.find((j) => j.id === candidate.appliedJob);
                        const jobTitle = appliedJob ? `${appliedJob.title.slice(0, 35)}…` : "N/A";
                        const topSkills = candidate.skills.slice(0, 3);

                        return (
                            <div key={candidate.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarColor(candidate.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{getInitials(candidate.name)}</div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                                                <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{candidate.name}</span>
                                                <Badge status={candidate.status} />
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{candidate.position} · {candidate.experience}</div>
                                            <div style={{ fontSize: 12, color: "#9ca3af" }}>Ứng tuyển: <span style={{ color: "#374151" }}>{jobTitle}</span> · {formatDate(candidate.appliedDate)}</div>
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                                {topSkills.map((skill) => <span key={skill} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#f5f3ff", color: "#7c3aed" }}>{skill}</span>)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}>
                                        <select value={candidate.status} onChange={(e) => updateStatus(candidate.id, e.target.value)} style={smallSelectStyle}>
                                            {Object.entries(STATUS_CONFIG).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                                        </select>
                                        <button onClick={() => setViewCV(candidate)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #7c3aed", background: "#f5f3ff", color: "#7c3aed", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>Xem CV</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {viewCV && <CVModal candidate={viewCV} onClose={() => setViewCV(null)} />}
        </div>
    );
};

const TalentTab = () => {
    const [searchSkill, setSearchSkill] = useState("");
    const [searchExperience, setSearchExperience] = useState("Tất cả");
    const [searchLocation, setSearchLocation] = useState("Tất cả");
    const [results, setResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = () => {
        const keyword = searchSkill.toLowerCase();

        const filtered = results.filter((talent) => {
            const skillMatch = !keyword || talent.position.toLowerCase().includes(keyword) || talent.skills.some((s) => s.toLowerCase().includes(keyword));
            const experienceMatch = searchExperience === "Tất cả" || talent.experience === searchExperience;
            const locationMatch = searchLocation === "Tất cả" || talent.location === searchLocation;
            return skillMatch && experienceMatch && locationMatch;
        });

        setResults(filtered);
        setHasSearched(true);
    };

    const handleKeyDown = (event) => event.key === "Enter" && handleSearch();

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700, color: "#111827" }}>Tìm kiếm ứng viên</h2>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#6b7280" }}>Tìm kiếm trong cơ sở dữ liệu ứng viên của JobHot</p>

            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "20px 24px", marginBottom: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Kỹ năng / Vị trí</label>
                        <input value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} placeholder="React, Python, Designer..." style={inputStyle} onKeyDown={handleKeyDown} />
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Kinh nghiệm</label>
                        <select value={searchExperience} onChange={(e) => setSearchExperience(e.target.value)} style={inputStyle}>
                            <option>Tất cả</option>
                            {EXPERIENCES.map((exp) => <option key={exp}>{exp}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Địa điểm</label>
                        <select value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} style={inputStyle}>
                            <option>Tất cả</option>
                            {LOCATIONS.map((loc) => <option key={loc}>{loc}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSearch} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: "#7c3aed", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>🔍 Tìm kiếm</button>
                </div>
            </div>

            {hasSearched && <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6b7280" }}>Tìm thấy <strong style={{ color: "#111827" }}>{results.length}</strong> ứng viên phù hợp</p>}
            {results.length === 0 && hasSearched && <EmptyState icon="🔍" title="Không tìm thấy ứng viên" sub="Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm" />}

            {results.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                    {results.map((talent) => (
                        <div key={talent.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 18px", transition: "box-shadow 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(124,58,237,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: "50%", background: getAvatarColor(talent.name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{getInitials(talent.name)}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{talent.name}</div>
                                    <div style={{ fontSize: 12, color: "#6b7280" }}>{talent.position}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                                <span>📍 {talent.location}</span>
                                <span>⏱ {talent.experience}</span>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                                {talent.skills.map((skill) => <span key={skill} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "#f5f3ff", color: "#7c3aed", fontWeight: 500 }}>{skill}</span>)}
                            </div>

                            <a href={`mailto:${talent.email}`} style={{ display: "block", textAlign: "center", padding: "8px", borderRadius: 8, border: "1px solid #7c3aed", color: "#7c3aed", fontSize: 12, fontWeight: 600, textDecoration: "none", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "#7c3aed"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#7c3aed"; }}>✉️ Liên hệ ứng viên</a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompanyTab = ({ onCompanyNameChange }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [website, setWebsite] = useState('');
    const [size, setSize] = useState('');
    const [industry, setIndustry] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }

        (async () => {
            try {
                const res = await fetch('/server/index.php?action=get-employer-profile', { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
                const data = await res.json();

                if (data.success && data.data) {
                    const u = data.data;
                    setName(u.company ?? '');
                    setEmail(u.email ?? '');
                    setPhone(u.phone ?? '');
                    setAddress(u.address ?? '');
                    setWebsite(u.website ?? '');
                    setSize(u.company_size ?? '');
                    setIndustry(u.industry ?? '');
                    setDescription(u.bio ?? '');
                }
            } catch {
                setError('Không thể tải thông tin công ty.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSave = async (event) => {
        event.preventDefault();
        setError('');
        setSaving(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/server/index.php?action=update-employer-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ company: name, email, phone, address, website, company_size: size, industry, bio: description }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            } else {
                setSaved(true);
                localStorage.setItem('company', name);
                onCompanyNameChange?.(name);
                setTimeout(() => setSaved(false), 2500);
            }
        } catch {
            setError('Không thể kết nối tới máy chủ.');
        } finally {
            setSaving(false);
        }
    };

    const saveButtonLabel = saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu thay đổi';

    return loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ color: '#6b7280' }}>Đang tải thông tin...</div>
        </div>
    ) : (
        <div style={{ flex: 1, overflowY: "auto", padding: 24, maxWidth: 720 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
                <div style={{ width: 68, height: 68, borderRadius: 16, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 700 }}>{getCompanyInitials(name)}</div>
                <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>{name || 'Công ty của bạn'}</h2>
                    <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{industry || 'Chưa cập nhật ngành'} · {size || 'Chưa cập nhật quy mô'}</div>
                </div>
            </div>

            {error && <div style={{ marginBottom: 16, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>}

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {getSectionTitle("Thông tin cơ bản")}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                        {getFieldLabel("Tên công ty *")}
                        <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                    </div>
                    <div>
                        {getFieldLabel("Website")}
                        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." style={inputStyle} />
                    </div>
                    <div>
                        {getFieldLabel("Email liên hệ")}
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        {getFieldLabel("Số điện thoại")}
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        {getFieldLabel("Ngành nghề")}
                        <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle}>
                            {CATEGORIES.map((cat) => <option key={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        {getFieldLabel("Quy mô")}
                        <select value={size} onChange={(e) => setSize(e.target.value)} style={inputStyle}>
                            {COMPANY_SIZES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    {getFieldLabel("Địa chỉ *")}
                    <input value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
                </div>

                <div>
                    {getFieldLabel("Mô tả công ty *")}
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} placeholder="Mô tả về công ty, văn hóa, sứ mệnh..." style={textareaStyle} />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: saved ? "#16a34a" : "#7c3aed", color: "#fff", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", width: "fit-content", transition: "background 0.15s", opacity: saving ? 0.7 : 1 }}
                    onMouseEnter={(e) => !saving && !saved && (e.currentTarget.style.background = "#6d28d9")}
                    onMouseLeave={(e) => !saving && !saved && (e.currentTarget.style.background = "#7c3aed")}
                >
                    {saveButtonLabel}
                </button>
            </form>
        </div>
    );
};

const API = '/server/index.php';

const TAB_TITLES = {
    overview: "Tổng quan",
    jobs: "Quản lý tin đăng",
    candidates: "Quản lý ứng viên",
    talent: "Tìm kiếm ứng viên",
    company: "Thông tin công ty",
};

export default function EmployerDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [jobs, setJobs] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState(localStorage.getItem('company') || '');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const jobsResponse = await fetch(`${API}?action=get-jobs`);
                const jobsData = await jobsResponse.json();

                if (jobsData.success) {
                    const jobsList = jobsData.data?.jobs ?? jobsData.jobs ?? [];
                    setJobs(jobsList.map((job) => ({ ...job, status: job.status || 'active' })));
                }

                const token = localStorage.getItem('token');
                if (token) {
                    const candidatesResponse = await fetch(`${API}?action=get-applied-jobs`, { headers: { Authorization: `Bearer ${token}` } });
                    const candidatesData = await candidatesResponse.json();
                    if (candidatesData.success) setCandidates(candidatesData.data ?? []);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        ['token', 'role', 'name', 'email', 'industry', 'company', 'avatar', 'rememberMe'].forEach((key) => localStorage.removeItem(key));
        window.location.href = "/login";
    };

    const activeJobCount = jobs.filter((j) => j.status === "active").length;

    const tabPanels = {
        overview: <OverviewTab jobs={jobs} candidates={candidates} setActiveTab={setActiveTab} />,
        jobs: <JobsTab jobs={jobs} setJobs={setJobs} />,
        candidates: <CandidatesTab candidates={candidates} setCandidates={setCandidates} jobs={jobs} />,
        talent: <TalentTab />,
        company: <CompanyTab onCompanyNameChange={setCompanyName} />,
    };

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            `}</style>

            <div style={{ display: "flex", height: "100vh", background: "#f9fafb", overflow: "hidden" }}>
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} companyName={companyName} />

                <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
                    <div style={{ padding: "14px 24px", borderBottom: "1px solid #f3f4f6", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>{TAB_TITLES[activeTab]}</h1>
                            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>JobHot - Nhà tuyển dụng</div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ fontSize: 12, background: "#f0fdf4", color: "#15803d", padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>{activeJobCount} tin đang tuyển</div>
                            <div style={{ fontSize: 12, background: "#f5f3ff", color: "#7c3aed", padding: "4px 12px", borderRadius: 20, fontWeight: 500 }}>{candidates.length} ứng viên</div>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>{tabPanels[activeTab]}</div>
                </main>
            </div>
        </>
    );
}