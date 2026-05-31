import { useState, useEffect } from 'react';

const API = '/server/index.php';

const AppliedJobsModal = ({ isOpen, onClose }) => {
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAppliedJobs();
        }
    }, [isOpen]);

    const fetchAppliedJobs = async () => {
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(API + '?action=get-applied-jobs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });

            const data = await response.json();

            if (data.success) {
                setAppliedJobs(data.data || []);
            } else {
                setError(data.message || 'Không thể tải danh sách.');
            }
        } catch (err) {
            setError('Lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const getInitials = (companyName) => {
        const words = companyName.split(' ');
        const lastTwo = words.slice(-2);

        return lastTwo.map((w) => w[0]).join('').toUpperCase();
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'new':
                return {
                    label: 'Đang chờ',
                    color: 'bg-yellow-100 text-yellow-700',
                    icon: '⏳'
                };

            case 'reviewing':
                return {
                    label: 'Đang xét',
                    color: 'bg-blue-100 text-blue-700',
                    icon: '👀'
                };

            case 'shortlisted':
                return {
                    label: 'Phù hợp',
                    color: 'bg-green-100 text-green-700',
                    icon: '✓'
                }

            case 'rejected':
                return {
                    label: 'Từ chối',
                    color: 'bg-red-100 text-red-700',
                    icon: '✕'
                };

            default:
                return {
                    label: 'Không rõ',
                    color: 'bg-gray-100 text-gray-700',
                    icon: '?'
                };
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-linear-to-r from-purple-600 to-purple-500">
                    <div>
                        <h2 className="text-xl font-bold text-white">Việc làm đã ứng tuyển</h2>
                        <p className="text-sm text-purple-100 mt-0.5">{appliedJobs.length} đơn ứng tuyển</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors text-2xl leading-none">x</button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <div className="text-5xl mb-4">⚠️</div>
                            <p className="text-sm text-red-500">{error}</p>
                            <button onClick={fetchAppliedJobs} className="mt-4 text-sm text-purple-600 hover:underline">Thử lại</button>
                        </div>
                    ) : appliedJobs.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có đơn ứng tuyển nào</h3>
                            <p className="text-sm text-gray-500">Hãy tìm và ứng tuyển vào các công việc phù hợp với bạn</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appliedJobs.map((job) => {
                                const statusInfo = getStatusInfo(job.status);

                                return (
                                    <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg shrink-0">{getInitials(job.company)}</div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1">{job.title}</h3>
                                                        <p className="text-sm text-gray-600">{job.company}</p>
                                                    </div>

                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${statusInfo.color}`}>
                                                        <span>{statusInfo.icon}</span>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {job.salary && (
                                                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-medium">💰 {job.salary}</span>
                                                    )}

                                                    {job.location && (
                                                        <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">📍 {job.location}</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <span>Ứng tuyển ngày:{' '}{new Date(job.applied_at).toLocaleDateString('vi-VN')}</span>
                                                    <a href={`/jobs/${job.job_id}`} className="text-purple-600 hover:text-purple-700 font-medium hover:underline">Xem chi tiết →</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppliedJobsModal;