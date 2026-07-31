import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './hooks/useAuth';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { FinanceDashboardPage } from './pages/FinanceDashboardPage';
import { SupplierDashboardPage } from './pages/SupplierDashboardPage';
import { ProcurementDashboardPage } from './pages/ProcurementDashboardPage';
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  } 

  const getDashboardPath = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "ADMIN":
        return "/admin";

      case "EMPLOYEE":
        return "/employee";

      case "FINANCE":
        return "/finance";

          case "MANAGER":
        return "/manager";

      case "PROCUREMENT":
        return "/procurement";

        case "SUPPLIER":
        return "/supplier";

      default:
        return "/login";
    }
  };

  return (
    <Routes>
     
      <Route path="/login" element={ !user ? (<LoginPage /> ) : (<Navigate to={getDashboardPath()} replace /> )}/>
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
 
      <Route path="/admin" element={user?.role === "ADMIN" ? <AdminDashboardPage/>: <Navigate to="/login" replace />}/>
      <Route path="/employee" element={user?.role === "EMPLOYEE" ? <EmployeeDashboardPage/>: <Navigate to="/login" replace />}/>
      <Route path="/manager" element={user?.role === "MANAGER" ? <ManagerDashboardPage/>: <Navigate to="/login" replace />}/>
      <Route path="/finance" element={user?.role === "FINANCE" ? <FinanceDashboardPage/>: <Navigate to="/login" replace />}/>
      <Route path="/procurement" element={user?.role === "PROCUREMENT" ? <ProcurementDashboardPage/>: <Navigate to="/login" replace />}/>
      <Route path="/supplier" element={user?.role === "SUPPLIER" ? <SupplierDashboardPage/>: <Navigate to="/login" replace />}/>
      
      <Route path="/" element={<Navigate to={getDashboardPath()} replace/>}/>
    </Routes>
  );
}

export default App;
