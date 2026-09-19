import { Link } from 'react-router-dom';

const linkCls = "mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors";

const FOOTER_COLUMNS = [
    { title: 'Về JobHot', links: [{ to: '/about', label: 'Giới thiệu' }, { to: '/contact', label: 'Liên hệ' }, { to: '/contact', label: 'Hỏi đáp / Phản hồi' }] },
    { title: 'Dành cho ứng viên', links: [{ to: '/', label: 'Tìm việc làm' }, { to: '/register', label: 'Đăng ký tìm việc' }] },
    { title: 'Dành cho nhà tuyển dụng', links: [{ to: '/register', label: 'Đăng tin tuyển dụng' }, { to: '/employer', label: 'Quản lý tuyển dụng' }] },
];

const Footer = () => (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {FOOTER_COLUMNS.map((col) => (
                    <div key={col.title} className="flex flex-col">
                        <h3 className="font-bold mb-4 text-base">{col.title}</h3>
                        {col.links.map(({ to, label }, i) => <Link key={`${to}-${i}`} to={to} className={linkCls}>{label}</Link>)}
                    </div>
                ))}

                <div className="flex flex-col">
                    <h3 className="font-bold mb-4 text-base">Liên hệ</h3>
                    <p className="text-sm text-gray-300 mb-2">📧 jobhot@gmail.com</p>
                    <p className="text-sm text-gray-300 mb-2">📞 0987 654 321</p>
                    <Link to="/contact" className="mt-2 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors no-underline w-fit">Gửi phản hồi</Link>
                </div>
            </div>
            <p className="text-center mt-8 pt-8 border-t border-white/10 opacity-70 text-sm">© 2026 JobHot. All rights reserved.</p>
        </div>
    </footer>
);

export default Footer;