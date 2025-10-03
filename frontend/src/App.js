import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import Register from "./components/Register";
import StudentDashboard from "./components/StudentDashboard";
import LecturerDashboard from "./components/LecturerDashboard";
import PRLDashboard from "./components/PRLDashboard";
import PLDashboard from "./components/PLDashboard";
import "./style.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const renderDashboard = () => {
    switch (user?.role) {
      case "student":
        return <StudentDashboard user={user} />;
      case "lecturer":
        return <LecturerDashboard user={user} />;
      case "prl":
        return <PRLDashboard user={user} />;
      case "pl":
        return <PLDashboard user={user} />;
      default:
        return <p>Unknown role</p>;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="brand">LUCT System</Link>
        <div className="nav-links">
          {!user && (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
          {user && (
            <>
              <span className="nav-user">Hi, {user.name} ({user.role})</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </>
          )}
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={user ? renderDashboard() : <p>Welcome! Please login.</p>} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
