import { useState } from 'react';
import Header from '../components/Home/Header';
import Hero from '../components/Home/Hero';
import Sidebar from '../components/Home/Sidebar';
import JobList from '../components/Home/JobList';
import Footer from '../components/Home/Footer';

const HomePage = () => {
    const [filteredJobs, setFilteredJobs] = useState(null);

    const handleFilter = (jobs) => setFilteredJobs(jobs);
    const filterProps = { onFilter: handleFilter };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <Hero onSearch={handleFilter} />
            <div className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
                    <Sidebar {...filterProps} />
                    <JobList filteredJobs={filteredJobs} {...filterProps} />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;