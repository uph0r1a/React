import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Card, CardContent, Stack, } from "@mui/material";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const fakeAccount = {
      email: "user@gmail.com",
      password: "password123",
    };
    localStorage.setItem("account", JSON.stringify(fakeAccount));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const account = JSON.parse(localStorage.getItem("account"));

    if (email === account.email && password === account.password) {
      localStorage.setItem("user", JSON.stringify({ email }));
      navigate("/home");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", p: 2 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />

              <Button type="submit" variant="contained" fullWidth>
                Login
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login;
