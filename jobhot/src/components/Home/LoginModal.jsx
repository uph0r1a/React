import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleGoToLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleGoToRegister = () => {
        onClose();
        navigate('/register');
    };

    if (!isOpen)
        return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Yêu cầu đăng nhập</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">Bạn cần đăng nhập để xem chi tiết công việc và ứng tuyển</p>
                </div>

                <div className="space-y-3">
                    <button onClick={handleGoToLogin} className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg">Đăng nhập</button>
                    <button onClick={handleGoToRegister} className="w-full py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors">Đăng ký tài khoản mới</button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">Đăng nhập để trải nghiệm đầy đủ tính năng của JobHot</p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
