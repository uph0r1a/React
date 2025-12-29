import React from 'react'
import { Routes, Route, Link } from "react-router-dom";
import User from '../user/User';
import Product from '../product/Product';

function Dashboard() {
  return (
    <div>
      <h2>Dashboard</h2>

      <nav>
        <Link to="user">User</Link>
        <Link to="product">Product</Link>
      </nav>

      <Routes>
        <Route path="user" element={<User />} />
        <Route path="product" element={<Product />} />
      </Routes>
    </div>
  )
}

export default Dashboard;
