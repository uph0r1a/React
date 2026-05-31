import { useState } from 'react';
import Header from '../components/Home/Header';
import Footer from '../components/Home/Footer';

const MAPS_EMBED = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.924408763377!2d105.8164289759182!3d21.035710387538565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab0d6e603741%3A0x208a848932ac2109!2sAptech%20Computer%20Education!5e0!3m2!1sen!2s!4v1779798969515!5m2!1sen!2s"
const API = '/server/index.php';

const StarRating = ({ rating, setRating }) => {
    const [hovered, setHovered] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hovered || rating);

                return (
                    <button key={star} type="button" onClick={() => { setRating(star); }} onMouseEnter={() => { setHovered(star); }} onMouseLeave={() => { setHovered(0); }} className="text-3xl transition-transform hover:scale-110 focus:outline-none" aria-label={star + ' sao'}>
                        <span className={filled ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    </button>
                );
            })}
        </div>
    );
};

const RATING_LABELS = [
    '',
    'Tệ',
    'Không tốt',
    'Bình thường',
    'Tốt',
    'Tuyệt vời!'
];

const ContactPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [sendError, setSendError] = useState('');
    const [rating, setRating] = useState(0);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);

    const validateForm = () => {
        const errs = {};

        if (!name.trim()) {
            errs.name = 'Vui lòng nhập họ và tên.';
        }

        if (!email.trim()) {
            errs.email = 'Vui lòng nhập email.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errs.email = 'Email không hợp lệ.';
        }

        if (!message.trim()) {
            errs.message = 'Vui lòng nhập nội dung.';
        }

        setFormErrors(errs);

        return Object.keys(errs).length === 0;
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setSendError('');

        if (!validateForm())
            return;

        setSending(true);

        try {
            await fetch(API + '?action=contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                }),
            });

            setSent(true);
        } catch (_) {
            setSent(true);
        } finally {
            setSending(false);
        }
    };

    const handleRatingSubmit = async () => {
        if (rating === 0)
            return;

        setRatingSubmitted(true);

        try {
            await fetch(API + '?action=submit-rating', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ rating }),
            });
        } catch (_) {
        }
    };

    const inputCls = (hasErr) => {
        const base = 'w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition-colors';

        return hasErr ? base + ' border-red-400 bg-red-50' : base + ' border-gray-300 focus:border-purple-500';
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="bg-linear-to-r from-purple-700 to-purple-500 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-2">Liên hệ với chúng tôi</h1>
                    <p className="text-purple-200 text-sm">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-10 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-bold text-gray-800 mb-4">Thông tin liên hệ</h2>
                            <div className="flex flex-col gap-3 text-sm text-gray-600">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">📍</span>

                                    <div>
                                        <p className="font-medium text-gray-800">Địa chỉ</p>
                                        <p>
                                            Tòa nhà APTECH, 285 Đội Cấn,
                                            <br />
                                            Ngọc Hà, Hà Nội</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">📧</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Email</p>
                                        <a href="mailto:jobhot@gmail.com" className="text-purple-600 hover:underline">jobhot@gmail.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">📞</span>
                                    <div>
                                        <p className="font-medium text-gray-800">Hotline</p>
                                        <a href="tel:0987654321" className="text-purple-600 hover:underline">0987 654 321</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-xl mt-0.5">🕐</span>

                                    <div>
                                        <p className="font-medium text-gray-800">Giờ làm việc</p>
                                        <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                                        <p>Thứ 7: 8:00 - 12:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <iframe title="JobHot Location" src={MAPS_EMBED} width="100%" height="260" style={{ border: 0 }} allowFullScreenloading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-base font-bold text-gray-800 mb-2">Đánh giá website</h2>
                            <p className="text-sm text-gray-500 mb-4">Trải nghiệm của bạn với JobHot như thế nào?</p>

                            {ratingSubmitted ? (
                                <div className="text-center py-3">
                                    <div className="text-3xl mb-2">🎉</div>
                                    <p className="text-green-600 font-semibold text-sm">Cảm ơn bạn đã đánh giá!</p>
                                    <p className="text-gray-400 text-xs mt-1">Bạn chấm {rating}/5 sao</p>
                                </div>
                            ) : (
                                <div>
                                    <StarRating rating={rating} setRating={setRating} />

                                    {rating > 0 && (
                                        <p className="text-sm text-purple-600 font-medium mt-1">{RATING_LABELS[rating]}</p>
                                    )}

                                    <button onClick={handleRatingSubmit} disabled={rating === 0} className="mt-4 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Gửi đánh giá</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
                        <h2 className="text-base font-bold text-gray-800 mb-1">Gửi phản hồi</h2>
                        <p className="text-sm text-gray-500 mb-5">Điền thông tin bên dưới — chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>

                        {sent ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
                                <h3 className="text-lg font-bold text-gray-800 mb-1">Đã gửi thành công!</h3>
                                <p className="text-sm text-gray-500">Chúng tôi đã nhận được phản hồi của bạn và sẽ liên hệ lại sớm nhất.</p>

                                <button
                                    onClick={() => {
                                        setSent(false);
                                        setName('');
                                        setEmail('');
                                        setMessage('');
                                    }}
                                    className="mt-4 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">Gửi phản hồi khác</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSend} noValidateclassName="flex flex-col gap-4">
                                {sendError && (
                                    <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{sendError}</div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Họ và tên{' '}
                                        <span className="text-red-400">*</span>
                                    </label>

                                    <input type="text" value={name} onChange={(e) => {
                                        setName(e.target.value);
                                        setFormErrors({
                                            ...formErrors,
                                            name: ''
                                        });
                                    }}
                                        className={inputCls(!!formErrors.name)} placeholder="Nguyễn Văn A" />

                                    {formErrors.name && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Email{' '}
                                        <span className="text-red-400">*</span>
                                    </label>

                                    <input type="email" value={email} onChange={(e) => {
                                        setEmail(e.target.value);

                                        setFormErrors({
                                            ...formErrors,
                                            email: ''
                                        });
                                    }}
                                        className={inputCls(!!formErrors.email)} placeholder="example@email.com" />

                                    {formErrors.email && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">Tiêu đề</label>

                                    <input type="text" className={inputCls(false)} placeholder="Tiêu đề phản hồi (tuỳ chọn)" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                                        Nội dung{' '}
                                        <span className="text-red-400">*</span>
                                    </label>

                                    <textarea rows={5} value={message} onChange={(e) => {
                                        setMessage(e.target.value);

                                        setFormErrors({
                                            ...formErrors,
                                            message: ''
                                        });
                                    }}
                                        className={inputCls(!!formErrors.message) + ' resize-none'} placeholder="Nhập nội dung phản hồi của bạn..." />

                                    {formErrors.message && (
                                        <p className="text-xs text-red-500 mt-1">{formErrors.message}</p>
                                    )}
                                </div>

                                <button type="submit" disabled={sending} className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {sending && (
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    )}

                                    {sending ? 'Đang gửi...' : '📨 Gửi phản hồi'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactPage;