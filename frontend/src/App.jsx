import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Hospital from "./components/Hospital";
import BloodDonation from "./components/BloodDonation";
import Ambulance from "./components/Ambulance";
import FundRequest from "./components/FundRequest";
import Login from "./components/Login";
import Register from "./components/Register";

// New Components
import HospitalAuth from "./components/HospitalAuth";
import HospitalDashboard from "./components/HospitalDashboard";
import AmbulanceAuth from "./components/AmbulanceAuth";
import AmbulanceDashboard from "./components/AmbulanceDashboard";
import AdminAuth from "./components/AdminAuth"; // Make sure this exists
import AdminDashboard from "./components/AdminDashboard";
import NotificationInbox from "./components/NotificationInbox";
import NotificationBell from "./components/NotificationBell";
import DonorRegistration from "./components/DonorRegistration";
import VerifyEmail from "./components/VerifyEmail";

axios.defaults.baseURL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [hospital, setHospital] = useState(() => {
    const hospitalToken = localStorage.getItem("hospitalToken");
    return hospitalToken
      ? JSON.parse(localStorage.getItem("hospital") || "{}")
      : null;
  });
  const [ambulance, setAmbulance] = useState(() => {
    const ambulanceToken = localStorage.getItem("ambulanceToken");
    return ambulanceToken
      ? JSON.parse(localStorage.getItem("ambulance") || "{}")
      : null;
  });
  const [admin, setAdmin] = useState(() => {
    const adminToken = localStorage.getItem("adminToken");
    return adminToken
      ? JSON.parse(localStorage.getItem("admin") || "{}")
      : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/auth/profile");
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    const userToken = localStorage.getItem("token");
    const hospitalToken = localStorage.getItem("hospitalToken");
    const ambulanceToken = localStorage.getItem("ambulanceToken");
    const adminToken = localStorage.getItem("adminToken");

    if (userToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${userToken}`;
      fetchUserProfile();
    } else if (hospitalToken) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${hospitalToken}`;
      setLoading(false);
    } else if (ambulanceToken) {
      axios.defaults.headers.common["Authorization"] =
        `Bearer ${ambulanceToken}`;
      setLoading(false);
    } else if (adminToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${adminToken}`;
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // ⚠️ CRITICAL: Monitor localStorage changes across tabs (prevents multi-account issues)
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log(
        "📦 Storage change detected:",
        e.key,
        e.newValue ? "changed" : "removed",
      );

      // User token changed
      if (e.key === "token") {
        if (!e.newValue && e.oldValue) {
          // Logged out in another tab
          console.warn("⚠️ User logged out in another tab");
          setUser(null);
          delete axios.defaults.headers.common["Authorization"];
          window.location.href = "/login";
        } else if (e.newValue && e.newValue !== e.oldValue) {
          // Different user logged in
          console.warn("⚠️ Different user logged in another tab - refreshing");
          window.location.reload();
        }
      }

      // Hospital token changed
      if (e.key === "hospitalToken") {
        if (!e.newValue && e.oldValue) {
          setHospital(null);
          window.location.href = "/hospital-login";
        } else if (e.newValue && e.newValue !== e.oldValue) {
          window.location.reload();
        }
      }

      // Ambulance token changed
      if (e.key === "ambulanceToken") {
        if (!e.newValue && e.oldValue) {
          setAmbulance(null);
          window.location.href = "/ambulance-login";
        } else if (e.newValue && e.newValue !== e.oldValue) {
          window.location.reload();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  };

  const loginHospital = (token, hospitalData) => {
    localStorage.setItem("hospitalToken", token);
    localStorage.setItem("hospital", JSON.stringify(hospitalData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setHospital(hospitalData);
  };

  const loginAmbulance = (token, ambulanceData) => {
    localStorage.setItem("ambulanceToken", token);
    localStorage.setItem("ambulance", JSON.stringify(ambulanceData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setAmbulance(ambulanceData);
  };

  const loginAdmin = (token, adminData) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("admin", JSON.stringify(adminData));
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("hospitalToken");
    localStorage.removeItem("hospital");
    localStorage.removeItem("ambulanceToken");
    localStorage.removeItem("ambulance");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setHospital(null);
    setAmbulance(null);
    setAdmin(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          user={user}
          hospital={hospital}
          ambulance={ambulance}
          admin={admin}
          onLogout={logout}
        />

        <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Dashboard user={user} />} />
          <Route
            path="/login"
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />
          <Route path="/hospitals" element={<Hospital user={user} />} />
          <Route
            path="/blood-donation"
            element={<BloodDonation user={user} />}
          />
          <Route path="/ambulance" element={<Ambulance user={user} />} />
          <Route path="/fund-requests" element={<FundRequest user={user} />} />

          {/* Hospital Routes */}
          <Route
            path="/hospital-login"
            element={
              !hospital ? (
                <HospitalAuth mode="login" onLogin={loginHospital} />
              ) : (
                <Navigate to="/hospital-dashboard" />
              )
            }
          />
          <Route
            path="/hospital-register"
            element={
              !hospital ? (
                <HospitalAuth mode="register" />
              ) : (
                <Navigate to="/hospital-dashboard" />
              )
            }
          />
          <Route
            path="/hospital-dashboard"
            element={
              hospital ? (
                <HospitalDashboard />
              ) : (
                <Navigate to="/hospital-login" />
              )
            }
          />

          {/* Ambulance Routes */}
          <Route
            path="/ambulance-login"
            element={
              !ambulance ? (
                <AmbulanceAuth mode="login" onLogin={loginAmbulance} />
              ) : (
                <Navigate to="/ambulance-dashboard" />
              )
            }
          />
          <Route
            path="/ambulance-register"
            element={
              !ambulance ? (
                <AmbulanceAuth mode="register" />
              ) : (
                <Navigate to="/ambulance-dashboard" />
              )
            }
          />
          <Route
            path="/ambulance-dashboard"
            element={
              ambulance ? (
                <AmbulanceDashboard />
              ) : (
                <Navigate to="/ambulance-login" />
              )
            }
          />

          {/* ✅ FIXED: Admin Routes */}
          <Route
            path="/admin-login"
            element={
              !admin ? (
                <AdminAuth mode="login" onLogin={loginAdmin} />
              ) : (
                <Navigate to="/admin-dashboard" />
              )
            }
          />
          <Route
            path="/admin-register"
            element={
              !admin ? (
                <AdminAuth mode="register" />
              ) : (
                <Navigate to="/admin-dashboard" />
              )
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              admin ? <AdminDashboard /> : <Navigate to="/admin-login" />
            }
          />

          {/* Notification Routes */}
          <Route
            path="/notifications"
            element={
              user ? (
                <NotificationInbox user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* ✅ ADD: Catch-all route for undefined paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route
            path="/become-donor"
            element={
              user ? (
                <DonorRegistration user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
