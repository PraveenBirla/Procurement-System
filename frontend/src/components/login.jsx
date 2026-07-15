import { useState } from "react";

function Login({ showRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    return passwordPattern.test(password);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    if (value === "") {
      setEmailError("");
    } else if (!validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    if (value === "") {
      setPasswordError("");
    } else if (!validatePassword(value)) {
      setPasswordError(
        "Password must contain 8 characters, uppercase, lowercase, digit and special character"
      );
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    let isValid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError(
        "Password must contain 8 characters, uppercase, lowercase, digit and special character"
      );
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    console.log("Email:", email);
    console.log("Password:", password);

    alert("Login details are valid");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Procurement System</h1>

        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>

          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
          />

          {emailError && (
            <p className="error-message">
              {emailError}
            </p>
          )}

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
          />

          {passwordError && (
            <p className="error-message">
              {passwordError}
            </p>
          )}

          <button type="submit">
            Login
          </button>
        </form>

        <p className="account-text">
          New User?{" "}
          <span onClick={showRegister}>
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;