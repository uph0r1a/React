import { Link } from 'react-router-dom';
import Header from '../components/Home/Header';
import Footer from '../components/Home/Footer';

const AboutPage = () => {
    const isLoggedIn = !!localStorage.getItem('token');
    const stats = [
        {
            value: '40,000+',
            label: 'Việc làm'
        },
        {
            value: '15,000+',
            label: 'Công ty'
        },
        {
            value: '2 triệu+',
            label: 'Ứng viên'
        },
        {
            value: '5 năm',
            label: 'Kinh nghiệm'
        },
    ];

    const values = [
        {
            icon: '🤝',
            title: 'Kết nối tin cậy',
            desc: 'Chúng tôi kết nối người tìm việc với nhà tuyển dụng uy tín một cách minh bạch và nhanh chóng.'
        },
        {
            icon: '🔒',
            title: 'Bảo mật thông tin',
            desc: 'Thông tin cá nhân và hồ sơ của bạn được bảo vệ theo tiêu chuẩn bảo mật cao nhất.'
        },
        {
            icon: '🚀',
            title: 'Đổi mới liên tục',
            desc: 'Chúng tôi không ngừng cải tiến nền tảng để mang lại trải nghiệm tốt nhất cho người dùng.'
        },
        {
            icon: '🌏',
            title: 'Phủ sóng toàn quốc',
            desc: 'Từ Hà Nội đến TP. Hồ Chí Minh và hơn 60 tỉnh thành — JobHot hiện diện khắp Việt Nam.'
        },
    ];

    const team = [
        {
            name: 'Thái Đức Trí',
            role: 'Founder',
            emoji: '🙋'
        },
        {
            name: 'Phạm Xuân Chiến',
            role: 'Founder',
            emoji: '👩‍💻'
        },
        {
            name: 'Nguyễn Bá Thế',
            role: 'Founder',
            emoji: '👨‍🎨'
        },
        {
            name: 'Đoàn Hà Anh',
            role: 'Founder',
            emoji: '👩'
        },
        {
            name: 'Nguyễn Ngọc Sơn',
            role: 'Member',
            emoji: '👨‍💼'
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="bg-linear-to-r from-purple-700 to-purple-500 text-white py-16 px-4 text-center">
                <h1 className="text-4xl font-bold mb-3">Về JobHot</h1>
                <p className="text-purple-200 text-base max-w-2xl mx-auto">Nền tảng tuyển dụng hàng đầu Việt Nam — kết nối tài năng với cơ hội</p>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12 w-full">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
                    <div className="text-4xl mb-4">🐝</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Sứ mệnh của chúng tôi</h2>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-3xl mx-auto">
                        JobHot được thành lập với mục tiêu đơn giản:{' '}
                        <strong className="text-purple-700">giúp mỗi người Việt Nam tìm được công việc phù hợp</strong>
                        {' '}
                        và giúp mỗi doanh nghiệp tuyển được nhân tài xứng đáng — nhanh chóng, dễ dàng, minh bạch.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((s) => {
                        return (
                            <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center">
                                <div className="text-2xl font-bold text-purple-700">{s.value}</div>
                                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                            </div>
                        );
                    })}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Giá trị cốt lõi</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {values.map((v) => {
                        return (
                            <div key={v.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-4 items-start">
                                <div className="text-3xl">{v.icon}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{v.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Đội ngũ lãnh đạo</h2>

                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {team.map((m) => {
                        return (
                            <div
                                key={m.name}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center
                                           w-[calc(50%-8px)] sm:w-40 flex flex-col items-center
                                           hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-3xl mb-3 ring-2 ring-purple-100">
                                    {m.emoji}
                                </div>
                                <p className="font-semibold text-sm text-gray-800 leading-tight">{m.name}</p>
                                <span className="mt-1.5 inline-block text-xs font-medium px-2.5 py-0.5 rounded-full
                                                 bg-purple-100 text-purple-700">
                                    {m.role}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {!isLoggedIn && (
                <div className="bg-linear-to-r from-purple-600 to-purple-500 rounded-2xl p-8 text-center text-white">
                    <h2 className="text-xl font-bold mb-2">Sẵn sàng bắt đầu hành trình của bạn?</h2>
                    <p className="text-purple-200 text-sm mb-5">Đăng ký miễn phí và khám phá hàng ngàn cơ hội việc là</p>

                    <div className="flex gap-3 justify-center flex-wrap">
                        <Link to="/register" className="px-6 py-2.5 bg-white text-purple-700 font-semibold rounded-lg text-sm hover:bg-purple-50 transition-colors no-underline">Đăng ký ngay</Link>

                        <Link to="/contact" className="px-6 py-2.5 border border-white/40 text-white font-semibold rounded-lg text-sm hover:bg-white/10 transition-colors no-underline">Liên hệ</Link>
                    </div>
                </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default AboutPage;