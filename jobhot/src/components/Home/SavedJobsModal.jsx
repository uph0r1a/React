import { useState, useEffect } from 'react';
import JobCard from './JobCard';

const API = '/server/index.php';

const SavedJobsModal = ({ isOpen, onClose }) => {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchSavedJobs();
        }
    }, [isOpen]);

    const fetchSavedJobs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API + '?action=get-saved-jobs', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
            });
            const data = await response.json();
            if (data.success) {
                setSavedJobs((data.data && data.data.jobs) || data.jobs || []);
            } else {
                console.error(data.message);
                setSavedJobs([]);
            }
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
            setSavedJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleUnsave = (jobId) => {
        setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen)
        return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-9999 p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }} onClick={handleBackdropClick}>
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-linear-to-r from-purple-600 to-purple-500">
                    <div>
                        <h2 className="text-xl font-bold text-white">Việc làm đã lưu</h2>
                        <p className="text-sm text-purple-100 mt-0.5">{savedJobs.length} việc làm</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors text-2xl leading-none">x</button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)] px-6 py-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        </div>
                    ) : savedJobs.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔖</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có việc làm nào được lưu</h3>
                            <p className="text-sm text-gray-500">Nhấn vào ❤️ để lưu việc làm yêu thích</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {savedJobs.map(job => (
                                <JobCard key={job.id} job={job} initialSaved={true} onUnsave={() => handleUnsave(job.id)} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedJobsModal;