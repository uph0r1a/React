import { Route, Routes } from "react-router-dom";
import Login from "./components/login/Login";
import DashboardPage from "./components/dashboard";
import PrivateRouter from "./components/PrivateRouter";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRouter>
              <DashboardPage />
            </PrivateRouter>
          }
        />
      </Routes>
    </div>
  );
}

export default App;