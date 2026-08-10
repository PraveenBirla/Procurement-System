import { useState } from "react";
import {
 ClipboardList,
  BadgeCheck,
  ShoppingCart,
  Truck,
  PackageCheck,
  LogOut
} from "lucide-react";  
import authService from "../../services/authService";
import { RequisitionSection } from "./RequisitionSection";
import { ApprovedRequisitionSection } from "./ApprovedRequisitionSection";
import { PurchaseOrderSection } from "./PurchaseOrderSection";
import { DeliveredSection } from "./DeliveredOrder";
import { CompletedOrderSection } from "./CompletedOrderSection"; 

export const ProcurementDashboard = () => {
  const [activeSection, setActiveSection] = useState("requition");

  const menuItems = [
    { id: "requition", label: "Requition", icon:ClipboardList },
     { id: "ApprovedRequition", label: "Approved Requition", icon: BadgeCheck }, 
     { id: "PurchaseOrders", label: "Purchase Orders", icon: ShoppingCart },
     { id: "DeliveredOrders", label: "Delivered Orders", icon: Truck},
     { id: "CompletedOrders", label: "Completed Orders", icon: PackageCheck}

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
        {activeSection === "requition" &&  <RequisitionSection/> }
        {activeSection === "ApprovedRequition" &&  <ApprovedRequisitionSection/> }
        {activeSection === "PurchaseOrders" && <PurchaseOrderSection/> }
          {activeSection === "DeliveredOrders" && <DeliveredSection/> }
           {activeSection === "CompletedOrders" && <CompletedOrderSection/> }
      </main>
    </div>
  );
};
