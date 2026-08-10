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
import { UserManagementSection } from "./UserManagementSection";
import { SupplierManagementSection } from "./SupplierManagementSection";
import { OverviewSection } from "./OverviewSection";
import { ReportsSection } from "./ReportsSection";
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
        {activeSection === "overview" && <OverviewSection />}
        {activeSection === "users" && <UserManagementSection />}
        {/* {activeSection === "requests" && <div>Procurement Requests Section</div>} */}
        {activeSection === "products" &&  <ProductSection/>}
        {activeSection === "suppliers" && <SupplierManagementSection />}
        {activeSection === "reports" && <ReportsSection />}
        {activeSection === "settings" && <div>Settings Section</div>}
      </main>
    </div>
  );
};
