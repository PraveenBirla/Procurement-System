import { useState } from "react";
import {
  Users,
  FileText,
  Settings,
  BarChart3,
  ClipboardList,
  Network,
  Building2,
  Package,
  LogOut
} from "lucide-react";
import "./AdminDashboard.css";  
import { ProductSection } from "./ProductSection";
 
import { SupplierSection } from "./SupplierSection";
import { UserManagementSection } from "./UserManagementSection";
import { SupplierManagementSection } from "./SupplierManagementSection";
import { OverviewSection } from "./OverviewSection";
import { ReportsSection } from "./ReportsSection";
import { RequisitionSection } from "./RequisitionSection";
import { DepartmentSection } from "./DepartmentSection";
import authService from "../../services/authService";


export const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Purchase Orders", icon: BarChart3 },
     { id: "requisition", label: "Requisition", icon: ClipboardList },
    { id: "users", label: "Users", icon: Users },
     { id: "suppliers", label: "Suppliers", icon: Building2 },
    {id:  "products", label: "Products", icon: Package},
     {id:  "departments", label: "Departments", icon: Network},
    { id: "reports", label: "Reports", icon: FileText },
    
     
  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">ProCure Admin</div>
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
        {activeSection === "overview" && <OverviewSection setActiveSection={setActiveSection} />}
        {activeSection === "users" && <UserManagementSection setActiveSection={setActiveSection} />}
          {activeSection === "suppliers" && <SupplierSection setActiveSection={setActiveSection} />}
        {activeSection === "products" &&  <ProductSection setActiveSection={setActiveSection} />}
        {activeSection === "requisition" && <RequisitionSection setActiveSection={setActiveSection} />}
        {activeSection === "reports" && <ReportsSection setActiveSection={setActiveSection} />}
        {activeSection === "departments" && <DepartmentSection setActiveSection={setActiveSection} />}
        {activeSection === "settings" && <div>Settings Section</div>}
      </main>
    </div>
  );
};
