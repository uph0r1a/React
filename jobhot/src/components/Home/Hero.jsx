import { useState, useEffect } from 'react';

const API = '/server/index.php';

const Hero = ({ onSearch }) => {
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [stats, setStats] = useState([
        { number: '...', label: 'Việc làm' },
        { number: '...', label: 'Công ty' },
        { number: '...', label: 'Ứng viên' },
    ]);
    const hotKeywords = ['Lập trình viên', 'Marketing', 'Kế toán', 'Thiết kế UX/UI', 'Data Analyst'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(API + '?action=get-stats');
                const data = await response.json();
                if (data.success && data.data) {
                    setStats([
                        { number: data.data.jobs + '+', label: 'Việc làm' },
                        { number: data.data.companies + '+', label: 'Công ty' },
                        { number: data.data.candidates + '+', label: 'Ứng viên' },
                    ]);
                }
            } catch {
                // Keep fallback values if stats endpoint not available
            }
        };
        fetchStats();
    }, []);

    const handleSearch = async () => {
        try {
            let query = 'action=get-jobs';
            if (keyword.trim()) query += '&keyword=' + encodeURIComponent(keyword.trim());
            if (location.trim()) query += '&location=' + encodeURIComponent(location.trim());
            const response = await fetch(API + '?' + query);
            const data = await response.json();
            if (data.success && onSearch) {
                onSearch(data.data?.jobs || data.jobs || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleHotKeyword = (kw) => {
        setKeyword(kw);
    };

    return (
        <section className="bg-linear-to-br from-purple-700 via-purple-600 to-purple-500 text-white py-14 px-4 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="max-w-7xl mx-auto relative">
                <div className="max-w-2xl mb-2">
                    <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs font-medium mb-4">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Hàng nghìn việc làm mới mỗi ngày
                    </div>
                    <h1 className="font-bold text-4xl leading-tight mb-3">
                        Tìm việc làm nhanh 24h,<br />
                        <span className="text-yellow-300">việc làm mới nhất</span> trên toàn quốc
                    </h1>
                    <p className="text-purple-100 text-base opacity-90 mb-8">Tiếp cận hàng nghìn tin tuyển dụng từ các doanh nghiệp uy tín tại Việt Nam</p>
                </div>

                <div className="bg-white rounded-xl p-3 flex gap-3 items-center flex-wrap shadow-xl max-w-4xl">
                    <div className="flex-1 min-w-48 flex items-center gap-2 border-r border-gray-200 pr-3">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                            placeholder="Vị trí tuyển dụng, kỹ năng..."
                        />
                    </div>

                    <div className="flex-1 min-w-40 flex items-center gap-2">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
                            placeholder="Địa điểm làm việc..."
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="bg-purple-600 text-white px-7 py-2.5 rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                        🔍 Tìm việc
                    </button>
                </div>

                <div className="flex gap-2 mt-5 flex-wrap items-center">
                    <span className="text-purple-200 text-xs font-medium">Tìm kiếm phổ biến:</span>
                    {hotKeywords.map((kw) => (
                        <button key={kw} onClick={() => handleHotKeyword(kw)} className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-xs transition-colors border border-white/20">{kw}</button>
                    ))}
                </div>

                <div className="flex gap-8 mt-8 flex-wrap">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <div className="text-2xl font-bold text-yellow-300">{stat.number}</div>
                            <div className="text-purple-200 text-xs mt-0.5">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
