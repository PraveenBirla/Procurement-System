import { useState } from "react";

function Register({ showLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    return passwordPattern.test(password);
  };

  const handleNameChange = (e) => {
    const value = e.target.value;

    setFullName(value);

    if (value.trim() === "") {
      setNameError("Full name should not be empty");
    } else {
      setNameError("");
    }
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

  const handleRegister = (e) => {
    e.preventDefault();

    let isValid = true;

    if (fullName.trim() === "") {
      setNameError("Full name should not be empty");
      isValid = false;
    }

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

    if (role === "") {
      setRoleError("Please select a role");
      isValid = false;
    } else {
      setRoleError("");
    }

    if (!isValid) {
      return;
    }

    console.log("Full Name:", fullName);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role:", role);

    alert("Registration details are valid");

    showLogin();
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Procurement System</h1>

        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <label>Full Name</label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={handleNameChange}
          />

          {nameError && (
            <p className="error-message">
              {nameError}
            </p>
          )}

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

          <label>Role</label>

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);

              if (e.target.value !== "") {
                setRoleError("");
              }
            }}
          >
            <option value="">
              Select Role
            </option>

            <option value="ADMIN">
              Admin
            </option>

            <option value="EMPLOYEE">
              Employee
            </option>

            <option value="MANAGER">
              Manager
            </option>

            <option value="PROCUREMENT">
              Procurement Officer
            </option>
          </select>

          {roleError && (
            <p className="error-message">
              {roleError}
            </p>
          )}

          <button type="submit">
            Register
          </button>
        </form>

        <p className="account-text">
          Already have an account?{" "}
          <span onClick={showLogin}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;