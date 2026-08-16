 
import { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  ShoppingCart,
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  PackageCheck,
} from "lucide-react";
import { NotificationBell } from "../ui/NotificationBell";

import requisitionService from "../../services/requisitionService";
import purchaseOrderService from "../../services/purchaseOrderService";
 
import './OverviewSection.css';


const REQUISITION_STATUSES = [
  "PENDING_MANAGER",
  "MANAGER_REJECTED",
  "PENDING_FINANCE",
  "FINANCE_REJECTED",
  "PENDING_ADMIN",
  "PENDING_PROCUREMENT",
  "PROCUREMENT_REJECTED",
  "ADMIN_REJECTED",
  "APPROVED",
  "PO_GENERATED",
  "CANCELLED",
  "SENT_TO_SUPPLIER",
];

/* =========================================================
   PURCHASE ORDER STATUSES
========================================================= */

const PO_STATUSES = [
  "PO_GENERATED",
  "SENT_TO_SUPPLIER",
  "PO_RECEIVED",
  "IN_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

/* =========================================================
   COLORS
========================================================= */

const REQUISITION_COLORS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#22c55e",
  "#3b82f6",
  "#64748b",
  "#14b8a6",
];

const PO_COLORS = [
  "#6366f1",
  "#14b8a6",
  "#06b6d4",
  "#f59e0b",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
];

const formatStatus = (status) => {
  if (!status) return "-";

  return status.replaceAll("_", " ");
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const mockRequisitions = [
  { id: 1, requisitionNo: "REQ-001", title: "Office Laptops", employeeName: "Alice Smith", departmentName: "Engineering", status: "PENDING_PROCUREMENT", totalEstimatedAmount: 125000, createdAt: new Date(Date.now() - 86400000).toISOString(), isDuplicate: false },
  { id: 2, requisitionNo: "REQ-002", title: "Marketing Software", employeeName: "Bob Jones", departmentName: "Marketing", status: "APPROVED", totalEstimatedAmount: 45000, createdAt: new Date(Date.now() - 172800000).toISOString(), isDuplicate: false },
  { id: 3, requisitionNo: "REQ-003", title: "Office Chairs", employeeName: "Charlie Brown", departmentName: "HR", status: "PROCUREMENT_REJECTED", totalEstimatedAmount: 15000, createdAt: new Date(Date.now() - 259200000).toISOString(), isDuplicate: false },
  { id: 4, requisitionNo: "REQ-004", title: "Server Hardware", employeeName: "David Lee", departmentName: "IT", status: "PO_GENERATED", totalEstimatedAmount: 250000, createdAt: new Date(Date.now() - 345600000).toISOString(), isDuplicate: false },
  { id: 5, requisitionNo: "REQ-005", title: "Office Supplies", employeeName: "Eva White", departmentName: "Operations", status: "PENDING_PROCUREMENT", totalEstimatedAmount: 5000, createdAt: new Date(Date.now() - 43200000).toISOString(), isDuplicate: true },
];

const mockOrders = [
  { id: 1, poNumber: "PO-001", requisitionNo: "REQ-004", supplierName: "Tech Corp", status: "IN_DELIVERY", totalAmount: 250000, expectedDeliveryDate: new Date(Date.now() + 172800000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 2, poNumber: "PO-002", requisitionNo: "REQ-010", supplierName: "Office Depot", status: "DELIVERED", totalAmount: 12000, expectedDeliveryDate: new Date(Date.now() - 86400000).toISOString(), createdAt: new Date(Date.now() - 432000000).toISOString() },
  { id: 3, poNumber: "PO-003", requisitionNo: "REQ-011", supplierName: "Soft Solutions", status: "COMPLETED", totalAmount: 85000, expectedDeliveryDate: new Date(Date.now() - 172800000).toISOString(), createdAt: new Date(Date.now() - 864000000).toISOString() },
  { id: 4, poNumber: "PO-004", requisitionNo: "REQ-012", supplierName: "Global IT", status: "PO_GENERATED", totalAmount: 150000, expectedDeliveryDate: new Date(Date.now() + 432000000).toISOString(), createdAt: new Date().toISOString() },
];

export const OverviewSection = ({ setActiveSection: setDashboardSection }) => {
  /* =========================================================
     STATE
  ========================================================= */

  const [requisitions, setRequisitions] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Chart/table filters */
  const [selectedReqStatus, setSelectedReqStatus] =
    useState("ALL");

  const [selectedPOStatus, setSelectedPOStatus] =
    useState("ALL");

  const [activeSection, setActiveSection] =
    useState("REQUISITIONS");

  /* =========================================================
     ERROR
  ========================================================= */

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  /* =========================================================
     LOAD REQUISITIONS
  ========================================================= */

  const loadRequisitions = async () => {
    const results = await Promise.all(
      REQUISITION_STATUSES.map(async (status) => {
        try {
          let result;

          /*
           * Procurement component uses two different service
           * methods for pending and processed requisitions.
           */
          if (status === "PENDING_PROCUREMENT") {
            result =
              await requisitionService.getRequisitionsByStatus(
                status
              );
          } else {
            result =
              await requisitionService.getProcurementRequisitionsByStatus(
                status
              );
          }

          return Array.isArray(result)
            ? result
            : [];
        } catch {
          return [];
        }
      })
    );

    const merged = results.flat();

    /* Remove duplicate requisitions */
    const unique = Array.from(
      new Map(
        merged.map((req) => [
          req.id,
          req,
        ])
      ).values()
    );

    unique.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );

    return unique;
  };

  /* =========================================================
     LOAD PURCHASE ORDERS
  ========================================================= */

  const loadPurchaseOrders = async () => {
    try {
      const result = await purchaseOrderService.getAll();
      return Array.isArray(result) ? result : [];
    } catch {
      return [];
    }
  };

  /* =========================================================
     LOAD EVERYTHING
  ========================================================= */

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        requisitionData,
        purchaseOrderData,
      ] = await Promise.all([
        loadRequisitions(),
        loadPurchaseOrders(),
      ]);

      if (requisitionData.length === 0 && purchaseOrderData.length === 0) {
        setRequisitions(mockRequisitions);
        setOrders(mockOrders);
      } else {
        setRequisitions(requisitionData);
        setOrders(purchaseOrderData);
      }
    } catch (err) {
      console.error(err);
      setRequisitions(mockRequisitions);
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* =========================================================
     REQUISITION METRICS
  ========================================================= */

  const totalRequisitions =
    requisitions.length;

  const pendingRequisitions =
    requisitions.filter((req) =>
      req.status?.startsWith("PENDING_")
    ).length;

  const approvedRequisitions =
    requisitions.filter(
      (req) => req.status === "APPROVED"
    ).length;

  const rejectedRequisitions =
    requisitions.filter((req) =>
      req.status?.includes("REJECTED")
    ).length;

  const duplicateRequisitions =
    requisitions.filter(
      (req) => req.isDuplicate === true
    ).length;

  const totalRequisitionAmount =
    requisitions.reduce(
      (sum, req) =>
        sum +
        Number(
          req.totalEstimatedAmount || 0
        ),
      0
    );

  /* =========================================================
     PO METRICS
  ========================================================= */

  const totalPOs = orders.length;

  const totalPOAmount =
    orders.reduce(
      (sum, po) =>
        sum +
        Number(po.totalAmount || 0),
      0
    );

  const inDeliveryPOs =
    orders.filter(
      (po) =>
        po.status === "IN_DELIVERY"
    ).length;

  const deliveredPOs =
    orders.filter(
      (po) =>
        po.status === "DELIVERED"
    ).length;

  const completedPOs =
    orders.filter(
      (po) =>
        po.status === "COMPLETED"
    ).length;

  const cancelledPOs =
    orders.filter(
      (po) =>
        po.status === "CANCELLED"
    ).length;

  /* =========================================================
     REQUISITION STATUS CHART
  ========================================================= */

  const requisitionStatusData = useMemo(() => {
    return REQUISITION_STATUSES.map(
      (status) => ({
        status,
        name: formatStatus(status),
        value: requisitions.filter(
          (req) =>
            req.status === status
        ).length,
      })
    ).filter(
      (item) => item.value > 0
    );
  }, [requisitions]);

  /* =========================================================
     PO STATUS CHART
  ========================================================= */

  const poStatusData = useMemo(() => {
    return PO_STATUSES.map(
      (status) => ({
        status,
        name: formatStatus(status),
        value: orders.filter(
          (po) =>
            po.status === status
        ).length,
      })
    ).filter(
      (item) => item.value > 0
    );
  }, [orders]);

  /* =========================================================
     REQUISITION AMOUNT BY STATUS
  ========================================================= */

  const requisitionAmountData =
    useMemo(() => {
      return REQUISITION_STATUSES.map(
        (status) => {
          const amount =
            requisitions
              .filter(
                (req) =>
                  req.status === status
              )
              .reduce(
                (sum, req) =>
                  sum +
                  Number(
                    req.totalEstimatedAmount ||
                      0
                  ),
                0
              );

          return {
            status: formatStatus(
              status
            ),
            amount,
          };
        }
      ).filter(
        (item) => item.amount > 0
      );
    }, [requisitions]);

  /* =========================================================
     PO AMOUNT BY STATUS
  ========================================================= */

  const poAmountData = useMemo(() => {
    return PO_STATUSES.map(
      (status) => {
        const amount =
          orders
            .filter(
              (po) =>
                po.status === status
            )
            .reduce(
              (sum, po) =>
                sum +
                Number(
                  po.totalAmount || 0
                ),
              0
            );

        return {
          status: formatStatus(
            status
          ),
          amount,
        };
      }
    ).filter(
      (item) => item.amount > 0
    );
  }, [orders]);

  /* =========================================================
     DUPLICATE DATA
  ========================================================= */

  const duplicateData = useMemo(() => {
    const duplicate =
      requisitions.filter(
        (req) =>
          req.isDuplicate === true
      ).length;

    const normal =
      requisitions.length -
      duplicate;

    return [
      {
        name: "Normal",
        value: normal,
      },
      {
        name: "Duplicate",
        value: duplicate,
      },
    ];
  }, [requisitions]);

  /* =========================================================
     FILTERED TABLE DATA
  ========================================================= */

  const filteredRequisitions =
    useMemo(() => {
      if (
        selectedReqStatus ===
        "DUPLICATE"
      ) {
        return requisitions.filter(
          (req) =>
            req.isDuplicate === true
        );
      }

      if (
        selectedReqStatus ===
        "ALL"
      ) {
        return requisitions;
      }

      return requisitions.filter(
        (req) =>
          req.status ===
          selectedReqStatus
      );
    }, [
      requisitions,
      selectedReqStatus,
    ]);

  const filteredOrders = useMemo(() => {
    if (
      selectedPOStatus ===
      "ALL"
    ) {
      return orders;
    }

    return orders.filter(
      (po) =>
        po.status ===
        selectedPOStatus
    );
  }, [
    orders,
    selectedPOStatus,
  ]);

  /* =========================================================
     PIE CLICK HANDLERS
  ========================================================= */

  const handleReqChartClick = (data) => {
    if (!data?.status) return;

    setSelectedReqStatus(
      data.status
    );

    setActiveSection(
      "REQUISITIONS"
    );
  };

  const handlePOChartClick = (data) => {
    if (!data?.status) return;

    setSelectedPOStatus(
      data.status
    );

    setActiveSection(
      "PURCHASE_ORDERS"
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="procurement-overview">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="overview-header">

        <div>
          <h2>
            Procurement Overview
          </h2>

          <p>
            Complete overview of requisitions,
            purchase orders and delivery progress
          </p>
        </div>

        <div className="header-actions">
          <NotificationBell setActiveSection={setDashboardSection} />
          <button
            className="overview-refresh"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="overview-error">
          <span>{error}</span>

          <button
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      {!loading && (
        <div className="overview-metrics">

          <div className="overview-metric-card">

            <div className="overview-metric-icon purple">
              <ClipboardList
                size={23}
              />
            </div>

            <div>
              <span>
                Total Requisitions
              </span>

              <strong>
                {totalRequisitions}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon amber">
              <Clock3 size={23} />
            </div>

            <div>
              <span>
                Pending Requisitions
              </span>

              <strong>
                {pendingRequisitions}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon green">
              <CheckCircle2
                size={23}
              />
            </div>

            <div>
              <span>
                Approved Requisitions
              </span>

              <strong>
                {approvedRequisitions}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon red">
              <XCircle size={23} />
            </div>

            <div>
              <span>
                Rejected
              </span>

              <strong>
                {rejectedRequisitions}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon blue">
              <ShoppingCart
                size={23}
              />
            </div>

            <div>
              <span>
                Total Purchase Orders
              </span>

              <strong>
                {totalPOs}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon cyan">
              <Truck size={23} />
            </div>

            <div>
              <span>
                In Delivery
              </span>

              <strong>
                {inDeliveryPOs}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon teal">
              <PackageCheck
                size={23}
              />
            </div>

            <div>
              <span>
                Delivered
              </span>

              <strong>
                {deliveredPOs}
              </strong>
            </div>

          </div>


          <div className="overview-metric-card">

            <div className="overview-metric-icon dark-green">
              <CheckCircle2
                size={23}
              />
            </div>

            <div>
              <span>
                Completed POs
              </span>

              <strong>
                {completedPOs}
              </strong>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          TOTAL AMOUNTS
      ===================================================== */}

      {!loading && (
        <div className="amount-summary-grid">

          <div className="amount-summary-card">

            <div>
              <span>
                Total Requisition Value
              </span>

              <h3>
                {formatCurrency(
                  totalRequisitionAmount
                )}
              </h3>
            </div>

            <ClipboardList
              size={28}
            />

          </div>


          <div className="amount-summary-card">

            <div>
              <span>
                Total Purchase Order Value
              </span>

              <h3>
                {formatCurrency(
                  totalPOAmount
                )}
              </h3>
            </div>

            <ShoppingCart
              size={28}
            />

          </div>


          <div className="amount-summary-card">

            <div>
              <span>
                Duplicate Requisitions
              </span>

              <h3>
                {duplicateRequisitions}
              </h3>
            </div>

            <AlertTriangle
              size={28}
            />

          </div>


          <div className="amount-summary-card">

            <div>
              <span>
                Cancelled POs
              </span>

              <h3>
                {cancelledPOs}
              </h3>
            </div>

            <XCircle
              size={28}
            />

          </div>

        </div>
      )}

      {/* =====================================================
          MAIN CHART GRID
      ===================================================== */}

      {!loading && (
        <div className="overview-chart-grid">

          {/* =================================================
              REQUISITION STATUS
          ================================================= */}

          <div className="overview-card">

            <div className="overview-card-header">

              <div>
                <h3>
                  Requisition Status
                </h3>

                <p>
                  Click a section to filter requisitions
                </p>
              </div>

              <Filter
                size={18}
              />

            </div>

            <div className="overview-chart">

              {requisitionStatusData.length >
              0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={370}
                >
                  <PieChart>

                    <Pie
                      data={
                        requisitionStatusData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={125}
                      paddingAngle={3}
                      onClick={
                        handleReqChartClick
                      }
                      cursor="pointer"
                    >
                      {requisitionStatusData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`req-${index}`}
                            fill={
                              REQUISITION_COLORS[
                                index %
                                  REQUISITION_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      wrapperStyle={{
                        fontSize:
                          "11px",
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>

              ) : (
                <div className="chart-empty">
                  No requisition data
                </div>
              )}

            </div>

          </div>


          {/* =================================================
              PO STATUS
          ================================================= */}

          <div className="overview-card">

            <div className="overview-card-header">

              <div>
                <h3>
                  Purchase Order Status
                </h3>

                <p>
                  Click a section to filter POs
                </p>
              </div>

              <Filter
                size={18}
              />

            </div>

            <div className="overview-chart">

              {poStatusData.length >
              0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={370}
                >
                  <PieChart>

                    <Pie
                      data={
                        poStatusData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={75}
                      outerRadius={125}
                      paddingAngle={3}
                      onClick={
                        handlePOChartClick
                      }
                      cursor="pointer"
                    >
                      {poStatusData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`po-${index}`}
                            fill={
                              PO_COLORS[
                                index %
                                  PO_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      wrapperStyle={{
                        fontSize:
                          "11px",
                      }}
                    />

                  </PieChart>
                </ResponsiveContainer>

              ) : (
                <div className="chart-empty">
                  No purchase order data
                </div>
              )}

            </div>

          </div>
          <div className="overview-card duplicate-card">

            <div className="overview-card-header">

              <div>
                <h3>
                  Duplicate Requisitions
                </h3>

                <p>
                  Duplicate vs normal
                </p>
              </div>

              <AlertTriangle
                size={18}
              />

            </div>

            <div className="overview-chart">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={
                      duplicateData
                    }
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={4}
                  >
                    <Cell
                      fill="#22c55e"
                    />

                    <Cell
                      fill="#ef4444"
                    />
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

            <button
              className="duplicate-view-button"
              onClick={() => {
                setSelectedReqStatus(
                  "DUPLICATE"
                );

                setActiveSection(
                  "REQUISITIONS"
                );
              }}
            >
              View Duplicate Requisitions
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          INTERACTIVE FILTER BAR
      ===================================================== */}

      {!loading && (
        <div className="overview-filter-card">

          <div className="filter-title">

            <Filter size={18} />

            <strong>
              Interactive Filters
            </strong>

          </div>

          <div className="filter-tabs">

            <button
              className={
                activeSection ===
                "REQUISITIONS"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                setActiveSection(
                  "REQUISITIONS"
                )
              }
            >
              Requisitions
            </button>

            <button
              className={
                activeSection ===
                "PURCHASE_ORDERS"
                  ? "filter-tab active"
                  : "filter-tab"
              }
              onClick={() =>
                setActiveSection(
                  "PURCHASE_ORDERS"
                )
              }
            >
              Purchase Orders
            </button>

          </div>

          {activeSection ===
            "REQUISITIONS" && (

            <div className="status-pills">

              <button
                className={
                  selectedReqStatus ===
                  "ALL"
                    ? "status-pill active"
                    : "status-pill"
                }
                onClick={() =>
                  setSelectedReqStatus(
                    "ALL"
                  )
                }
              >
                All
              </button>

              {REQUISITION_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    className={
                      selectedReqStatus ===
                      status
                        ? "status-pill active"
                        : "status-pill"
                    }
                    onClick={() =>
                      setSelectedReqStatus(
                        status
                      )
                    }
                  >
                    {formatStatus(
                      status
                    )}
                  </button>
                )
              )}

              <button
                className={
                  selectedReqStatus ===
                  "DUPLICATE"
                    ? "status-pill duplicate active"
                    : "status-pill duplicate"
                }
                onClick={() =>
                  setSelectedReqStatus(
                    "DUPLICATE"
                  )
                }
              >
                Duplicate
              </button>

            </div>

          )}

          {activeSection ===
            "PURCHASE_ORDERS" && (

            <div className="status-pills">

              <button
                className={
                  selectedPOStatus ===
                  "ALL"
                    ? "status-pill active"
                    : "status-pill"
                }
                onClick={() =>
                  setSelectedPOStatus(
                    "ALL"
                  )
                }
              >
                All
              </button>

              {PO_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    className={
                      selectedPOStatus ===
                      status
                        ? "status-pill active"
                        : "status-pill"
                    }
                    onClick={() =>
                      setSelectedPOStatus(
                        status
                      )
                    }
                  >
                    {formatStatus(
                      status
                    )}
                  </button>
                )
              )}

            </div>

          )}

        </div>
      )}

      {/* =====================================================
          FILTERED REQUISITION LIST
      ===================================================== */}

      {!loading &&
        activeSection ===
          "REQUISITIONS" && (

          <div className="overview-card">

            <div className="overview-card-header">

              <div>
                <h3>
                  Requisition Details
                </h3>

                <p>
                  Showing{" "}
                  {
                    filteredRequisitions.length
                  }{" "}
                  requisition(s)
                </p>
              </div>

            </div>

            <div className="overview-table-wrapper">

              <table className="overview-table">

                <thead>

                  <tr>
                    <th>
                      Req No
                    </th>

                    <th>
                      Title
                    </th>

                    <th>
                      Employee
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Duplicate
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredRequisitions.length >
                  0 ? (

                    filteredRequisitions
                      .slice(0, 15)
                      .map(
                        (req) => (

                          <tr
                            key={req.id}
                          >

                            <td>
                              {
                                req.requisitionNo
                              }
                            </td>

                            <td>
                              {
                                req.title ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                req.employeeName ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                req.departmentName ||
                                "-"
                              }
                            </td>

                            <td>

                              <span
                                className={`overview-status ${req.status?.toLowerCase()}`}
                              >
                                {formatStatus(
                                  req.status
                                )}
                              </span>

                            </td>

                            <td>
                              {formatCurrency(
                                req.totalEstimatedAmount
                              )}
                            </td>

                            <td>

                              {req.isDuplicate ? (

                                <span className="duplicate-mini">
                                  Duplicate
                                </span>

                              ) : (

                                <span className="normal-mini">
                                  Normal
                                </span>

                              )}

                            </td>

                          </tr>

                        )
                      )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="overview-no-data"
                      >
                        No requisitions found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {filteredRequisitions.length >
              15 && (
              <div className="table-footer">
                Showing first 15 of{" "}
                {
                  filteredRequisitions.length
                }{" "}
                requisitions
              </div>
            )}

          </div>

        )}

      {/* =====================================================
          FILTERED PURCHASE ORDERS
      ===================================================== */}

      {!loading &&
        activeSection ===
          "PURCHASE_ORDERS" && (

          <div className="overview-card">

            <div className="overview-card-header">

              <div>
                <h3>
                  Purchase Order Details
                </h3>

                <p>
                  Showing{" "}
                  {filteredOrders.length}{" "}
                  purchase order(s)
                </p>
              </div>

            </div>

            <div className="overview-table-wrapper">

              <table className="overview-table">

                <thead>

                  <tr>
                    <th>
                      PO Number
                    </th>

                    <th>
                      Requisition No
                    </th>

                    <th>
                      Supplier
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Expected Delivery
                    </th>

                    <th>
                      Created
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.length >
                  0 ? (

                    filteredOrders
                      .slice(0, 15)
                      .map(
                        (po) => (

                          <tr
                            key={po.id}
                          >

                            <td>
                              {
                                po.poNumber
                              }
                            </td>

                            <td>
                              {
                                po.requisitionNo ||
                                "-"
                              }
                            </td>

                            <td>
                              {
                                po.supplierName ||
                                "-"
                              }
                            </td>

                            <td>

                              <span
                                className={`overview-status ${po.status?.toLowerCase()}`}
                              >
                                {formatStatus(
                                  po.status
                                )}
                              </span>

                            </td>

                            <td>
                              {formatCurrency(
                                po.totalAmount
                              )}
                            </td>

                            <td>
                              {po.expectedDeliveryDate
                                ? new Date(
                                    po.expectedDeliveryDate
                                  ).toLocaleDateString()
                                : "-"}
                            </td>

                            <td>
                              {po.createdAt
                                ? new Date(
                                    po.createdAt
                                  ).toLocaleDateString()
                                : "-"}
                            </td>

                          </tr>

                        )
                      )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="overview-no-data"
                      >
                        No purchase orders found
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {filteredOrders.length >
              15 && (
              <div className="table-footer">
                Showing first 15 of{" "}
                {
                  filteredOrders.length
                }{" "}
                purchase orders
              </div>
            )}

          </div>

        )}

    </div>
  );
};
 
 
