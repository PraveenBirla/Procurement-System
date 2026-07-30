import { useState } from "react";
import {
  Package,
  LogOut
} from "lucide-react";  
import authService from "../../services/authService";
import { RequisitionSection } from "./RequisitionSection";

export const ManagerDashboard = () => {
  const [activeSection, setActiveSection] = useState("requition");

  const menuItems = [
    { id: "requition", label: "requition", icon: Package }, 
  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">Procurement Manager</div>
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
        {activeSection === "requition" && (
           <RequisitionSection/>
        )}
         
      </main>
    </div>
  );
};
