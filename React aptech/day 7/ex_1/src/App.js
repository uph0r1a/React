import { Routes, Route } from "react-router-dom";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import User from "./components/user/User";
import Product from "./components/product/Product";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route path="user" element={<User />} />
        <Route path="product" element={<Product />} />
      </Route>
    </Routes>

  );
}

export default App;
