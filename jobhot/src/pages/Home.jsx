import { useState } from 'react';
import Header from '../components/Home/Header';
import Hero from '../components/Home/Hero';
import Sidebar from '../components/Home/Sidebar';
import JobList from '../components/Home/JobList';
import Footer from '../components/Home/Footer';

// ─────────────────────────────────────────────
// PAGE: HomePage
//
// Layout: Header → Hero → (Sidebar + JobList side by side) → Footer
//
// The Sidebar sends filtered job results up via the onFilter prop.
// HomePage stores those results in filteredJobs state and passes
// them down to JobList so the list re-renders with the filtered data.
//
// When no filter has been applied yet, filteredJobs is null and
// JobList falls back to loading its own default list.
// ─────────────────────────────────────────────

const HomePage = () => {

    // filteredJobs holds the array returned by the backend after a filter is applied.
    // It starts as null so JobList knows to show its own default data on first load.
    const [filteredJobs, setFilteredJobs] = useState(null);


    // ── handleFilter ──
    // Called by Sidebar whenever the user changes a filter and the backend responds.
    // Receives the new job array and stores it so JobList can display it.

    function handleFilter(jobs) {
        setFilteredJobs(jobs);
    }


    // ── Render ──

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <Hero onSearch={handleFilter} />
            <div className="max-w-7xl mx-auto px-8 py-8 w-full flex-1">
                <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">

                    {/* Sidebar sends filter results up via onFilter */}
                    <Sidebar onFilter={handleFilter} />

                    {/* JobList receives the filtered results (or null for default list) */}
                    <JobList filteredJobs={filteredJobs} onFilter={handleFilter} />

                </div>
            </div>
            <Footer />
        </div>
    );
};

export default HomePage;