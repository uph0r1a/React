import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/img/Logo.png';
import UserProfileModal from './UserProfileModal';
import SavedJobsModal from './SavedJobsModal';
import AppliedJobsModal from './AppliedJobsModal';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const avatar = localStorage.getItem('avatar');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [savedJobsModalOpen, setSavedJobsModalOpen] = useState(false);
    const [appliedJobsModalOpen, setAppliedJobsModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('email');
        localStorage.removeItem('industry');
        localStorage.removeItem('company');
        localStorage.removeItem('avatar');
        localStorage.removeItem('rememberMe');
        setDropdownOpen(false);
        navigate('/');
    };

    const getDashboardPath = () => {
        if (role === 'admin')
            return '/admin';
        if (role === 'employer')
            return '/employer';
        return '/jobs';
    };

    const handleEditProfile = () => {
        setDropdownOpen(false);
        setProfileModalOpen(true);
    };

    const handleOpenSavedJobs = () => {
        setDropdownOpen(false);
        setSavedJobsModalOpen(true);
    };

    const handleOpenAppliedJobs = () => {
        setDropdownOpen(false);
        setAppliedJobsModalOpen(true);
    };

    let avatarLetter = 'U';

    if (name && name.length > 0) {
        avatarLetter = name.charAt(0).toUpperCase();
    }

    let displayName = 'Tài khoản';

    if (name) {
        displayName = name;
    }

    return (
        <header className="bg-purple-600 w-full shadow-md">
            <div className="flex items-center px-8 py-4 max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2 mr-8">
                    <img src={Logo} alt="JobHot Logo" className="h-24 w-auto" />
                </Link>

                <nav className="grow flex gap-1"></nav>
                <div className="flex items-center gap-3">

                    {token && (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-white/90 px-3 py-2 rounded-lg hover:bg-white/15 transition-colors">
                                {avatar ? (
                                    <img src={avatar} alt={displayName} className="w-9 h-9 rounded-full object-cover border-2 border-white/40" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center text-white text-sm font-bold">{avatarLetter}</div>
                                )}
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-sm">{displayName}</span>
                                    {email && <span className="text-xs text-white/70">{email}</span>}
                                </div>
                                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <div className="font-semibold text-sm text-gray-800">{displayName}</div>
                                        {email && <div className="text-xs text-gray-500 mt-0.5">{email}</div>}
                                    </div>

                                    <div className="py-2">
                                        {role === 'user' && (
                                            <>
                                                <button onClick={handleEditProfile} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Chỉnh sửa thông tin
                                                </button>

                                                <button onClick={handleOpenSavedJobs} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                                    </svg>
                                                    Việc làm đã lưu
                                                </button>

                                                <button onClick={handleOpenAppliedJobs} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Việc đã ứng tuyển
                                                </button>

                                                <div className="my-1 border-t border-gray-100"></div>
                                            </>
                                        )}

                                        {(role === 'admin' || role === 'employer') && (
                                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-3" onClick={() => {
                                                setDropdownOpen(false);
                                                navigate(getDashboardPath());
                                            }}>
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                </svg>
                                                Dashboard
                                            </button>
                                        )}

                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {!token && (
                        <>
                            <Link to="/login" className="bg-white text-purple-600 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-sm">Đăng nhập</Link>
                            <Link to="/register" className="bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors shadow-sm">Đăng ký</Link>
                        </>
                    )}
                </div>

                <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} userName={name} userEmail={email} />
                <SavedJobsModal isOpen={savedJobsModalOpen} onClose={() => setSavedJobsModalOpen(false)} />
                <AppliedJobsModal isOpen={appliedJobsModalOpen} onClose={() => setAppliedJobsModalOpen(false)} />
            </div>
        </header>
    );
};

export default Header;