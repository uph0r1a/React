import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography sx={{ flexGrow: 1 }}>
            E-commerce
          </Typography>
          <Button color="inherit" onClick={() => navigate('/users')}>
            Users
          </Button>
          <Button color="inherit" onClick={() => navigate('/products')}>
            Products
          </Button>
          <Button color="error" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {children}
    </>
  );
};

export default Layout;
