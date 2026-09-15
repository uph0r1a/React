import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) return <Navigate to="/login" replace />;

    return allowedRoles && !allowedRoles.includes(role) ? <Navigate to={role === 'admin' ? '/admin' : role === 'employer' ? '/employer' : '/'} replace /> : children;
};

export default PrivateRoute;