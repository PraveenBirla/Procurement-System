import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import "./App.css";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      {isLogin ? (
        <Login
          showRegister={() => setIsLogin(false)}
        />
      ) : (
        <Register
          showLogin={() => setIsLogin(true)}
        />
      )}
    </>
  );
}

export default App;