import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin1234') {
      localStorage.setItem('user', JSON.stringify({ role: 'admin' }));
      navigate('/users');
    } else if (username === 'user' && password === 'user1234') {
      localStorage.setItem('user', JSON.stringify({ role: 'user' }));
      navigate('/users');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <Box sx={{ width: 300, mx: 'auto', mt: 10 }}>
      <Typography variant="h5" textAlign="center">Login</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Username"
        fullWidth
        sx={{ mt: 2 }}
        onChange={e => setUsername(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        sx={{ mt: 2 }}
        onChange={e => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>
    </Box>
  );
};

export default Login;
