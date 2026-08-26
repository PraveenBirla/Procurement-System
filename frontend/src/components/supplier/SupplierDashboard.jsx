import { useState } from "react";
import {
  CircleUserRound,
   ClipboardList,
  CheckCircle,
  Truck,
  PackageCheck,
  LogOut,
  Package,
  Replace,
} from "lucide-react";  
import { RequisitionSection } from "./RequisitionSection";
import { SupplierProfileSection } from "./SupplierProfileSection"; 
import { OrderSection } from "./OrderSection";
import { AcceptedOrderSection } from "./AcceptedOrderSection";
import { InDeliverySection } from "./InDeliverySection";
import { CompletedOrderSection } from "./CompletedOrderSection";
import { DeliveredOrderSection } from "./DeliveredOrderSection";
import authService from "../../services/authService";
import { ThemeToggle } from "../ui/ThemeToggle";
import ReturnReplacementSection from "./ReturnReplacementSection";

export const  SupplierDashboard  = () => {
  const [activeSection, setActiveSection] = useState("profile");

  const menuItems = [
    { id: "profile", label: "Profile", icon: CircleUserRound },
    { id: "orders", label: "Orders", icon: Package},
     { id: "acceptedorders", label: "Accepted Orders", icon: CheckCircle},
      {id: "indelivery", label: "Indelivery Orders", icon: Truck},
       {id: "delivered", label: "Delivered Orders", icon: PackageCheck},
       {id: "issues in delivery", label: "Delivered Issues", icon: Replace },
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
        <div className="mt-auto pb-4 flex flex-col gap-2 px-2">
          <ThemeToggle />
          <button className="logout-btn" onClick={() => {authService.clearAuth();  window.location.reload();} }>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

     
      <main className="main-content animate-fade-in">
         {activeSection === "profile" &&  <SupplierProfileSection setActiveSection={setActiveSection} /> }
         {activeSection === "orders" &&  <OrderSection setActiveSection={setActiveSection} /> }
         {activeSection === "acceptedorders" && <AcceptedOrderSection setActiveSection={setActiveSection} />}
         {activeSection === "indelivery" && <InDeliverySection setActiveSection={setActiveSection} />}
        {activeSection === "delivered" && <DeliveredOrderSection setActiveSection={setActiveSection} />}
        {activeSection === "issues in delivery" && <ReturnReplacementSection setActiveSection={setActiveSection} />}
        {activeSection === "completed" && <CompletedOrderSection setActiveSection={setActiveSection} />}
      </main>
    </div>
  );
};
