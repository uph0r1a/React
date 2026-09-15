import { Navigate, useLocation } from 'react-router-dom';

const PublicRoute = ({ children, landingMode = false }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const rememberMe = localStorage.getItem('rememberMe');
    const location = useLocation();

    const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

    const redirectByRole = () => (
        <Navigate to={role === 'admin' ? '/admin' : role === 'employer' ? '/employer' : '/jobs'} replace />
    );

    return (landingMode && token && rememberMe === 'true') || (isAuthPage && token) ? redirectByRole() : children;
};

export default PublicRoute;