import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/img/Logo.png';

const API = '/server/index.php';

const SpinnerIcon = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

const EyeIconOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeIconClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const ServerErrorBox = ({ message }) =>
    message ? (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {message}
        </div>
    ) : null;

const getEmailInputClasses = (hasError) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${hasError ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-500'
    }`;

const getPasswordInputClasses = (hasError) =>
    `w-full px-3 py-2.5 pr-10 border rounded-lg text-sm outline-none transition-colors ${hasError ? 'border-red-400 focus:border-red-500 bg-red-50' : 'border-gray-300 focus:border-purple-500'
    }`;

const LoginPage = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const validate = () => {
        let isValid = true;

        if (!email.trim()) {
            setEmailError('Vui lòng nhập email.');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email không hợp lệ.');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Vui lòng nhập mật khẩu.');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Mật khẩu tối thiểu 6 ký tự.');
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setServerError('');
        if (!validate()) return;
        setLoading(true);

        try {
            const response = await axios.post(API + '?action=login', { email, password });

            ['token', 'role', 'name', 'email', 'industry', 'company', 'avatar', 'rememberMe'].forEach((key) =>
                localStorage.removeItem(key)
            );

            const { token, role, name, industry, company, avatar } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('name', name);
            localStorage.setItem('email', email);
            industry && localStorage.setItem('industry', industry);
            company && localStorage.setItem('company', company);
            avatar && localStorage.setItem('avatar', avatar);

            rememberMe ? localStorage.setItem('rememberMe', 'true') : localStorage.removeItem('rememberMe');

            navigate(role === 'admin' ? '/admin' : role === 'employer' ? '/employer' : '/jobs');
        } catch (err) {
            setServerError(err.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePassword = () => setShowPassword(!showPassword);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
            <div className="w-full max-w-md px-4">

                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <img src={Logo} alt="JobHot Logo" className="h-28 w-auto" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <h1 className="text-2xl font-bold text-center mb-1 text-gray-800">Đăng nhập</h1>
                    <p className="text-center text-gray-500 text-sm mb-6">Chào mừng bạn quay trở lại!</p>

                    <ServerErrorBox message={serverError} />

                    <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">

                        <div className="flex flex-col gap-1">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                className={getEmailInputClasses(!!emailError)}
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(''); setServerError(''); }}
                                autoComplete="email"
                            />
                            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                                <Link to="/forgot-password" className="text-xs text-purple-600 hover:underline">
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className={getPasswordInputClasses(!!passwordError)}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setServerError(''); }}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={handleTogglePassword}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeIconOpen /> : <EyeIconClosed />}
                                </button>
                            </div>

                            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 accent-purple-600 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                                Nhớ tài khoản
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 mt-1 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <SpinnerIcon />}
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>

                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-purple-600 font-medium hover:underline">Đăng ký ngay</Link>
                    </p>

                </div>
            </div>
        </div>
    );
};

export default LoginPage;