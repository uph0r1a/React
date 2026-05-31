import { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
    'Công nghệ thông tin',
    'Marketing / PR',
    'Thiết kế',
    'Kế toán / Kiểm toán',
    'Kinh doanh / Bán hàng',
    'Nhân sự',
    'Dịch vụ khách hàng',
];

const API = '/server/index.php';

const UserProfileModal = ({ isOpen, onClose, userName, userEmail }) => {
    const [profile, setProfile] = useState({
        name: userName || 'Người dùng',
        dob: '',
        gender: 'Nam',
        phone: '',
        address: '',
        email: userEmail || 'user@email.com',
        position: '',
        experience: 'Không yêu cầu',
        skills: '',
        industry: 'Công nghệ thông tin',
        jobType: 'Full-time',
        bio: '',
    });
    const [cvFile, setCvFile] = useState(null);
    const [existingCvName, setExistingCvName] = useState(null);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fileRef = useRef();

    // Load user profile data when modal opens
    useEffect(() => {
        if (isOpen) {
            loadUserProfile();
        }
    }, [isOpen]);

    const loadUserProfile = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Bạn cần đăng nhập để xem thông tin.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API}?action=get-user-profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                const user = data.data;
                setProfile({
                    name: user.full_name || userName || 'Người dùng',
                    dob: user.dob || '',
                    gender: user.gender || 'Nam',
                    phone: user.phone || '',
                    address: user.address || '',
                    email: user.email || userEmail || 'user@email.com',
                    position: user.position || '',
                    experience: user.experience || 'Không yêu cầu',
                    skills: user.skills || '',
                    industry: user.industry || 'Công nghệ thông tin',
                    jobType: 'Full-time', // This field is not in DB yet
                    bio: user.bio || '',
                });
                if (user.cv_name) {
                    setExistingCvName(user.cv_name);
                }
            } else {
                // If no profile data, use default values with userName and userEmail
                setProfile(prev => ({
                    ...prev,
                    name: userName || 'Người dùng',
                    email: userEmail || 'user@email.com'
                }));
            }
        } catch (err) {
            console.error('Load profile error:', err);
            setError('Không thể tải thông tin người dùng.');
        } finally {
            setLoading(false);
        }
    };

    const setField = (key, value) => {
        setProfile(prev => ({ ...prev, [key]: value }));
    };

    /** Convert a File to base64 string */
    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // data:<mime>;base64,<data>
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            const token = localStorage.getItem('token');

            // Build the JSON payload
            const payload = {
                name: profile.name,
                phone: profile.phone,
                dob: profile.dob,
                gender: profile.gender,
                address: profile.address,
                email: profile.email,
                position: profile.position,
                experience: profile.experience,
                skills: profile.skills,
                industry: profile.industry,
                jobType: profile.jobType,
                bio: profile.bio,
            };

            // Attach CV as base64 if the user selected one
            if (cvFile) {
                const MAX_CV_SIZE = 5 * 1024 * 1024; // 5 MB
                if (cvFile.size > MAX_CV_SIZE) {
                    setError('File CV không được vượt quá 5 MB.');
                    setSaving(false);
                    return;
                }
                payload.cv = await fileToBase64(cvFile);
                payload.cvName = cvFile.name;
            }

            const response = await fetch(`${API}?action=update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.success) {
                setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
                setSaving(false);
                return;
            }

            // Sync updated values back to localStorage so Header refreshes
            if (data.data?.name) localStorage.setItem('name', data.data.name);
            if (data.data?.email) localStorage.setItem('email', data.data.email);
            if (data.data?.avatar !== undefined) {
                if (data.data.avatar) localStorage.setItem('avatar', data.data.avatar);
                else localStorage.removeItem('avatar');
            }

            setSaved(true);
            setCvFile(null);
            setTimeout(() => {
                setSaved(false);
                onClose();
                // Reload so Header picks up new name/email from localStorage
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error('Update profile error:', err);
            setError('Không thể kết nối tới máy chủ. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleClickUpload = () => {
        if (fileRef.current) {
            fileRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        setCvFile(e.target.files[0] || null);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getInitials = (name) => {
        const words = name.split(' ');
        const lastTwo = words.slice(-2);
        return lastTwo.map(w => w[0]).join('').toUpperCase();
    };

    if (!isOpen)
        return null;

    const inputStyle = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500';
    const textareaStyle = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-purple-500 resize-vertical font-sans';

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-linear-to-r from-purple-600 to-purple-500">
                    <h2 className="text-xl font-bold text-white">Chỉnh sửa thông tin cá nhân</h2>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors text-2xl leading-none">x</button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <svg className="animate-spin w-10 h-10 text-purple-600 mb-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <div className="text-gray-500">Đang tải thông tin...</div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">{getInitials(profile.name)}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{profile.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">{profile.position || 'Chưa cập nhật vị trí'} · {profile.experience}</p>
                                </div>
                            </div>

                            {/* Error banner */}
                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <form onSubmit={handleSave} className="flex flex-col gap-5">

                                <div>
                                    <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Thông tin cá nhân</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
                                            <input type="text" value={profile.name} onChange={e => setField('name', e.target.value)} className={inputStyle} required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                                            <input type="email" value={profile.email} onChange={e => setField('email', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                            <input type="tel" value={profile.phone} onChange={e => setField('phone', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày sinh</label>
                                            <input type="date" value={profile.dob} onChange={e => setField('dob', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới tính</label>
                                            <select value={profile.gender} onChange={e => setField('gender', e.target.value)} className={inputStyle}>
                                                <option>Nam</option>
                                                <option>Nữ</option>
                                                <option>Khác</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ</label>
                                            <input type="text" value={profile.address} onChange={e => setField('address', e.target.value)} className={inputStyle} />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Thông tin nghề nghiệp</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vị trí mong muốn</label>
                                            <input type="text" value={profile.position} onChange={e => setField('position', e.target.value)} className={inputStyle} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kinh nghiệm</label>
                                            <select value={profile.experience} onChange={e => setField('experience', e.target.value)} className={inputStyle}>
                                                <option>Không yêu cầu</option>
                                                <option>Dưới 1 năm</option>
                                                <option>1-2 năm</option>
                                                <option>2-3 năm</option>
                                                <option>3-5 năm</option>
                                                <option>Trên 5 năm</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngành nghề</label>
                                            <select value={profile.industry} onChange={e => setField('industry', e.target.value)} className={inputStyle}>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại công việc mong muốn</label>
                                            <select value={profile.jobType} onChange={e => setField('jobType', e.target.value)} className={inputStyle}>
                                                <option>Full-time</option>
                                                <option>Part-time</option>
                                                <option>Freelancer</option>
                                                <option>Thực tập</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Kỹ năng
                                        <span className="text-gray-400 font-normal"> (phân cách bằng dấu phẩy)</span>
                                    </label>
                                    <input value={profile.skills} onChange={e => setField('skills', e.target.value)} placeholder="React, Node.js, Python..." className={inputStyle} />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                            <span key={s} className="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giới thiệu bản thân</label>
                                    <textarea value={profile.bio} onChange={e => setField('bio', e.target.value)} rows={4} className={textareaStyle} />
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-4 pb-2 border-b border-gray-100">Upload CV</h3>
                                    <div onClick={handleClickUpload} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-500 transition-colors">
                                        {cvFile ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-2xl">📄</div>
                                                <div className="text-purple-600 font-medium text-sm">{cvFile.name}</div>
                                                <div className="text-xs text-gray-400">{(cvFile.size / 1024).toFixed(0)} KB — nhấn để đổi file</div>
                                            </div>
                                        ) : existingCvName ? (
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="text-2xl">📄</div>
                                                <div className="text-green-600 font-medium text-sm">{existingCvName}</div>
                                                <div className="text-xs text-gray-400">CV hiện tại — nhấn để thay thế</div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-4xl mb-2">📤</div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">Tải CV lên</div>
                                                <div className="text-xs text-gray-400">PDF, DOC, DOCX - tối đa 5MB</div>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50">Hủy</button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Đang lưu...
                                            </>
                                        ) : saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;