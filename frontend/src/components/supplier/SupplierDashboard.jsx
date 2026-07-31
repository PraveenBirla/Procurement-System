import { useState } from "react";
import {
  CircleUserRound,
  LogOut
} from "lucide-react";  
import { RequisitionSection } from "./RequisitionSection";
import { SupplierProfileSection } from "./SupplierProfileSection"; 
import authService from "../../services/authService";

export const  SupplierDashboard  = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const menuItems = [
    { id: "profile", label: "profile", icon: CircleUserRound },
      
  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">Supplier</div>
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
        {activeSection === "profile" &&  <SupplierProfileSection/> }
      </main>
    </div>
  );
};
