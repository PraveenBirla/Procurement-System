import { useState } from "react";
import "./ReportsSection.css";
import { PurchaseOrderReport } from "./reports/PurchaseOrderReport";
import { RequisitionReport } from "./reports/RequisitionReport";
import { SupplierReport } from "./reports/SupplierReport";
import { SpendingReport } from "./reports/SpendingReport";
import { InventoryReport } from "./reports/InventoryReport";
import { POStatusReport } from "./reports/POStatusReport";
import { ApprovalReport } from "./reports/ApprovalReport";
import { SupplierPerformanceReport } from "./reports/SupplierPerformanceReport";
import { 
  BarChart3, 
  ClipboardList, 
  Building2, 
  Wallet, 
  PackageSearch, 
  ListOrdered, 
  CheckSquare, 
  TrendingUp 
} from "lucide-react";

export const ReportsSection = () => {
  const [activeTab, setActiveTab] = useState("spending");

  const tabs = [
    { id: "spending", label: "Spending", icon: Wallet },
    { id: "purchase-orders", label: "Purchase Orders", icon: BarChart3 },
    { id: "requisitions", label: "Requisitions", icon: ClipboardList },
    { id: "po-status", label: "PO Status", icon: ListOrdered },
    { id: "suppliers", label: "Suppliers", icon: Building2 },
    { id: "supplier-performance", label: "Supplier Perf.", icon: TrendingUp },
    { id: "inventory", label: "Inventory", icon: PackageSearch },
    { id: "approvals", label: "Approvals", icon: CheckSquare },
  ];

  const renderActiveReport = () => {
    switch (activeTab) {
      case "spending":
        return <SpendingReport />;
      case "purchase-orders":
        return <PurchaseOrderReport />;
      case "requisitions":
        return <RequisitionReport />;
      case "po-status":
        return <POStatusReport />;
      case "suppliers":
        return <SupplierReport />;
      case "supplier-performance":
        return <SupplierPerformanceReport />;
      case "inventory":
        return <InventoryReport />;
      case "approvals":
        return <ApprovalReport />;
      default:
        return <SpendingReport />;
    }
  };

  return (
    <div className="reports-hub animate-fade-in">
      <div className="reports-hub-header">
        <div>
          <h2>Analytics & Reports</h2>
          <p>Comprehensive insights into procurement performance and operations.</p>
        </div>
      </div>

      <div className="reports-tabs-container">
        <div className="reports-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`report-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="report-content-container">
        {renderActiveReport()}
      </div>
    </div>
  );
};
