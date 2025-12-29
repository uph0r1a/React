import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';


function Login() {
  const navigate = useNavigate();
  const [username, getUsername] = useState("");
  const [password, getPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
    localStorage.setItem("isLogin", "true");
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" id="username" value={username} onChange={(e) => getUsername(e.target.value)} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" value={password} onChange={(e) => getPassword(e.target.value)} />

        <button type="submit">Log in</button>
      </form>
    </div>
  )
}

export default Login