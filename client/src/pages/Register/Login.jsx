import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../Axios";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { accessToken, user } = response.data;

      localStorage.setItem("SMStoken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      if (user?.userType === "intern") {
        navigate("/internweekly", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMsg(
        error?.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <span className="logo-symbol">✦</span>
          <span className="logo-name">Softronics.</span>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2>Welcome Back!</h2>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#b91c1c",
                padding: "10px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label>E-Mail</label>
              <input
                type="email"
                placeholder="Enter your Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label>Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;