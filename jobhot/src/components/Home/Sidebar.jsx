import { useState } from 'react';

const workTypes = [
    {
        id: 'Full-time',
        label: 'Nhân viên chính thức'
    },
    {
        id: 'Part-time',
        label: 'Bán thời gian'
    },
    {
        id: 'Seasonal',
        label: 'Nhân viên thời vụ'
    },
    {
        id: 'Freelancer',
        label: 'Freelancer'
    },
    {
        id: 'Intern',
        label: 'Thực tập sinh'
    },
];

const levels = [
    {
        id: 'Mới tốt nghiệp',
        label: 'Mới tốt nghiệp'
    },
    {
        id: 'Nhân viên',
        label: 'Nhân viên'
    },
    {
        id: 'Trưởng nhóm',
        label: 'Trưởng nhóm'
    },
    {
        id: 'Quản lý',
        label: 'Quản lý'
    },
    {
        id: 'Senior',
        label: 'Senior'
    },
    {
        id: 'Giám đốc',
        label: 'Giám đốc'
    },
];

const locations = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ'
];

const sendFiltersToBackend = async (workType, level, locationName, onFilter) => {
    let queryString = '';

    if (workType !== null) {
        queryString = queryString + 'workType=' + encodeURIComponent(workType);
    }

    if (level !== null) {
        if (queryString !== '') {
            queryString = queryString + '&';
        }

        queryString = queryString + 'level=' + encodeURIComponent(level);
    }

    if (locationName !== null) {
        if (queryString !== '') {
            queryString = queryString + '&';
        }

        queryString = queryString + 'location=' + encodeURIComponent(locationName);
    }

    let url;

    if (queryString === '') {
        url = '/server/index.php?action=get-jobs';
    } else {
        url = '/server/index.php?action=get-jobs&' + queryString;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Filter response:', data);

        // Extract jobs array from response
        if (data.success) {
            const jobs = data.data?.jobs || data.jobs || [];
            console.log('Filtered jobs:', jobs);
            onFilter(jobs);
        } else {
            console.error('Filter failed:', data.message);
            onFilter([]);
        }
    } catch (error) {
        console.error('Failed to fetch jobs from backend:', error);
        onFilter([]);
    }
};

const getButtonClasses = (isSelected) => {
    const base = 'w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2';

    if (isSelected) {
        return base + ' bg-purple-50 text-purple-700 font-medium';
    }

    return base + ' text-gray-600 hover:bg-gray-50';
};

const getDotClasses = (isSelected) => {
    const base = 'w-2 h-2 rounded-full shrink-0';

    if (isSelected) {
        return base + ' bg-purple-600';
    }

    return base + ' bg-gray-300';
};

const getLocationPillClasses = (isSelected) => {
    const base = 'px-3 py-1.5 rounded-full text-xs border transition-colors';

    if (isSelected) {
        return base + ' border-purple-400 text-purple-600';
    }

    return (
        base + ' border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-600'
    );
};

const FilterButton = ({ label, isSelected, onClick }) => {
    return (
        <button onClick={onClick} className={getButtonClasses(isSelected)}>
            <span className={getDotClasses(isSelected)} />
            {label}
        </button>
    );
};

const Sidebar = ({ onFilter }) => {
    const [selectedWorkType, setSelectedWorkType] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedLocationName, setSelectedLocationName] = useState(null);

    const handleWorkTypeClick = (id) => {
        let newWorkType;

        if (selectedWorkType === id) {
            newWorkType = null;
        } else {
            newWorkType = id;
        }

        setSelectedWorkType(newWorkType);
        sendFiltersToBackend(newWorkType, selectedLevel, selectedLocationName, onFilter);
    };

    const handleLevelClick = (id) => {
        let newLevel;

        if (selectedLevel === id) {
            newLevel = null;
        } else {
            newLevel = id;
        }

        setSelectedLevel(newLevel);
        sendFiltersToBackend(selectedWorkType, newLevel, selectedLocationName, onFilter);
    };

    const handleLocationClick = (locationName) => {
        let newLocationName;

        if (selectedLocationName === locationName) {
            newLocationName = null;
        } else {
            newLocationName = locationName;
        }

        setSelectedLocationName(newLocationName);
        sendFiltersToBackend(selectedWorkType, selectedLevel, newLocationName, onFilter);
    };

    return (
        <aside className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-purple-600 px-4 py-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="4" y1="6" x2="20" y2="6" />
                        <line x1="8" y1="12" x2="20" y2="12" />
                        <line x1="12" y1="18" x2="20" y2="18" />
                    </svg>
                    Bộ lọc tìm kiếm
                </h3>
            </div>

            <div className="p-4 flex flex-col gap-5">
                <div>
                    <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Hình thức làm việc</h4>
                    <ul className="flex flex-col gap-1">
                        {workTypes.map((item) => {
                            const isSelected = selectedWorkType === item.id;

                            return (
                                <li key={item.id}>
                                    <FilterButton label={item.label} isSelected={isSelected} onClick={() => { handleWorkTypeClick(item.id); }} />
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Cấp bậc</h4>

                    <ul className="flex flex-col gap-1">
                        {levels.map((item) => {
                            const isSelected = selectedLevel === item.id;

                            return (
                                <li key={item.id}>
                                    <FilterButton label={item.label} isSelected={isSelected} onClick={() => { handleLevelClick(item.id); }} />
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide mb-3">Địa điểm</h4>

                    <div className="flex flex-wrap gap-2">
                        {locations.map((locationName) => {
                            const isSelected = selectedLocationName === locationName;

                            return (
                                <button key={locationName} onClick={() => { handleLocationClick(locationName); }} className={getLocationPillClasses(isSelected)}>{locationName}</button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;