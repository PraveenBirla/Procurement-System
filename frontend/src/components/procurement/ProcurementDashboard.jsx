import { useEffect, useState } from "react";
import {
 ClipboardList,
  BadgeCheck,
  ShoppingCart,
  Truck,
  PackageCheck,
  LogOut,
  Building2
} from "lucide-react";  
import authService from "../../services/authService";
import requisitionService from "../../services/requisitionService";
import { RequisitionSection } from "./RequisitionSection";
import { ApprovedRequisitionSection } from "./ApprovedRequisitionSection";
import { PurchaseOrderSection } from "./PurchaseOrderSection";
import { DeliveredSection } from "./DeliveredOrder";
import { CompletedOrderSection } from "./CompletedOrderSection"; 
import { SupplierSection } from "../admin/SupplierSection";
import { OverviewSection } from "./OverviewSection";
import { ThemeToggle } from "../ui/ThemeToggle";
import "../layout/DashboardShared.css";
export const ProcurementDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    requisitionService.getCurrentRoleUrgentCount().then(setUrgentCount).catch(() => setUrgentCount(0));
  }, [activeSection]);

  const menuItems = [ 
     { id: "overview", label: "Overview", icon:ClipboardList },
    { id: "requisition", label: "Requisition", icon:ClipboardList },
     { id: "ApprovedRequisition", label: "Approved Requisition", icon: BadgeCheck }, 
     { id: "PurchaseOrders", label: "Purchase Orders", icon: ShoppingCart },
     
     { id: "DeliveredOrders", label: "Delivered Orders", icon: Truck},
     { id: "CompletedOrders", label: "Completed Orders", icon: PackageCheck},
      { id: "suppliers", label: "Suppliers", icon: Building2 }

  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">ProCure  Procurement</div>
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
          {activeSection === "requisition" &&  <RequisitionSection setActiveSection={setActiveSection} /> }
          {activeSection === "ApprovedRequisition" &&  <ApprovedRequisitionSection setActiveSection={setActiveSection} /> }
          {activeSection === "PurchaseOrders" && <PurchaseOrderSection setActiveSection={setActiveSection} /> }
          {activeSection === "suppliers" && <SupplierSection setActiveSection={setActiveSection} /> }
          {activeSection === "DeliveredOrders" && <DeliveredSection setActiveSection={setActiveSection} /> }
          {activeSection === "CompletedOrders" && <CompletedOrderSection setActiveSection={setActiveSection} /> }
          {activeSection === "overview" && (
            <OverviewSection
              setActiveSection={setActiveSection}
              urgentCount={urgentCount}
              onViewUrgentRequests={() => setActiveSection("requisition")}
            />
          )}
      </main>
    </div>
  );
};
