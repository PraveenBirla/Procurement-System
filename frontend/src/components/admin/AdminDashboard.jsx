import { useState } from "react";
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  Building2,
  Package,
  LogOut
} from "lucide-react";
import "./AdminDashboard.css";  
import { ProductSection } from "./ProductSection";
import authService from "../../services/authService";

export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    {id:  "products", label: "Products", icon: Package},
    { id: "suppliers", label: "Suppliers", icon: Building2 },
    { id: "reports", label: "Reports", icon: FileText },
     
  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">Procurement Admin</div>
        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
          <button className="logout-btn" onClick={() => {authService.clearAuth();  window.location.reload();} }>
        <LogOut size={18} />
         <span>Logout</span>
         </button>
      </aside>

     
      <main className="main-content animate-fade-in">
        {activeSection === "overview" && (
          <div className="grid-cards stagger-children">
            <div className="card success">✅ Approved Requests</div>
            <div className="card warning">⚠️ Pending Approvals</div>
            <div className="card danger">❌ Rejected Requests</div>
            <div className="card info">📊 Budget Usage</div>
          </div>
        )}
        {activeSection === "users" && <div>User Management Section</div>}
        {/* {activeSection === "requests" && <div>Procurement Requests Section</div>} */}
        {activeSection === "products" &&  <ProductSection/>}
         {activeSection === "suppliers" &&  <div>supplier section</div>}
        {activeSection === "reports" && <div>Reports Section</div>}
        {activeSection === "settings" && <div>Settings Section</div>}
      </main>
    </div>
  );
};
