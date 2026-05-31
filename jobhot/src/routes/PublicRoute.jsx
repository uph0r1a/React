import { Navigate, useLocation } from 'react-router-dom';

// PublicRoute
// - landingMode: nếu true, khi đã đăng nhập + rememberMe sẽ redirect thẳng đến dashboard
//   (dùng cho route "/" — landing page)
// - Các trang auth (login/register/forgot-password): luôn redirect nếu đã đăng nhập
// - Các trang public khác (about, contact, job detail): ai cũng vào được

const PublicRoute = ({ children, landingMode = false }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const rememberMe = localStorage.getItem('rememberMe');
    const location = useLocation();

    const authOnlyPaths = ['/login', '/register', '/forgot-password'];
    const isAuthPage = authOnlyPaths.includes(location.pathname);

    // Helper: redirect to correct dashboard
    const redirectByRole = () => {
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'employer') return <Navigate to="/employer" replace />;
        return <Navigate to="/jobs" replace />;
    };

    // Landing page: if logged in with rememberMe → go to dashboard directly
    if (landingMode && token && rememberMe === 'true') {
        return redirectByRole();
    }

    // Auth pages: redirect away if already logged in
    if (isAuthPage && token) {
        return redirectByRole();
    }

    return children;
};

export default PublicRoute;
