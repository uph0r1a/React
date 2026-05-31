import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../assets/img/Logo.png';

// CONFIG
// The base URL for all API calls.
// Every fetch goes to /server/index.php with a different ?action= param.

const API = '/server/index.php';

// COMPONENT: SpinnerIcon
// A small spinning SVG shown inside buttons while a request is in progress.

function SpinnerIcon() {
    return (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
    );
}

// COMPONENT: ServerErrorBox
// Shows a red alert box with a server-side error message.
// Returns nothing if there is no error to show.

function ServerErrorBox({ message }) {
    if (!message) {
        return null;
    }

    return (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {message}
        </div>
    );
}

// HELPER: getInputClasses
// Returns border + background classes for a text input.
// Red border when there is a validation error, purple focus otherwise.

function getInputClasses(hasError) {
    const base = 'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors';

    if (hasError) {
        return base + ' border-red-400 bg-red-50';
    } else {
        return base + ' border-gray-300 focus:border-purple-500';
    }
}

// HELPER: getConfirmInputClasses
// The confirm-password field has three visual states:
//   - Error  → red border
//   - Match  → green border (passwords are identical)
//   - Normal → gray border with purple focus

function getConfirmInputClasses(hasError, confirmValue, passwordValue) {
    const base = 'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors';

    if (hasError) {
        return base + ' border-red-400 bg-red-50';
    }

    if (confirmValue !== '' && confirmValue === passwordValue) {
        return base + ' border-green-400';
    }

    return base + ' border-gray-300 focus:border-purple-500';
}

// HELPER: getDotClasses
// Returns classes for each progress dot shown at the top of the card.
// The current step gets a wider purple dot.
// Past steps get a narrower purple dot.
// Future steps get a narrow gray dot.

function getDotClasses(dotIndex, currentStep) {
    if (dotIndex === currentStep) {
        return 'h-1.5 rounded-full transition-all w-6 bg-purple-600';   // active — wide purple
    }

    if (dotIndex < currentStep) {
        return 'h-1.5 rounded-full transition-all w-1.5 bg-purple-300'; // done — narrow purple
    }

    return 'h-1.5 rounded-full transition-all w-1.5 bg-gray-200';       // future — narrow gray
}


// COMPONENT: Email
// Asks the user for their email address and sends it to the PHP backend.
// If the email exists, the server sends a 6-digit OTP to that address.
// Calls onNext(email) when the server responds with success.
// Props:
//   onNext(email) - called with the submitted email on success

function Email({ onNext }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    //Submit handler
    // Validates the email locally first, then calls the backend.

    async function handleSubmit(event) {
        event.preventDefault();

        // Local validation — check before making a network call
        if (!email.trim()) {
            setError('Vui lòng nhập email.');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email không hợp lệ.');
            return;
        }

        setLoading(true);

        try {
            await axios.post(API + '?action=forgot-password', { email: email });

            // Backend accepted the request — move to the OTP step
            onNext(email);

        } catch (err) {
            let message = 'Có lỗi xảy ra. Thử lại sau.';

            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }

            setError(message);

        } finally {
            setLoading(false);
        }
    }


    //Render

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            {/* Email input field */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Địa chỉ email</label>
                <input
                    type="email"
                    placeholder="example@email.com"
                    className={getInputClasses(!!error)}
                    value={email}
                    onChange={function (e) { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading && <SpinnerIcon />}
                {loading && 'Đang gửi...'}
                {!loading && 'Gửi mã xác nhận'}
            </button>

        </form>
    );
}


// COMPONENT: OTP
// Shows six individual digit boxes for the user to type their OTP code.
// Supports paste, backspace navigation between boxes, and a resend button.
// Calls onNext() when the OTP is verified successfully.
// Props:
//   email     - the email address the OTP was sent to (shown in the hint text)
//   onNext()  - called with no arguments on successful verification
// FIX #1: Pass verification token back to parent

function OTP({ email, onNext }) {
    // "otp" is an array of 6 strings, one per digit box
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);   // seconds until resend is allowed
    const [resendLoading, setResendLoading] = useState(false);

    // "inputs" holds a ref to each of the 6 <input> DOM elements
    // so we can move focus between them programmatically.
    const inputs = useRef([]);


    //Countdown timer
    // Counts down from 60 to 0. When it reaches 0 the "Resend" button appears.
    // Each time countdown changes, a 1-second timeout is set to decrement it again.

    useEffect(function () {
        if (countdown <= 0) {
            return; // stop when we hit 0
        }

        const timer = setTimeout(function () {
            setCountdown(function (current) { return current - 1; });
        }, 1000);

        // Cleanup: cancel the timeout if the component unmounts before it fires
        return function () { clearTimeout(timer); };
    }, [countdown]);


    //handleChange
    // Called every time a digit box value changes.
    // Only accepts a single digit (0–9). Moves focus to the next box automatically.

    function handleChange(index, value) {
        // Reject anything that is not empty or a single digit
        if (!/^\d?$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus to next input if a digit was typed
        if (value !== '' && index < 5) {
            inputs.current[index + 1].focus();
        }
    }

    // handleKeyDown
    // Supports backspace to go to the previous box and paste operations.

    function handleKeyDown(index, event) {
        if (event.key === 'Backspace') {
            event.preventDefault();

            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);

            // Auto-focus to previous input if the current one was not empty
            if (index > 0) {
                inputs.current[index - 1].focus();
            }
        }

        if (event.key === 'ArrowLeft' && index > 0) {
            inputs.current[index - 1].focus();
        }

        if (event.key === 'ArrowRight' && index < 5) {
            inputs.current[index + 1].focus();
        }
    }

    // handlePaste
    // If the user pastes a code (e.g. from email), it fills all 6 boxes.

    function handlePaste(event) {
        event.preventDefault();

        const clipboardData = (event.clipboardData || window.clipboardData).getData('text');
        const digits = clipboardData.replace(/\D/g, '').slice(0, 6);

        if (digits.length > 0) {
            const newOtp = [...otp];

            for (let i = 0; i < digits.length; i++) {
                newOtp[i] = digits[i];
            }

            setOtp(newOtp);

            // Focus on the last digit or the next empty one
            const focusIndex = Math.min(digits.length, 5);
            inputs.current[focusIndex].focus();
        }
    }

    //handleSubmit
    // Called when the user submits the OTP.
    // Validates locally, then calls the PHP backend.

    async function handleSubmit(event) {
        event.preventDefault();

        const code = otp.join('');

        if (code.length !== 6) {
            setError('Vui lòng nhập đầy đủ mã OTP (6 chữ số).');
            return;
        }

        setLoading(true);

        try {
            // Call verify-otp endpoint
            const response = await axios.post(API + '?action=verify-otp', {
                email: email,
                otp: code
            });

            // FIX #1: Get verification token from response
            const verificationToken = response.data.data?.verificationToken;
            
            if (!verificationToken) {
                setError('Không nhận được mã xác minh từ server.');
                setLoading(false);
                return;
            }

            // Call onNext with the verification token
            onNext(verificationToken);

        } catch (err) {
            let message = 'Có lỗi xảy ra. Thử lại sau.';

            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }

            setError(message);

        } finally {
            setLoading(false);
        }
    }

    // handleResend
    // When the countdown reaches 0, this button appears.
    // Calls the forgot-password action again to send a new OTP.

    async function handleResend() {
        setResendLoading(true);

        try {
            await axios.post(API + '?action=forgot-password', { email: email });

            // Reset the countdown and OTP boxes
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
            setError('');

            // Focus back to the first box
            inputs.current[0].focus();

        } catch (err) {
            let message = 'Không thể gửi lại mã. Thử lại sau.';

            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }

            setError(message);

        } finally {
            setResendLoading(false);
        }
    }


    //Render

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <ServerErrorBox message={error} />

            {/* Hint text — tells the user where the code was sent */}
            <p className="text-sm text-gray-600">
                Mã OTP đã được gửi đến <span className="font-medium">{email}</span>
            </p>

            {/* Six digit boxes */}
            <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map(function (index) {
                    return (
                        <input
                            key={index}
                            ref={function (el) { inputs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            placeholder="0"
                            value={otp[index]}
                            onChange={function (e) { handleChange(index, e.target.value); }}
                            onKeyDown={function (e) { handleKeyDown(index, e); }}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg outline-none transition-colors focus:border-purple-500"
                        />
                    );
                })}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading && <SpinnerIcon />}
                {loading && 'Đang xác minh...'}
                {!loading && 'Xác minh mã OTP'}
            </button>

            {/* Resend button — shown only after 60 seconds */}
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
                    {resendLoading && <SpinnerIcon />}
                    {resendLoading && 'Đang gửi...'}
                    {!resendLoading && 'Gửi lại mã OTP'}
                </button>
            )}

        </form>
    );
}


// COMPONENT: NewPassword
// Asks the user for a new password and confirmation.
// Submits both the password and the verification token to reset-password endpoint.
// Props:
//   email                  - the user's email
//   verificationToken      - token received from OTP verification
//   onDone()               - called after successful password reset

function NewPassword({ email, verificationToken, onDone }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [errors, setErrors] = useState({
        password: '',
        confirm: ''
    });

    //handleSubmit

    async function handleSubmit(event) {
        event.preventDefault();

        const updatedErrors = {};

        if (password.length < 8) {
            updatedErrors.password = 'Mật khẩu tối thiểu 8 ký tự.';
        }

        if (password !== confirm) {
            updatedErrors.confirm = 'Mật khẩu không khớp.';
        }

        if (Object.keys(updatedErrors).length > 0) {
            setErrors(updatedErrors);
            return;
        }

        setLoading(true);

        try {
            // FIX #1: Send verification token with password reset request
            await axios.post(API + '?action=reset-password', {
                email: email,
                password: password,
                verificationToken: verificationToken
            });

            // Success — call onDone to move to the success screen
            onDone();

        } catch (err) {
            let message = 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';

            if (err.response && err.response.data && err.response.data.message) {
                message = err.response.data.message;
            }

            setServerError(message);

        } finally {
            setLoading(false);
        }
    }

    function clearError(field) {
        setErrors(function (prev) {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    }

    //Render

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

            <ServerErrorBox message={serverError} />

            {/* New password field */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Mật khẩu mới</label>
                <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className={getInputClasses(!!errors.password)}
                    value={password}
                    onChange={function (e) { setPassword(e.target.value); clearError('password'); }}
                    autoComplete="new-password"
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm password field */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</label>
                <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    className={getConfirmInputClasses(!!errors.confirm, confirm, password)}
                    value={confirm}
                    onChange={function (e) { setConfirm(e.target.value); clearError('confirm'); }}
                    autoComplete="new-password"
                />
                {errors.confirm && (
                    <p className="text-xs text-red-500">{errors.confirm}</p>
                )}
                {!errors.confirm && confirm !== '' && confirm === password && (
                    <p className="text-xs text-green-500">✓ Mật khẩu khớp</p>
                )}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {loading && <SpinnerIcon />}
                {loading && 'Đang lưu...'}
                {!loading && 'Đặt mật khẩu mới'}
            </button>

        </form>
    );
}

// COMPONENT: SuccessScreen
// Shown after the password has been reset successfully.
// Displays a green checkmark and a button to go to the login page.

function SuccessScreen({ onGoToLogin }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
            <div className="w-full max-w-md px-4">
                <div className="bg-white rounded-2xl p-8 shadow-xl text-center">

                    {/* Green checkmark icon */}
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
}

// COMPONENT: BackButton
// The "← Quay lại" button at the top of the form card.
// On Step 0 it navigates back to the login page.
// On Steps 1 and 2 it goes back one step inside the flow.

function BackButton({ step, onBack, onGoToLogin }) {
    let label;
    let handleClick;

    if (step === 0) {
        label = 'Quay lại đăng nhập';
        handleClick = onGoToLogin;
    } else {
        label = 'Quay lại';
        handleClick = onBack;
    }

    return (
        <button
            onClick={handleClick}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-5"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
            </svg>
            {label}
        </button>
    );
}

// COMPONENT: ForgotPasswordPage  (main / entry point)
// Manages the overall password-reset flow across four steps:
// "email" and "verificationToken" are stored here so they can be passed down
// to OTP and NewPassword components.

const ForgotPasswordPage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    // FIX #1: Add verificationToken state
    const [verificationToken, setVerificationToken] = useState('');

    // Each step has its own heading and subtitle shown at the top of the card.
    const stepMeta = [
        { title: 'Quên mật khẩu', subtitle: 'Nhập email để nhận mã xác nhận' },
        { title: 'Xác minh email', subtitle: 'Nhập mã OTP đã gửi đến email' },
        { title: 'Mật khẩu mới', subtitle: 'Tạo mật khẩu mới cho tài khoản' },
    ];


    //Handler: email step done
    // Called by the Email component with the submitted address.
    // Stores the email and advances to the OTP step.

    function handleEmailDone(submittedEmail) {
        setEmail(submittedEmail);
        setStep(1);
    }

    // FIX #1: Handler for OTP done - now receives verification token
    function handleOtpDone(token) {
        setVerificationToken(token);
        setStep(2);
    }

    //Handler: go back one step

    function handleBack() {
        setStep(step - 1);
    }

    // Rendered as a completely separate full-screen layout.

    if (step === 3) {
        return (
            <SuccessScreen onGoToLogin={function () { navigate('/login'); }} />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-purple-600 to-purple-400">
            <div className="w-full max-w-md px-4">

                {/* Site logo + tagline above the card */}
                <div className="text-center mb-6">
                    <Link to="/" className="inline-flex flex-col items-center gap-2">
                        <img src={Logo} alt="JobHot Logo" className="h-28 w-auto" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-xl">

                    {/* Back button — goes to login on step 0, previous step otherwise */}
                    <BackButton
                        step={step}
                        onBack={handleBack}
                        onGoToLogin={function () { navigate('/login'); }}
                    />

                    {/* Progress dots — one dot per step (0, 1, 2) */}
                    {/* Active step: wide purple dot. Done: narrow purple. Future: narrow gray. */}
                    <div className="flex items-center gap-1.5 justify-center mb-6">
                        {[0, 1, 2].map(function (dotIndex) {
                            return (
                                <div key={dotIndex} className={getDotClasses(dotIndex, step)} />
                            );
                        })}
                    </div>

                    {/* Step heading and subtitle */}
                    <h1 className="text-2xl font-bold text-center mb-1 text-gray-800">
                        {stepMeta[step].title}
                    </h1>
                    <p className="text-center text-gray-500 text-sm mb-6">
                        {stepMeta[step].subtitle}
                    </p>

                    {/* Render the correct step component */}
                    {step === 0 && (
                        <Email onNext={handleEmailDone} />
                    )}
                    {step === 1 && (
                        // FIX #1: Pass OTP handler that receives token
                        <OTP email={email} onNext={handleOtpDone} />
                    )}
                    {step === 2 && (
                        // FIX #1: Pass verification token to NewPassword
                        <NewPassword 
                            email={email} 
                            verificationToken={verificationToken}
                            onDone={function () { setStep(3); }} 
                        />
                    )}

                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;