import { useState, useEffect } from 'react';
import JobCard from './JobCard';

const API = '/server/index.php';

const fetchSavedJobIds = async () => {
    const token = localStorage.getItem('token');
    if (!token) return new Set();
    try {
        const res = await fetch(`${API}?action=get-saved-jobs`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (data.success) return new Set((data.data?.jobs ?? data.jobs ?? []).map((j) => j.id));
    } catch { }
    return new Set();
};

const SectionHeader = ({ title, link }) => (
    <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-600 rounded-full block" />
            <h2 className="font-bold text-lg text-gray-800">{title}</h2>
        </div>
        <a href={link} className="text-sm text-purple-600 hover:text-purple-700 font-medium hover:underline no-underline">Xem tất cả →</a>
    </div>
);

const FilteredResults = ({ jobs, savedIds }) =>
    jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-base font-semibold text-gray-600 mb-2">Không tìm thấy việc làm phù hợp</div>
            <div className="text-sm">Thử thay đổi bộ lọc để xem thêm kết quả</div>
        </div>
    ) : (
        <div>
            <p className="text-sm text-gray-500 mb-5">Tìm thấy <span className="font-semibold text-gray-800">{jobs.length}</span> việc làm phù hợp</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map((job) => <JobCard key={job.id} job={job} initialSaved={savedIds.has(job.id)} />)}
            </div>
        </div>
    );

const DefaultResults = ({ onFilter, savedIds }) => {
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userIndustry, setUserIndustry] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchJobs = async () => {
            try {
                const response = await fetch(token ? `${API}?action=get-jobs-by-industry` : `${API}?action=get-jobs`, token ? { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } } : undefined);
                const data = await response.json();

                if (data.success) {
                    setJobs(data.data?.jobs ?? data.jobs ?? []);
                    data.data?.industry && setUserIndustry(data.data.industry);
                }
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API}?action=get-categories`);
                const data = await response.json();
                if (data.success) setCategories(data.data?.categories ?? data.categories ?? []);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategories([]);
            }
        };

        fetchJobs();
        fetchCategories();
    }, []);

    const featuredJobs = jobs.slice(0, 3);

    const handleCategoryClick = async (categoryLabel) => {
        try {
            const response = await fetch(`/server/index.php?action=get-jobs&category=${encodeURIComponent(categoryLabel)}`);
            const data = await response.json();
            data.success && onFilter?.(data.data?.jobs ?? data.jobs ?? []);
        } catch (error) {
            console.error('Error filtering by category:', error);
        }
    };

    return loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="text-gray-400">Đang tải...</div>
        </div>
    ) : (
        <div>
            <div className="w-full h-44 rounded-xl bg-linear-to-r from-blue-600 to-indigo-700 mb-8 flex flex-col items-center justify-center text-white relative overflow-hidden shadow-md">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute -left-4 -bottom-6 w-28 h-28 bg-white/10 rounded-full" />
                <div className="text-4xl font-black tracking-tight relative">JobHot</div>
                <div className="text-blue-200 text-sm mt-1 relative">Tuyển dụng & tìm việc - Nhanh - Đúng - Chuẩn</div>
                {userIndustry && <div className="text-blue-100 text-xs mt-2 relative bg-white/20 px-3 py-1 rounded-full">🎯 Việc làm phù hợp với ngành: {userIndustry}</div>}
            </div>

            <div className="grid grid-cols-4 gap-3 mb-8">
                {categories.map((cat) => (
                    <button key={cat.label} onClick={() => handleCategoryClick(cat.label)} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-2 hover:border-purple-300 hover:shadow-sm transition-all group cursor-pointer">
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="text-xs font-semibold text-gray-700 group-hover:text-purple-700">{cat.label}</div>
                        <div className="text-xs text-gray-400">{cat.count} việc</div>
                    </button>
                ))}
            </div>

            <SectionHeader title={userIndustry ? `Việc làm phù hợp với bạn (${userIndustry})` : "Việc làm tốt nhất"} link="/jobs" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {jobs.map((job) => <JobCard key={job.id} job={job} initialSaved={savedIds.has(job.id)} />)}
            </div>

            {featuredJobs.length > 0 && (
                <>
                    <SectionHeader title="Việc làm hấp dẫn" link="/jobs/featured" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {featuredJobs.map((job) => <JobCard key={job.id} job={job} initialSaved={savedIds.has(job.id)} />)}
                    </div>
                </>
            )}
        </div>
    );
};

const JobList = ({ filteredJobs, onFilter }) => {
    const [savedIds, setSavedIds] = useState(new Set());

    useEffect(() => { fetchSavedJobIds().then((ids) => setSavedIds(ids)); }, []);

    return <div className="flex-1">{filteredJobs === null ? <DefaultResults onFilter={onFilter} savedIds={savedIds} /> : <FilteredResults jobs={filteredJobs} savedIds={savedIds} />}</div>;
};

export default JobList;