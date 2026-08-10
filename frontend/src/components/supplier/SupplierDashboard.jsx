import { useState } from "react";
import {
  CircleUserRound,
   ClipboardList,
  CheckCircle,
  Truck,
  PackageCheck,
  LogOut,
  Package
} from "lucide-react";  
import { RequisitionSection } from "./RequisitionSection";
import { SupplierProfileSection } from "./SupplierProfileSection"; 
import { OrderSection } from "./OrderSection";
import { AcceptedOrderSection } from "./AcceptedOrderSection";
import { InDeliverySection } from "./IndeliverySection";
import { CompletedOrderSection } from "./CompletedOrderSection";
import { DeliveredOrderSection } from "./DeliveredOrderSection";
import authService from "../../services/authService";

export const  SupplierDashboard  = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const menuItems = [
    { id: "profile", label: "Profile", icon: CircleUserRound },
    { id: "orders", label: "Orders", icon: Package},
     { id: "acceptedorders", label: "Accepted Orders", icon: CheckCircle},
      {id: "indelivery", label: "Indelivery Orders", icon: Truck},
       {id: "delivered", label: "Delivered Orders", icon: PackageCheck},
        {id: "completed", label: "Completed Orders", icon: CheckCircle}
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
         {activeSection === "orders" &&  <OrderSection/> }
         {activeSection === "acceptedorders" && <AcceptedOrderSection/>}
         {activeSection === "indelivery" && <InDeliverySection/>}
         {activeSection === "delivered" && <DeliveredOrderSection/>}
         {activeSection === "completed" && <CompletedOrderSection/>}
      </main>
    </div>
  );
};
