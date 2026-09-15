import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Home/Header';
import Footer from '../components/Home/Footer';

const API = '/server/index.php';

const getApplyButtonClasses = (applied) =>
    `flex-1 py-3 rounded-lg font-semibold transition-all ${applied ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
    }`;

const getStickyApplyButtonClasses = (applied) =>
    `w-full mt-6 py-3 rounded-lg font-semibold transition-all ${applied ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
    }`;

const getApplyButtonLabel = (applied) => applied ? '✓ Đã ứng tuyển' : 'Ứng tuyển ngay';

const getSaveButtonClasses = (saved) =>
    `px-6 py-3 rounded-lg font-semibold border-2 transition-all ${saved ? 'border-red-500 text-red-500 bg-red-50' : 'border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600'
    }`;

const getSaveButtonLabel = (saved) => saved ? '❤️ Đã lưu' : '🤍 Lưu';

const getUrgentIcon = (daysLeft) => daysLeft <= 7 ? '⚠️' : '⏳';

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <span className="text-2xl">{icon}</span>
        <div>
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-sm font-semibold text-gray-800">{value}</div>
        </div>
    </div>
);

const Section = ({ icon, title, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        {children}
    </div>
);

const CompanyLogo = ({ logo, companyName }) =>
    logo ? (
        <img src={logo} alt={companyName} className="w-full h-full object-cover rounded-xl" />
    ) : (
        <span className="text-3xl font-bold text-purple-600">{companyName.charAt(0)}</span>
    );

const ListSection = ({ icon, title, items, bullet, bulletColor }) =>
    items?.length > 0 && (
        <Section icon={icon} title={title}>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className={`${bulletColor} mt-1`}>{bullet}</span>
                        <span className="text-gray-700">{item}</span>
                    </li>
                ))}
            </ul>
        </Section>
    );

const JobDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [saved, setSaved] = useState(false);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState({ type: '', message: '' });
    const [relatedJobs, setRelatedJobs] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);

        const parseTextToArray = (text) => text ? text.split('\n').filter((line) => line.trim() !== '') : [];

        const fetchJob = async () => {
            try {
                setLoading(true);
                setError(null);
                setRelatedJobs([]);
                const response = await fetch(API + `?action=get-job&id=${id}`);
                const data = await response.json();

                if (data.success && data.data) {
                    const jobData = data.data;
                    const daysLeft = jobData.deadline
                        ? Math.max(0, Math.ceil((new Date(jobData.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
                        : 0;

                    setJob({
                        ...jobData,
                        type: jobData.work_type || 'Full-time',
                        daysLeft,
                        responsibilities: parseTextToArray(jobData.responsibilities),
                        requirements: parseTextToArray(jobData.requirements),
                        benefits: parseTextToArray(jobData.benefits),
                        companyInfo: {
                            name: jobData.company,
                            size: jobData.company_size || 'Chưa cập nhật',
                            field: jobData.company_field || 'Chưa cập nhật',
                            address: jobData.company_address || jobData.location,
                            website: jobData.company_website || '#',
                            description: jobData.company_description || 'Chưa có thông tin',
                        },
                    });

                    Array.isArray(jobData.related_jobs) && setRelatedJobs(jobData.related_jobs);

                    const token = localStorage.getItem('token');

                    if (token) {
                        try {
                            const statusResponse = await fetch(API + `?action=check-job-status&job_id=${id}`, {
                                headers: { Authorization: 'Bearer ' + token },
                            });
                            const statusData = await statusResponse.json();

                            if (statusData.success) {
                                setApplied(statusData.data.applied);
                                setSaved(statusData.data.saved);
                            }
                        } catch (err) {
                            console.error('Error checking job status:', err);
                        }
                    }
                } else {
                    setError('Job not found');
                    setTimeout(() => navigate('/'), 2000);
                }
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('Failed to load job details');
                setTimeout(() => navigate('/'), 2000);
            } finally {
                setLoading(false);
            }
        };

        id && fetchJob();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <div className="text-gray-600">Đang tải thông tin công việc...</div>
                </div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <div className="text-gray-600 mb-2">{error ?? 'Không tìm thấy công việc'}</div>
                    <div className="text-sm text-gray-500">Đang chuyển hướng về trang chủ...</div>
                </div>
            </div>
        );
    }

    const handleSave = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await fetch(API + '?action=' + (saved ? 'unsave-job' : 'save-job'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                body: JSON.stringify({ job_id: Number(id) }),
            });
            setSaved(!saved);
        } catch (err) {
            console.error('Error toggling save:', err);
        }
    };

    const handleApply = async () => {
        if (applied) {
            setModalContent({ type: 'warning', message: 'Bạn đã ứng tuyển công việc này rồi!' });
            return setShowModal(true);
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(API + '?action=apply-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                body: JSON.stringify({ job_id: Number(id) }),
            });
            const data = await res.json();

            setApplied(data.success ? true : applied);
            setModalContent(
                data.success
                    ? { type: 'success', message: 'Ứng tuyển thành công! Nhà tuyển dụng sẽ liên hệ với bạn sớm.' }
                    : { type: 'error', message: data.message || 'Ứng tuyển thất bại. Vui lòng thử lại.' }
            );
            setShowModal(true);
        } catch (err) {
            console.error('Error applying:', err);
            setModalContent({ type: 'error', message: 'Lỗi kết nối. Vui lòng thử lại.' });
            setShowModal(true);
        }
    };

    const urgentIcon = getUrgentIcon(job.daysLeft);
    const isUrgent = job.daysLeft <= 7;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            {showModal && (
                <div
                    className="fixed inset-0 flex items-center justify-center z-9999 p-4"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md relative animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-6">
                            <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${modalContent.type === 'success' ? 'bg-green-100' : modalContent.type === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                                    }`}
                            >
                                {modalContent.type === 'success' && (
                                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {modalContent.type === 'error' && (
                                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                                {modalContent.type === 'warning' && (
                                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                {modalContent.type === 'success' ? 'Thành công!' : modalContent.type === 'error' ? 'Có lỗi xảy ra' : 'Thông báo'}
                            </h2>

                            <p className="text-gray-600 text-sm leading-relaxed">{modalContent.message}</p>
                        </div>

                        <button onClick={() => setShowModal(false)} className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg">
                            OK
                        </button>
                    </div>
                </div>
            )}

            {isUrgent && (
                <div className="bg-red-500 text-white text-center py-3 font-semibold">
                    ⚡ Công việc này sắp hết hạn - chỉ còn {job.daysLeft} ngày để ứng tuyển!
                </div>
            )}

            <div className="max-w-6xl mx-auto px-8 py-8 w-full flex-1">

                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors">
                    <span>←</span>
                    <span className="font-medium">Quay lại</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                                    <CompanyLogo logo={job.logo} companyName={job.company} />
                                </div>

                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h1>
                                    <p className="text-gray-600 mb-3">{job.company}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">💰 {job.salary}</span>
                                        <span className="inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">📍 {job.location}</span>
                                        <span className="inline-flex items-center gap-1 text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium">💼 {job.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={handleApply} className={getApplyButtonClasses(applied)} disabled={applied}>
                                    {getApplyButtonLabel(applied)}
                                </button>
                                <button onClick={handleSave} className={getSaveButtonClasses(saved)}>
                                    {getSaveButtonLabel(saved)}
                                </button>
                            </div>
                        </div>

                        <Section icon="📋" title="Mô tả công việc">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description || 'Chưa có mô tả công việc'}</div>
                        </Section>

                        <ListSection icon="✅" title="Trách nhiệm công việc" items={job.responsibilities} bullet="•" bulletColor="text-purple-600" />
                        <ListSection icon="📌" title="Yêu cầu công việc" items={job.requirements} bullet="•" bulletColor="text-purple-600" />
                        <ListSection icon="🎁" title="Quyền lợi" items={job.benefits} bullet="✓" bulletColor="text-green-600" />

                        <Section icon="🏢" title="Thông tin công ty">
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Tên công ty</div>
                                    <div className="font-semibold text-gray-800">{job.companyInfo.name}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Quy mô</div>
                                    <div className="text-gray-700">{job.companyInfo.size}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Lĩnh vực</div>
                                    <div className="text-gray-700">{job.companyInfo.field}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Địa chỉ</div>
                                    <div className="text-gray-700">{job.companyInfo.address}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Website</div>
                                    <a href={job.companyInfo.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                        {job.companyInfo.website}
                                    </a>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">Giới thiệu</div>
                                    <div className="text-gray-700 leading-relaxed">{job.companyInfo.description}</div>
                                </div>
                            </div>
                        </Section>

                    </div>

                    <div className="space-y-6">

                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm top-6">
                            <h3 className="font-bold text-gray-800 mb-4">Thông tin chung</h3>
                            <div className="space-y-3">
                                <InfoItem icon="💼" label="Cấp bậc" value={job.level} />
                                <InfoItem icon="⏱️" label="Kinh nghiệm" value={job.experience} />
                                <InfoItem icon="👥" label="Số lượng" value={`${job.quantity} người`} />
                                <InfoItem icon="⚧️" label="Giới tính" value={job.gender} />
                                <InfoItem icon="📅" label="Hạn nộp" value={job.deadline} />
                                <InfoItem icon={urgentIcon} label="Thời gian còn lại" value={`${job.daysLeft} ngày`} />
                            </div>

                            <button onClick={handleApply} className={getStickyApplyButtonClasses(applied)} disabled={applied}>
                                {getApplyButtonLabel(applied)}
                            </button>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4">Việc làm liên quan</h3>
                            <div className="space-y-3">
                                {relatedJobs.length > 0 ? (
                                    relatedJobs.map((relatedJob) => (
                                        <div
                                            key={relatedJob.id}
                                            onClick={() => { window.scrollTo(0, 0); navigate(`/jobs/${relatedJob.id}`); }}
                                            className="p-3 border border-gray-100 rounded-lg hover:border-purple-300 cursor-pointer transition-all hover:shadow-md"
                                        >
                                            <div className="font-semibold text-sm text-gray-800 mb-1 line-clamp-1">{relatedJob.title}</div>
                                            <div className="text-xs text-gray-500 mb-2 line-clamp-1">{relatedJob.company}</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-green-600 font-medium">{relatedJob.salary}</div>
                                                <div className="text-xs text-gray-400">📍 {relatedJob.location}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">Không có việc làm liên quan</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default JobDetailPage;