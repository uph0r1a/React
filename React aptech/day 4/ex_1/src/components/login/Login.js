import React, { useState } from "react";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Rating from "@mui/material/Rating";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [value, setValue] = React.useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý logic
    console.log(email, "email");
    console.log(password, "password");
    localStorage.setItem("email", email);
    localStorage.setItem("token", "2jf029fj32f039f302j23jf32j093290"); // Giả lập accessToken
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <h2>Login Page</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-item">
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-item">
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;