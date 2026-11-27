
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
        error?.response?.data?.message ||
        "Invalid email or password. Please try again."
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
          <span className="logo-name">
            Softronii<span className="logo-x">X</span>
          </span>
        </div>

        {/* Login Card */}
        <div className="login-card">

          <h2>Welcome Back!</h2>

          {errorMsg && (
            <div className="login-error">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Email */}
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

            {/* Password */}
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
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3L21 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M10.6 10.6A2 2 0 0013.4 13.4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 5 9 7-.2.8-1.1 2.3-2.7 3.7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6.2 6.2C3.9 7.8 2.3 10.3 2 12c.5 2 4 7 10 7 1 0 2-.2 2.9-.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </button>

              </div>

              <div className="forgot-password">
                Forgot Password?
              </div>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

          </form>
        </div>

        {/* Version */}
        <div className="login-version">
          Ver 22.23.11
        </div>

      </div>
    </div>
  );
};

export default Login;