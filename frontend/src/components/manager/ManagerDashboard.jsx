import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Clock3,
  CheckCircle2,
  XCircle,
  Package,
  LogOut,
  AlertTriangle
} from "lucide-react";  
import authService from "../../services/authService";
import { RequisitionSection } from "./RequisitionSection";
import { OverviewSection } from "./OverviewSection";
import { PendingSection } from "./PendingSection";
import { ApprovedSection } from "./ApprovedSection";
import { RejectedSection } from "./RejectedSection";
import requisitionService from "../../services/requisitionService";

export const ManagerDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [urgentCount, setUrgentCount] = useState(0);
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    requisitionService.getManagerUrgentCount().then(setUrgentCount).catch(() => setUrgentCount(0));
  }, [activeSection]);

  const openUrgentRequests = () => {
    setUrgentOnly(true);
    setActiveSection("pending");
  };

  const menuItems = [
    
      { id: "overview", label: "Overview", icon: LayoutDashboard }, 
      { id: "pending", label: "Pending", icon: Clock3 },
       { id: "approved", label: "Approved", icon:  CheckCircle2 }, 
       { id: "rejected", label: "Rejected", icon: XCircle },

  ];

  return (
    <div className="admin-dashboard">
       
      <aside className="sidebar">
        <div className="sidebar-header">ProCure Manager</div>
        <nav className="menu"> 
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => { setUrgentOnly(false); setActiveSection(item.id); }}
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
        {activeSection === "overview" && urgentCount > 0 && (
          <button type="button" className="error-box" onClick={openUrgentRequests}>
            <AlertTriangle size={18} /> <span><strong>High Priority Requests</strong><br />{urgentCount} request{urgentCount === 1 ? "" : "s"} require your immediate attention — View Requests</span>
          </button>
        )}
        {/* {activeSection === "requition" && (
           <RequisitionSection/>
        )} */}
        {activeSection === "overview" && (
           <OverviewSection setActiveSection={setActiveSection} />
        )}
        {activeSection === "pending" && (
           <PendingSection setActiveSection={setActiveSection} urgentOnly={urgentOnly} />
        )}
        {activeSection === "approved" && (
           <ApprovedSection setActiveSection={setActiveSection} />
        )}
        {activeSection === "rejected" && (
           <RejectedSection setActiveSection={setActiveSection} />
        )}
         
      </main>
    </div>
  );
};
