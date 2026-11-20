
import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password");
      return;
    }

    // Backend login API will be connected here later
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Logo */}
        <div className="login-logo">
          {/* Add your logo PNG here later */}
          <span className="logo-symbol">✦</span>
          <span className="logo-name">Softronics.</span>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <h2>Welcome Back!</h2>

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

            <button type="submit" className="login-button">
              Log In
            </button>
          </form>
        </div>

        {/* Version */}
        

      </div>
    </div>
  );
};

export default Login;
