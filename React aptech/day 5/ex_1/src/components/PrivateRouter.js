import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRouter({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}

export default PrivateRouter;