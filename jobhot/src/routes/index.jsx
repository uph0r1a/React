import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import LandingPage from '../pages/Landing';
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register';
import ForgotPasswordPage from '../pages/ForgotPassword';
import EmployerPage from '../pages/Employer';
import AdminDashboard from '../pages/Dashboard';
import JobDetailPage from '../pages/JobDetail';
import ContactPage from '../pages/Contact';
import AboutPage from '../pages/About';

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            {/* Landing page — shown to guests; logged-in users go to their dashboard */}
            <Route path="/" element={<PublicRoute landingMode><LandingPage /></PublicRoute>} />

            {/* Job browsing (requires login — job seekers only) */}
            <Route path="/jobs" element={
                <PrivateRoute allowedRoles={['user']}>
                    <HomePage />
                </PrivateRoute>
            } />

            {/* Public pages */}
            <Route path="/jobs/:id" element={<PublicRoute><JobDetailPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/contact" element={<PublicRoute><ContactPage /></PublicRoute>} />
            <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />

            {/* Employer dashboard */}
            <Route path="/employer" element={
                <PrivateRoute allowedRoles={['employer']}>
                    <EmployerPage />
                </PrivateRoute>
            } />

            {/* Admin dashboard */}
            <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </PrivateRoute>
            } />

            {/* Aliases */}
            <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/home" element={<Navigate to="/jobs" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
