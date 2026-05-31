import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="flex flex-col">
                        <h3 className="font-bold mb-4 text-base">Về JobHot</h3>
                        <Link to="/about" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Giới thiệu</Link>
                        <Link to="/contact" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Liên hệ</Link>
                        <Link to="/contact" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Hỏi đáp / Phản hồi</Link>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold mb-4 text-base">Dành cho ứng viên</h3>
                        <Link to="/" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Tìm việc làm</Link>
                        <Link to="/register" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Đăng ký tìm việc</Link>
                    </div>
                    <div className="flex flex-col">
                        <h3 className="font-bold mb-4 text-base">Dành cho nhà tuyển dụng</h3>
                        <Link to="/register" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Đăng tin tuyển dụng</Link>
                        <Link to="/employer" className="mb-2 text-sm text-gray-300 no-underline hover:text-purple-400 transition-colors">Quản lý tuyển dụng</Link>
                    </div>
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
};

export default Footer;
