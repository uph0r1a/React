import { Link } from 'react-router-dom';
import Logo from '../assets/img/Logo.png';

// ─────────────────────────────────────────────
// PAGE: LandingPage
// Trang giới thiệu cho người dùng chưa đăng nhập.
// Hiển thị hero, tính năng, thống kê, CTA.
// ─────────────────────────────────────────────

const STATS = [
    { value: '40,000+', label: 'Việc làm' },
    { value: '15,000+', label: 'Công ty' },
    { value: '2 triệu+', label: 'Ứng viên' },
    { value: '5 năm', label: 'Kinh nghiệm' },
];

const FEATURES = [
    {
        icon: '🔍',
        title: 'Tìm việc thông minh',
        desc: 'Hệ thống gợi ý việc làm phù hợp theo ngành nghề và kinh nghiệm của bạn.',
    },
    {
        icon: '🏢',
        title: 'Nhà tuyển dụng uy tín',
        desc: 'Hàng nghìn công ty hàng đầu Việt Nam đang tuyển dụng trên JobHot.',
    },
    {
        icon: '📩',
        title: 'Ứng tuyển nhanh chóng',
        desc: 'Nộp hồ sơ chỉ với một cú click. Theo dõi trạng thái ứng tuyển trực tiếp.',
    },
    {
        icon: '🔒',
        title: 'Bảo mật thông tin',
        desc: 'Thông tin cá nhân được mã hoá và bảo vệ theo tiêu chuẩn cao nhất.',
    },
];

const TOP_INDUSTRIES = [
    { icon: '💻', name: 'Công nghệ thông tin' },
    { icon: '📣', name: 'Marketing / PR' },
    { icon: '🎨', name: 'Thiết kế' },
    { icon: '💰', name: 'Tài chính / Kế toán' },
    { icon: '🏥', name: 'Y tế / Sức khoẻ' },
    { icon: '📚', name: 'Giáo dục / Đào tạo' },
    { icon: '🏗️', name: 'Xây dựng' },
    { icon: '🚚', name: 'Logistics / Vận tải' },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">

            {/* ── NAVBAR ── */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src={Logo} alt="JobHot" className="h-10 w-auto" />
                </Link>
                <div className="flex items-center gap-3">
                    <Link
                        to="/about"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium hidden sm:block"
                    >
                        Về chúng tôi
                    </Link>
                    <Link
                        to="/contact"
                        className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium hidden sm:block"
                    >
                        Liên hệ
                    </Link>
                    <Link
                        to="/login"
                        className="text-sm px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/register"
                        className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        Đăng ký
                    </Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="bg-linear-to-br from-purple-700 via-purple-600 to-purple-500 text-white py-20 px-4 text-center relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

                <div className="relative max-w-3xl mx-auto">
                    <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide">
                        🐝 Nền tảng tuyển dụng #1 Việt Nam
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                        Tìm công việc<br />
                        <span className="text-yellow-300">mơ ước của bạn</span>
                    </h1>
                    <p className="text-purple-100 text-base md:text-lg mb-8 max-w-xl mx-auto">
                        Hơn 40,000 việc làm từ 15,000 công ty hàng đầu đang chờ bạn. Đăng ký miễn phí và bắt đầu ngay hôm nay.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/register"
                            className="px-8 py-3.5 bg-white text-purple-700 rounded-xl font-bold hover:bg-yellow-50 transition-colors shadow-lg text-sm"
                        >
                            🚀 Tạo tài khoản miễn phí
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-3.5 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors text-sm"
                        >
                            Đã có tài khoản? Đăng nhập
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="bg-white border-b border-gray-100 py-10 px-4">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {STATS.map(s => (
                        <div key={s.label}>
                            <div className="text-3xl font-extrabold text-purple-700">{s.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-16 px-4 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
                        Tại sao chọn JobHot?
                    </h2>
                    <p className="text-center text-gray-500 text-sm mb-10">
                        Chúng tôi giúp bạn kết nối với cơ hội nghề nghiệp tốt nhất
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {FEATURES.map(f => (
                            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-shadow">
                                <div className="text-4xl shrink-0">{f.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── TOP INDUSTRIES ── */}
            <section className="py-14 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Ngành nghề nổi bật</h2>
                    <p className="text-center text-gray-500 text-sm mb-8">Khám phá hàng ngàn cơ hội theo lĩnh vực bạn yêu thích</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {TOP_INDUSTRIES.map(ind => (
                            <Link
                                key={ind.name}
                                to="/register"
                                className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-colors group"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform">{ind.icon}</span>
                                <span className="text-xs font-medium text-gray-700 text-center">{ind.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FOR EMPLOYERS ── */}
            <section className="py-14 px-4 bg-purple-600 text-white">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="text-4xl mb-3">🏢</div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">Bạn là nhà tuyển dụng?</h2>
                    <p className="text-purple-100 text-sm mb-6 max-w-xl mx-auto">
                        Tiếp cận hàng triệu ứng viên tiềm năng. Đăng tin tuyển dụng miễn phí và quản lý hồ sơ dễ dàng trên nền tảng của chúng tôi.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block px-8 py-3.5 bg-white text-purple-700 rounded-xl font-bold hover:bg-yellow-50 transition-colors text-sm shadow-lg"
                    >
                        Đăng tin tuyển dụng ngay →
                    </Link>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-14 px-4 bg-gray-50 text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Sẵn sàng bắt đầu?</h2>
                    <p className="text-gray-500 text-sm mb-6">Đăng ký miễn phí trong vài giây. Không cần thẻ tín dụng.</p>
                    <Link
                        to="/register"
                        className="inline-block px-10 py-3.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg text-sm"
                    >
                        Tạo tài khoản ngay 🎉
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-white border-t border-gray-100 py-8 px-4 text-center">
                <img src={Logo} alt="JobHot" className="h-10 mx-auto mb-3" />
                <p className="text-xs text-gray-400 mb-3">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
                <div className="flex justify-center gap-6 text-xs text-gray-500">
                    <Link to="/about" className="hover:text-purple-600 transition-colors">Về chúng tôi</Link>
                    <Link to="/contact" className="hover:text-purple-600 transition-colors">Liên hệ</Link>
                    <Link to="/login" className="hover:text-purple-600 transition-colors">Đăng nhập</Link>
                    <Link to="/register" className="hover:text-purple-600 transition-colors">Đăng ký</Link>
                </div>
                <p className="text-xs text-gray-300 mt-4">© 2026 JobHot. All rights reserved.</p>
            </footer>

        </div>
    );
};

export default LandingPage;
