import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/img/Logo.png';

const API = '/server/index.php';
const INDUSTRIES = [
    'Công nghệ thông tin',
    'Marketing / PR',
    'Thiết kế',
    'Kế toán / Kiểm toán',
    'Kinh doanh / Bán hàng',
    'Nhân sự',
    'Dịch vụ khách hàng',
    'Xây dựng',
    'Giáo dục / Đào tạo',
    'Y tế / Dược',
    'Logistics / Vận tải',
    'Khác',
];

const strengthConfig = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Yếu', color: 'bg-red-400' },
    { label: 'Trung bình', color: 'bg-yellow-400' },
    { label: 'Tốt', color: 'bg-blue-400' },
    { label: 'Mạnh', color: 'bg-green-500' },
];

const getPasswordStrength = (password) =>
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

const getInputClasses = (hasError) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-purple-500'
    }`;

const getConfirmInputClasses = (hasError, confirmValue, passwordValue) => {
    const base = 'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors';

    return hasError
        ? `${base} border-red-400 bg-red-50`
        : confirmValue !== '' && confirmValue === passwordValue
            ? `${base} border-green-400`
            : `${base} border-gray-300 focus:border-purple-500`;
};

const getRoleCardClasses = (isSelected) =>
    `flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
    }`;

const getRoleLabelClasses = (isSelected) =>
    `font-semibold text-sm ${isSelected ? 'text-purple-700' : 'text-gray-800'}`;

const getStepCircleClasses = (isDone, isActive) =>
    `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
    }`;

const getStepLabelClasses = (isActive) =>
    `text-xs ${isActive ? 'text-purple-600 font-medium' : 'text-gray-400'}`;

const getConnectorClasses = (leftStepIsDone) =>
    `w-8 h-px ${leftStepIsDone ? 'bg-green-400' : 'bg-gray-200'}`;

const SpinnerIcon = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

const StrengthBar = ({ password }) => {
    if (!password) return null;

    const score = getPasswordStrength(password);

    return (
        <div className="mt-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((barIndex) => (
                    <div
                        key={barIndex}
                        className={`h-1 flex-1 rounded-full transition-colors ${barIndex <= score ? strengthConfig[score].color : 'bg-gray-200'}`}
                    />
                ))}
            </div>

            {score > 0 && (
                <p className="text-xs mt-1 text-gray-500">
                    Độ mạnh: <span className="font-medium">{strengthConfig[score].label}</span>
                </p>
            )}
        </div>
    );
};

const ServerErrorBox = ({ message }) =>
    message ? (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{message}</div>
    ) : null;

const StepInfo = ({ onNext }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [errors, setErrors] = useState({});
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarBase64, setAvatarBase64] = useState('');

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert('Vui lòng chọn tệp ảnh (JPG, PNG, ...).');
        if (file.size > 2 * 1024 * 1024) return alert('Ảnh tối đa 2 MB.');

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const MAX = 400;
                let w = img.width;
                let h = img.height;

                if (w > MAX || h > MAX) {
                    w > h ? (h = Math.round(h * MAX / w), w = MAX) : (w = Math.round(w * MAX / h), h = MAX);
                }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const resized = canvas.toDataURL('image/jpeg', 0.8);
                setAvatarPreview(resized);
                setAvatarBase64(resized);
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const newErrors = {};

        if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên.';

        if (!email.trim()) newErrors.email = 'Vui lòng nhập email.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ.';

        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu.';
        else if (password.length < 8) newErrors.password = 'Mật khẩu tối thiểu 8 ký tự.';

        if (!confirm) newErrors.confirm = 'Vui lòng xác nhận mật khẩu.';
        else if (confirm !== password) newErrors.confirm = 'Mật khẩu không khớp.';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (validate()) onNext({ fullName, email, password, avatar: avatarBase64 });
    };

    const clearError = (fieldName) => {
        const { [fieldName]: _, ...rest } = errors;
        setErrors(rest);
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <ServerErrorBox message="" />

            <div className="flex flex-col items-center gap-2">
                <div className="relative">
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-purple-400 shadow" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-purple-100 border-2 border-dashed border-purple-300 flex items-center justify-center text-3xl select-none">👤</div>
                    )}
                    <label htmlFor="avatarInput" className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow transition-colors" title="Chọn ảnh đại diện">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input id="avatarInput" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                </div>
                <p className="text-xs text-gray-400">Ảnh đại diện <span className="text-gray-300">(tuỳ chọn, tối đa 2 MB)</span></p>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                <input type="text" placeholder="Nguyễn Văn A" className={getInputClasses(!!errors.fullName)} value={fullName} onChange={(e) => { setFullName(e.target.value); clearError('fullName'); }} autoComplete="name" />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input type="email" placeholder="example@email.com" className={getInputClasses(!!errors.email)} value={email} onChange={(e) => { setEmail(e.target.value); clearError('email'); }} autoComplete="email" />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <input type="password" placeholder="Tối thiểu 8 ký tự" className={getInputClasses(!!errors.password)} value={password} onChange={(e) => { setPassword(e.target.value); clearError('password'); }} autoComplete="new-password" />
                <StrengthBar password={password} />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                <input type="password" placeholder="Nhập lại mật khẩu" className={getConfirmInputClasses(!!errors.confirm, confirm, password)} value={confirm} onChange={(e) => { setConfirm(e.target.value); clearError('confirm'); }} autoComplete="new-password" />
                {errors.confirm ? (
                    <p className="text-xs text-red-500">{errors.confirm}</p>
                ) : confirm !== '' && confirm === password ? (
                    <p className="text-xs text-green-500">✓ Mật khẩu khớp</p>
                ) : null}
            </div>

            <button type="submit" className="w-full py-2.5 mt-1 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">Tiếp theo →</button>
        </form>
    );
};

const StepRole = ({ onBack, onSubmit, loading, serverError }) => {
    const [role, setRole] = useState('');
    const [industry, setIndustry] = useState('');
    const [company, setCompany] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!role) return setError('Vui lòng chọn loại tài khoản.');

        onSubmit({ role, industry, company });
    };

    const handleSelectUser = () => { setRole('job_seeker'); setError(''); };
    const handleSelectEmployer = () => { setRole('employer'); setError(''); };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <ServerErrorBox message={serverError} />

            <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                    Bạn đang tìm kiếm gì trên JobHot?
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={handleSelectUser} className={getRoleCardClasses(role === 'job_seeker')}>
                        <span className="text-4xl">🧑‍💼</span>
                        <div className="text-center">
                            <div className={getRoleLabelClasses(role === 'job_seeker')}>Người tìm việc</div>
                            <div className="text-xs text-gray-500 mt-1">Tìm kiếm cơ hội nghề nghiệp</div>
                        </div>
                        {role === 'job_seeker' && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">✓</div>
                        )}
                    </button>

                    <button type="button" onClick={handleSelectEmployer} className={getRoleCardClasses(role === 'employer')}>
                        <span className="text-4xl">🏢</span>
                        <div className="text-center">
                            <div className={getRoleLabelClasses(role === 'employer')}>Nhà tuyển dụng</div>
                            <div className="text-xs text-gray-500 mt-1">Đăng tin và tìm ứng viên</div>
                        </div>
                        {role === 'employer' && (
                            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs">✓</div>
                        )}
                    </button>
                </div>

                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            </div>

            {role === 'job_seeker' && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        Ngành nghề quan tâm{' '}
                        <span className="text-gray-400 font-normal">(để nhận gợi ý việc phù hợp)</span>
                    </label>
                    <select value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 bg-white text-gray-700">
                        <option value="">-- Chọn ngành nghề --</option>
                        {INDUSTRIES.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                </div>
            )}

            {role === 'employer' && (
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        Tên công ty{' '}
                        <span className="text-gray-400 font-normal">(tuỳ chọn)</span>
                    </label>
                    <input type="text" placeholder="Ví dụ: FPT Software, MOMO..." value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500" />
                    <p className="text-xs text-gray-400">Bạn có thể cập nhật thông tin này sau trong hồ sơ công ty.</p>
                </div>
            )}

            <div className="flex gap-3 pt-1">
                <button type="button" onClick={onBack} className="flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50 transition-colors">← Quay lại</button>

                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">{loading ? <><SpinnerIcon />Đang tạo tài khoản...</> : 'Hoàn tất đăng ký'}</button>
            </div>

        </form>
    );
};

const ProgressBar = ({ currentStep }) => {
    const stepLabels = ['Thông tin', 'Loại tài khoản'];

    return (
        <div className="flex items-center justify-center gap-2 mb-6">
            {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const isDone = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;
                const isLastStep = index === stepLabels.length - 1;

                return (
                    <div key={stepNumber} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className={getStepCircleClasses(isDone, isActive)}>{isDone ? '✓' : stepNumber}</div>
                            <span className={getStepLabelClasses(isActive)}>{label}</span>
                        </div>

                        {!isLastStep && <div className={getConnectorClasses(isDone)} />}
                    </div>
                );
            })}
        </div>
    );
};

const SuccessScreen = ({ fullName, onGoToLogin }) => (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
        <div className="w-full max-w-md px-4">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>

                <p className="text-gray-500 text-sm mb-6">Chào mừng <span className="font-medium text-gray-700">{fullName}</span> đến với JobHot!</p>

                <button onClick={onGoToLogin} className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer" >Đăng nhập ngay</button>
            </div>
        </div>
    </div>
);

const RegisterPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [basicInfo, setBasicInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    const handleStep1Done = (info) => {
        setBasicInfo(info);
        setStep(2);
    };

    const handleFinalSubmit = async (roleData) => {
        setLoading(true);
        setServerError('');

        try {
            await axios.post(API + '?action=register', {
                fullName: basicInfo.fullName,
                email: basicInfo.email,
                password: basicInfo.password,
                role: roleData.role,
                industry: roleData.industry,
                company: roleData.company,
                avatar: basicInfo.avatar,
            });

            setStep(3);
        } catch (err) {
            setServerError(err.response?.data?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return <SuccessScreen fullName={basicInfo?.fullName ?? ''} onGoToLogin={() => navigate('/login')} />;
    }

    const headingText = step === 1 ? 'Tạo tài khoản' : 'Bạn là ai?';
    const subtitleText = step === 1 ? 'Miễn phí hoàn toàn, mãi mãi' : 'Giúp chúng tôi cá nhân hoá trải nghiệm của bạn';

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400 py-8">
            <div className="w-full max-w-md px-4">
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <img src={Logo} alt="JobHot Logo" className="h-28 w-auto" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl">
                    <ProgressBar currentStep={step} />

                    <h1 className="text-2xl font-bold text-center mb-1 text-gray-800">{headingText}</h1>
                    <p className="text-center text-gray-500 text-sm mb-6">{subtitleText}</p>

                    {step === 1 && <StepInfo onNext={handleStep1Done} />}

                    {step === 2 && (<StepRole onBack={() => setStep(1)} onSubmit={handleFinalSubmit} loading={loading} serverError={serverError} />)}

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-purple-600 font-medium hover:underline">Đăng nhập</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;