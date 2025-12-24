import React, { useEffect, useState } from "react";
import "./styles.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();
  const [tabActive, setTabActive] = useState("user");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // useState, useEffect, useParams, useNavigate

  const getProducts = async () => {
    // Call API get products
    setLoading(true);
    try {
      const response = await axios.get("https://fakestoreapi.com/products");
      console.log(response, "products");
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://fakestoreapi.com/users");
      console.log(response, "users");
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    getUsers();
    getProducts();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="header">
        <h2>Dashboard Page</h2>
        <ul className="navbar">
          <li onClick={() => setTabActive("user")}>Quản lý người dùng</li>
          <li onClick={() => setTabActive("product")}>Quản lý sản phẩm</li>
          <button onClick={handleLogout}>Logout</button>
        </ul>
      </div>
      <div className="content">
        {loading ? (
          <p>Loading</p>
        ) : (
          <>
            {tabActive === "user" && (
              <div>
                {users.map((user) => (
                  <div key={user.id}>
                    <p>{user.email}</p>
                  </div>
                ))}
              </div>
            )}
            {tabActive === "product" && (
              <div>
                {products.map((product) => (
                  <div key={product.id}>
                    <p>{product.title}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;