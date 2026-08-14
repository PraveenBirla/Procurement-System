import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingCart,
  DollarSign,
  Truck,
  CheckCircle2,
} from "lucide-react";

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
  LineChart,
  Line,
} from "recharts";

import purchaseOrderService from "../../services/purchaseOrderService";
import "./OverviewSection.css";

export const OverviewSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Track PO history modal
  const [trackPo, setTrackPo] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);

  // Interactive status filter
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    document.body.style.overflow = trackPo ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") closeTrackModal();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [trackPo]);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const res = await purchaseOrderService.getAll();

      setOrders(Array.isArray(res) ? res : []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = (po) => {
    if (!po.pdfURL) return;

    window.open(po.pdfURL, "_blank", "noopener,noreferrer");
  };

  const handleViewInvoice = (po) => {
    if (!po.invoiceURL) return;

    window.open(po.invoiceURL, "_blank", "noopener,noreferrer");
  };

  const handleTrack = async (po) => {
    setTrackingId(po.id);
    setTrackPo(po);
    setPoHistory([]);
    setLoadingPoHistory(true);

    try {
      const res = await purchaseOrderService.getPurchaseOrderHistory(po.id);

      setPoHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(getErrorMessage(err));
      setTrackPo(null);
    } finally {
      setLoadingPoHistory(false);
      setTrackingId(null);
    }
  };

  const closeTrackModal = () => {
    setTrackPo(null);
    setPoHistory([]);
  };

  /* =====================================================
     BASIC METRICS
  ===================================================== */

  const totalPOs = orders.length;

  const totalAmount = orders.reduce(
    (sum, po) => sum + Number(po.totalAmount || 0),
    0
  );

  const inDeliveryCount = orders.filter(
    (po) => po.status === "IN_DELIVERY"
  ).length;

  const completedCount = orders.filter(
    (po) => po.status === "COMPLETED"
  ).length;

  /* =====================================================
     FILTERED ORDERS
  ===================================================== */

  const filteredOrders = useMemo(() => {
    if (selectedStatus === "ALL") {
      return orders;
    }

    return orders.filter((po) => po.status === selectedStatus);
  }, [orders, selectedStatus]);

  /* =====================================================
     STATUS CHART DATA
  ===================================================== */

 const ALL_STATUSES = [
  "PO_GENERATED",
  "SENT_TO_SUPPLIER",
  "PO_RECEIVED",
  "IN_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

const statusChartData = useMemo(() => {
  return ALL_STATUSES.map((status) => ({
    name: status.replaceAll("_", " "),
    value: orders.filter((po) => po.status === status).length,
    status,
  }));
}, [orders]);

  /* =====================================================
     AMOUNT BY STATUS
  ===================================================== */

  const amountByStatus = useMemo(() => {
  return ALL_STATUSES.map((status) => {
    const amount = orders
      .filter((po) => po.status === status)
      .reduce(
        (sum, po) => sum + Number(po.totalAmount || 0),
        0
      );

    return {
      status: status.replaceAll("_", " "),
      amount,
    };
  });
}, [orders]);

   

  const monthlyPOData = useMemo(() => {
    const months = {};

    orders.forEach((po) => {
      if (!po.createdAt) return;

      const date = new Date(po.createdAt);

      if (isNaN(date.getTime())) return;

      const key = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!months[key]) {
        months[key] = {
          month: key,
          orders: 0,
          amount: 0,
          sortDate: new Date(date.getFullYear(), date.getMonth(), 1),
        };
      }

      months[key].orders += 1;
      months[key].amount += Number(po.totalAmount || 0);
    });

    return Object.values(months)
      .sort((a, b) => a.sortDate - b.sortDate)
      .map(({ month, orders, amount }) => ({
        month,
        orders,
        amount,
      }));
  }, [orders]);

  /* =====================================================
     COLORS
  ===================================================== */

  const chartColors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#8b5cf6",
  ];

  return (
    <div className="admin-requisition-section">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="section-header">
        <h2 className="section-title">Purchase Orders</h2>

        <button
          className="refresh-btn"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="error-box">
          <span>{error}</span>

          <button
            className="error-dismiss"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          METRICS
      ================================================= */}

      {!loading && (
        <div className="metrics-grid">

          <div className="metric-card">
            <div className="metric-icon purple">
              <ShoppingCart size={24} />
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Total Purchase Orders
              </div>

              <div className="metric-value">
                {totalPOs}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon green">
              <DollarSign size={24} />
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Total Amount
              </div>

              <div className="metric-value">
                ₹
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon amber">
              <Truck size={24} />
            </div>

            <div className="metric-content">
              <div className="metric-label">
                In Delivery
              </div>

              <div className="metric-value">
                {inDeliveryCount}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon blue">
              <CheckCircle2 size={24} />
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Completed
              </div>

              <div className="metric-value">
                {completedCount}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =================================================
          CHARTS
      ================================================= */}

      {!loading && orders.length > 0 && (
        <div className="charts-grid">

          {/* STATUS DONUT */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>PO Status Distribution</h3>
                <p>Purchase orders by status</p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>

                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartColors[index % chartColors.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>

          {/* AMOUNT BY STATUS */}
          <div className="chart-card">

            <div className="chart-header">
              <div>
                <h3>Amount by Status</h3>
                <p>Total purchase value</p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer width="100%" height={300}>

                <BarChart data={amountByStatus}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />

                  <Bar
                    dataKey="amount"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* MONTHLY TREND */}
          
        </div>
      )}

      {/* =================================================
          STATUS FILTER
      ================================================= */}

      <div className="status-filter-wrapper">

        <button
          className={
            selectedStatus === "ALL"
              ? "status-filter active"
              : "status-filter"
          }
          onClick={() => setSelectedStatus("ALL")}
        >
          All
        </button>
{ALL_STATUSES.map((status) => (
  <button
    key={status}
    className={
      selectedStatus === status
        ? "status-filter active"
        : "status-filter"
    }
    onClick={() => setSelectedStatus(status)}
  >
    {status.replaceAll("_", " ")}
  </button>
))}

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-wrapper">

        <table className="table">

          <thead>
            <tr>
              <th>PO Number</th>
              <th>Requisition No</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Expected Delivery</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan="8" className="no-data">
                  Loading…
                </td>
              </tr>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((po) => (

                <tr key={po.id}>

                  <td data-label="PO Number">
                    {po.poNumber}
                  </td>

                  <td data-label="Requisition No">
                    {po.requisitionNo}
                  </td>

                  <td data-label="Supplier">
                    {po.supplierName || "-"}
                  </td>

                  <td data-label="Status">

                    <span
                      className={`status-badge ${po.status?.toLowerCase()}`}
                    >
                      {po.status
                        ? po.status.replaceAll("_", " ")
                        : "-"}
                    </span>

                  </td>

                  <td data-label="Amount">
                    ₹
                    {Number(
                      po.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td data-label="Expected Delivery">

                    {po.expectedDeliveryDate
                      ? new Date(
                          po.expectedDeliveryDate
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  <td data-label="Created">

                    {po.createdAt
                      ? new Date(
                          po.createdAt
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  <td data-label="Action">

                    <div className="action-group">

                      <button
                        className="view-btn"
                        onClick={() =>
                          handleViewPO(po)
                        }
                        disabled={!po.pdfURL}
                      >
                        View PO
                      </button>

                      <button
                        className="view-btn"
                        onClick={() =>
                          handleViewInvoice(po)
                        }
                        disabled={!po.invoiceURL}
                      >
                        View Invoice
                      </button>

                      <button
                        className="track-btn"
                        onClick={() =>
                          handleTrack(po)
                        }
                        disabled={
                          trackingId === po.id
                        }
                      >
                        {trackingId === po.id
                          ? "…"
                          : "Track"}
                      </button>

                    </div>

                  </td>

                </tr>

              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Purchase Orders Found
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          TRACK PO MODAL
      ================================================= */}

      {trackPo &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={closeTrackModal}
          >

            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <h2>
                  Track PO — {trackPo.poNumber}
                </h2>

                <button
                  className="modal-close"
                  onClick={closeTrackModal}
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              {loadingPoHistory ? (
                <p className="no-data">
                  Loading history…
                </p>
              ) : poHistory.length > 0 ? (

                <div className="timeline">

                  {poHistory.map((item, index) => (

                    <div
                      className="timeline-item"
                      key={index}
                    >

                      <div className="timeline-dot"></div>

                      <div className="timeline-content">

                        <h4>
                          {item.newStatus
                            ? item.newStatus.replaceAll(
                                "_",
                                " "
                              )
                            : "-"}
                        </h4>

                        <p>
                          <b>Previous:</b>{" "}
                          {item.oldStatus
                            ? item.oldStatus.replaceAll(
                                "_",
                                " "
                              )
                            : "-"}
                        </p>

                        <p>
                          <b>Remarks:</b>{" "}
                          {item.remarks || "-"}
                        </p>

                        <p>
                          <b>Date:</b>{" "}
                          {item.changedAt
                            ? new Date(
                                item.changedAt
                              ).toLocaleString()
                            : "-"}
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (
                <p className="no-data">
                  No history available.
                </p>
              )}

              <div className="modal-actions">

                <button
                  className="close-btn"
                  onClick={closeTrackModal}
                >
                  Close
                </button>

              </div>

            </div>

          </div>,

          document.body
        )}

    </div>
  );
};