import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/img/Logo.png';

const API = '/server/index.php';

const SpinnerIcon = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

const ServerErrorBox = ({ message }) =>
    message ? (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {message}
        </div>
    ) : null;

const baseInputClasses = 'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors';

const getInputClasses = (hasError) =>
    `${baseInputClasses} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-purple-500'}`;

const getConfirmInputClasses = (hasError, confirmValue, passwordValue) =>
    `${baseInputClasses} ${hasError
        ? 'border-red-400 bg-red-50'
        : confirmValue && confirmValue === passwordValue
            ? 'border-green-400'
            : 'border-gray-300 focus:border-purple-500'
    }`;

const getDotClasses = (dotIndex, currentStep) =>
    dotIndex === currentStep
        ? 'h-1.5 rounded-full transition-all w-6 bg-purple-600'
        : dotIndex < currentStep
            ? 'h-1.5 rounded-full transition-all w-1.5 bg-purple-300'
            : 'h-1.5 rounded-full transition-all w-1.5 bg-gray-200';

const Email = ({ onNext }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim()) return setError('Vui lòng nhập email.');
        if (!/\S+@\S+\.\S+/.test(email)) return setError('Email không hợp lệ.');

        setLoading(true);

        try {
            await axios.post(`${API}?action=forgot-password`, { email });
            onNext(email);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Có lỗi xảy ra. Thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Địa chỉ email</label>
                <input
                    type="email"
                    placeholder="example@email.com"
                    className={getInputClasses(!!error)}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <SpinnerIcon />
                        Đang gửi...
                    </>
                ) : (
                    'Gửi mã xác nhận'
                )}
            </button>
        </form>
    );
};

const otpInputProps = {
    type: 'text',
    inputMode: 'numeric',
    maxLength: '1',
    placeholder: '0',
    className: 'w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg outline-none transition-colors focus:border-purple-500',
};

const OTP = ({ email, onNext }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [resendLoading, setResendLoading] = useState(false);

    const inputs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => setCountdown((current) => current - 1), 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) inputs.current[index + 1].focus();
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();

            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);

            if (index > 0) inputs.current[index - 1].focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) inputs.current[index - 1].focus();
        if (event.key === 'ArrowRight' && index < 5) inputs.current[index + 1].focus();
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const digits = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);

        if (!digits.length) return;

        const newOtp = [...otp];
        for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i];
        setOtp(newOtp);

        inputs.current[Math.min(digits.length, 5)].focus();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const code = otp.join('');

        if (code.length !== 6) return setError('Vui lòng nhập đầy đủ mã OTP (6 chữ số).');

        setLoading(true);

        try {
            const response = await axios.post(`${API}?action=verify-otp`, { email, otp: code });
            const verificationToken = response.data.data?.verificationToken;

            if (!verificationToken) {
                setError('Không nhận được mã xác minh từ server.');
                return;
            }

            onNext(verificationToken);
        } catch (err) {
            setError(err.response?.data?.message ?? 'Có lỗi xảy ra. Thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);

        try {
            await axios.post(`${API}?action=forgot-password`, { email });

            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setError('');
            inputs.current[0].focus();
        } catch (err) {
            setError(err.response?.data?.message ?? 'Không thể gửi lại mã. Thử lại sau.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <ServerErrorBox message={error} />

            <p className="text-sm text-gray-600">
                Mã OTP đã được gửi đến <span className="font-medium">{email}</span>
            </p>

            <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                        key={index}
                        ref={(el) => (inputs.current[index] = el)}
                        value={otp[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        {...otpInputProps}
                    />
                ))}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <SpinnerIcon />
                        Đang xác minh...
                    </>
                ) : (
                    'Xác minh mã OTP'
                )}
            </button>

            {countdown > 0 ? (
                <p className="text-xs text-center text-gray-500">
                    Gửi lại mã trong <span className="font-semibold">{countdown}</span> giây
                </p>
            ) : (
                <button
                    type="button"
                    disabled={resendLoading}
                    onClick={handleResend}
                    className="w-full py-2.5 border border-purple-600 text-purple-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {resendLoading ? (
                        <>
                            <SpinnerIcon />
                            Đang gửi...
                        </>
                    ) : (
                        'Gửi lại mã OTP'
                    )}
                </button>
            )}
        </form>
    );
};

const NewPassword = ({ email, verificationToken, onDone }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [errors, setErrors] = useState({ password: '', confirm: '' });

    const clearError = (field) =>
        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });

    const handleSubmit = async (event) => {
        event.preventDefault();

        const updatedErrors = {
            ...(password.length < 8 && { password: 'Mật khẩu tối thiểu 8 ký tự.' }),
            ...(password !== confirm && { confirm: 'Mật khẩu không khớp.' }),
        };

        if (Object.keys(updatedErrors).length > 0) {
            setErrors(updatedErrors);
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API}?action=reset-password`, { email, password, verificationToken });
            onDone();
        } catch (err) {
            setServerError(err.response?.data?.message ?? 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <ServerErrorBox message={serverError} />

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className={getInputClasses(!!errors.password)}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                    autoComplete="new-password"
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    className={getConfirmInputClasses(!!errors.confirm, confirm, password)}
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }}
                    autoComplete="new-password"
                />
                {errors.confirm ? (
                    <p className="text-xs text-red-500">{errors.confirm}</p>
                ) : (
                    confirm && confirm === password && <p className="text-xs text-green-500">✓ Mật khẩu khớp</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <SpinnerIcon />
                        Đang lưu...
                    </>
                ) : (
                    'Đặt mật khẩu mới'
                )}
            </button>
        </form>
    );
};

const SuccessScreen = ({ onGoToLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
        <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt lại thành công!</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.
                </p>

                <button
                    onClick={onGoToLogin}
                    className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                >
                    Đăng nhập
                </button>
            </div>
        </div>
    </div>
);

const BackButton = ({ step, onBack, onGoToLogin }) => (
    <button
        onClick={step === 0 ? onGoToLogin : onBack}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-5"
    >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
        {step === 0 ? 'Quay lại đăng nhập' : 'Quay lại'}
    </button>
);

const stepMeta = [
    { title: 'Quên mật khẩu', subtitle: 'Nhập email để nhận mã xác nhận' },
    { title: 'Xác minh email', subtitle: 'Nhập mã OTP đã gửi đến email' },
    { title: 'Mật khẩu mới', subtitle: 'Tạo mật khẩu mới cho tài khoản' },
];

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [verificationToken, setVerificationToken] = useState('');

    const handleEmailDone = (submittedEmail) => {
        setEmail(submittedEmail);
        setStep(1);
    };

    const handleOtpDone = (token) => {
        setVerificationToken(token);
        setStep(2);
    };

    const handleBack = () => setStep(step - 1);
    const goToLogin = () => navigate('/login');

    if (step === 3) return <SuccessScreen onGoToLogin={goToLogin} />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <img src={Logo} alt="JobHot Logo" className="h-28 w-auto" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <BackButton step={step} onBack={handleBack} onGoToLogin={goToLogin} />

                    <div className="flex items-center gap-1.5 justify-center mb-6">
                        {[0, 1, 2].map((dotIndex) => (
                            <div key={dotIndex} className={getDotClasses(dotIndex, step)} />
                        ))}
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-1 text-gray-800">
                        {stepMeta[step].title}
                    </h1>
                    <p className="text-center text-gray-500 text-sm mb-6">
                        {stepMeta[step].subtitle}
                    </p>

                    {step === 0 && <Email onNext={handleEmailDone} />}
                    {step === 1 && <OTP email={email} onNext={handleOtpDone} />}
                    {step === 2 && (
                        <NewPassword email={email} verificationToken={verificationToken} onDone={() => setStep(3)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;