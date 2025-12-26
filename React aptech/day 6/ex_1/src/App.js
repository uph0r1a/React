import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login/Login";
import Home from "./components/home/Home";
import Item from "./components/detailItem/Item";
import Cart from "./components/cart/Cart";

const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/detailItem/:id"
        element={
          <PrivateRoute>
            <Item />
          </PrivateRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
