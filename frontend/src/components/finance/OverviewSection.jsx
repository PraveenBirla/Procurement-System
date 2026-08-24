import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { NotificationBell } from "../ui/NotificationBell";

import requisitionService from "../../services/requisitionService";
import authService from "../../services/authService";
// import "./FinanceOverviewSection.css";

const PENDING_QUERY = "PENDING_FINANCE";
const APPROVED_QUERY = "APPROVED";
const REJECTED_QUERY = "REJECTED";

const BUCKET = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

const STATUS_COLORS = {
  [BUCKET.PENDING]: "#f59e0b",
  [BUCKET.APPROVED]: "#22c55e",
  [BUCKET.REJECTED]: "#ef4444",
};

export const OverviewSection = ({
  setActiveSection: setDashboardSection,
  urgentCount,
  onViewUrgentRequests,
}) => {
  const currentUser = authService.getUser();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [selectedRequisition, setSelectedRequisition] =
    useState(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [trackedReq, setTrackedReq] = useState(null);

  const [trackingId, setTrackingId] = useState(null);

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadOverview = async () => {
    setLoading(true);

    try {
      const [pending, approved, rejected] =
        await Promise.all([
          requisitionService.getRequisitionsByStatus(
            PENDING_QUERY
          ),

          requisitionService.getFinanceRequisitionsByStatus(
            APPROVED_QUERY
          ),

          requisitionService.getFinanceRequisitionsByStatus(
            REJECTED_QUERY
          ),
        ]);

      const pendingTagged = (
        Array.isArray(pending) ? pending : []
      ).map((req) => ({
        ...req,
        _bucket: BUCKET.PENDING,
      }));

      const approvedTagged = (
        Array.isArray(approved) ? approved : []
      ).map((req) => ({
        ...req,
        _bucket: BUCKET.APPROVED,
      }));

      const rejectedTagged = (
        Array.isArray(rejected) ? rejected : []
      ).map((req) => ({
        ...req,
        _bucket: BUCKET.REJECTED,
      }));

      const merged = [
        ...pendingTagged,
        ...approvedTagged,
        ...rejectedTagged,
      ];

      const seen = new Map();

      merged.forEach((req) => {
        if (!seen.has(req.id)) {
          seen.set(req.id, req);
        }
      });

      const unique = Array.from(seen.values());

      unique.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

      setRequisitions(unique);
      setError("");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load requisitions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  /* =====================================================
     COUNTS
  ===================================================== */

  const pendingCount = useMemo(
    () =>
      requisitions.filter(
        (req) => req._bucket === BUCKET.PENDING
      ).length,
    [requisitions]
  );

  const approvedCount = useMemo(
    () =>
      requisitions.filter(
        (req) => req._bucket === BUCKET.APPROVED
      ).length,
    [requisitions]
  );

  const rejectedCount = useMemo(
    () =>
      requisitions.filter(
        (req) => req._bucket === BUCKET.REJECTED
      ).length,
    [requisitions]
  );

  const total = requisitions.length;

  /* =====================================================
     CHART
  ===================================================== */

  const chartData = useMemo(
    () =>
      [
        {
          status: BUCKET.PENDING,
          name: "Pending",
          value: pendingCount,
        },
        {
          status: BUCKET.APPROVED,
          name: "Approved",
          value: approvedCount,
        },
        {
          status: BUCKET.REJECTED,
          name: "Rejected",
          value: rejectedCount,
        },
      ].filter((item) => item.value > 0),
    [
      pendingCount,
      approvedCount,
      rejectedCount,
    ]
  );

  const priorityData = useMemo(() => {
    const counts = requisitions.reduce(
      (totals, req) => {
        const priority = String(req.priority ?? "").trim().toUpperCase();
        if (priority === "HIGH") totals.high += 1;
        if (priority === "NORMAL" || priority === "LOW") totals.normal += 1;
        return totals;
      },
      { high: 0, normal: 0 }
    );

    return counts.high + counts.normal > 0
      ? [
          { name: "HIGH", value: counts.high },
          { name: "NORMAL", value: counts.normal },
        ]
      : [];
  }, [requisitions]);

  const handleChartClick = (data) => {
    const status = data?.payload?.status;

    if (status) {
      setSelectedFilter(status);
    }
  };

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredRequisitions = useMemo(() => {
    if (selectedFilter === "ALL") {
      return requisitions;
    }

    return requisitions.filter(
      (req) => req._bucket === selectedFilter
    );
  }, [requisitions, selectedFilter]);

  /* =====================================================
     VIEW
  ===================================================== */

  const handleView = (req) => {
    setSelectedRequisition(req);
  };

  /* =====================================================
     TRACK
  ===================================================== */

  const handleTrack = async (req) => {
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setTrackingId(req.id);
    setHistory([]);

    try {
      const result =
        await requisitionService.getRequisitionHistory(
          req.id
        );

      setHistory(
        Array.isArray(result) ? result : []
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load history"
      );

      setShowTrackModal(false);
    } finally {
      setLoadingHistory(false);
      setTrackingId(null);
    }
  };

  const closeTrackModal = () => {
    setShowTrackModal(false);
    setHistory([]);
    setTrackedReq(null);
  };

  /* =====================================================
     FORMAT
  ===================================================== */

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .toString()
      .replaceAll("_", " ");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString("en-IN");
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN");

  const getStatusClass = (bucket) => {
    if (bucket === BUCKET.PENDING) return "pending";
    if (bucket === BUCKET.APPROVED) return "approved";
    if (bucket === BUCKET.REJECTED) return "rejected";

    return "";
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="finance-overview">

      {/* HEADER */}

      <div className="overview-header">

        <div>
          <h2>{currentUser?.fullName ? `Welcome, ${currentUser.fullName}` : "Finance Overview"}</h2>
          <p>
            Overview of employee requisitions
            awaiting or completed by Finance.
          </p>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationBell setActiveSection={setDashboardSection} />
          <button
            type="button"
            className="overview-refresh-btn"
            onClick={loadOverview}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "spin" : ""}
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="error-box">
          <span>{error}</span>

          <button
            type="button"
            className="error-dismiss"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {!loading && (
        <>

          {/* KPI */}

          <div className="overview-metrics">

            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === "ALL"
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedFilter("ALL")
              }
            >
              <div className="overview-icon purple">
                <ClipboardList size={23} />
              </div>

              <div>
                <span>All Requisitions</span>
                <strong>{total}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.PENDING
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedFilter(BUCKET.PENDING)
              }
            >
              <div className="overview-icon amber">
                <Clock3 size={23} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.APPROVED
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedFilter(BUCKET.APPROVED)
              }
            >
              <div className="overview-icon green">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </button>

            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.REJECTED
                  ? "selected"
                  : ""
              }`}
              onClick={() =>
                setSelectedFilter(BUCKET.REJECTED)
              }
            >
              <div className="overview-icon red">
                <XCircle size={23} />
              </div>

              <div>
                <span>Rejected</span>
                <strong>{rejectedCount}</strong>
              </div>
            </button>

          </div>

          {urgentCount > 0 && (
            <button type="button" className="role-priority-alert" onClick={onViewUrgentRequests}>
              <span className="role-priority-alert-content">
                <strong>High Priority Requests</strong>
                <span className="role-priority-alert-message">
                  <AlertTriangle size={18} />
                  {urgentCount} high-priority request{urgentCount === 1 ? "" : "s"} require your attention - View Requests
                </span>
              </span>
            </button>
          )}

          {/* CHART */}

          <div className="dashboard-chart-grid">
          <div className="overview-chart-card">

            <div className="chart-header">

              <div>
                <h3>Finance Requisition Status</h3>
                <p>
                  Click a chart section to filter.
                </p>
              </div>

              <Filter size={18} />

            </div>

            <div
              className="overview-chart"
              style={{
                width: "100%",
                height: "400px",
                minHeight: "400px",
              }}
            >
              {chartData.length > 0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                >
                  <PieChart>

                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={130}
                      paddingAngle={4}
                      cursor="pointer"
                      onClick={handleChartClick}
                      label={({ name, value }) =>
                        `${name}: ${value}`
                      }
                    >
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={
                            STATUS_COLORS[
                              entry.status
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />

                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-chart-data">
                  No requisition data available.
                </div>
              )}
            </div>

          </div>

          <div className="overview-chart-card">
            <div className="chart-header">
              <div>
                <h3>Priority Distribution</h3>
                <p>Priority levels across your requisitions.</p>
              </div>
              <Filter size={18} />
            </div>
            <div className="overview-chart" style={{ width: "100%", height: "400px", minHeight: "400px" }}>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={priorityData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} label={{ value: "Requests", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Requisitions" radius={[6, 6, 0, 0]}>
                      {priorityData.map((entry) => (
                        <Cell key={entry.name} fill={entry.name === "HIGH" ? "#EF4444" : "#6366F1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-chart-data">No priority data available.</div>
              )}
            </div>
          </div>
          </div>

          {/* FILTER */}

          <div className="overview-filter-card">

            <div className="filter-heading">
              <Filter size={17} />
              <span>Requisition Filter</span>
            </div>

            <div className="filter-buttons">

              <button
                type="button"
                className={
                  selectedFilter === "ALL"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedFilter("ALL")
                }
              >
                All ({total})
              </button>

              <button
                type="button"
                className={
                  selectedFilter === BUCKET.PENDING
                    ? "filter-btn active pending"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedFilter(BUCKET.PENDING)
                }
              >
                Pending ({pendingCount})
              </button>

              <button
                type="button"
                className={
                  selectedFilter === BUCKET.APPROVED
                    ? "filter-btn active approved"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedFilter(BUCKET.APPROVED)
                }
              >
                Approved ({approvedCount})
              </button>

              <button
                type="button"
                className={
                  selectedFilter === BUCKET.REJECTED
                    ? "filter-btn active rejected"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedFilter(BUCKET.REJECTED)
                }
              >
                Rejected ({rejectedCount})
              </button>

            </div>

          </div>

          {/* TABLE */}

          <div className="overview-table-card">

            <div className="overview-table-header">

              <div>
                <h3>
                  {selectedFilter === "ALL"
                    ? "All Requisitions"
                    : selectedFilter ===
                      BUCKET.PENDING
                    ? "Pending Finance Requisitions"
                    : selectedFilter ===
                      BUCKET.APPROVED
                    ? "Approved Requisitions"
                    : "Rejected Requisitions"}
                </h3>

                <p>
                  Showing{" "}
                  {filteredRequisitions.length}{" "}
                  requisition(s)
                </p>
              </div>

            </div>

            <div className="table-wrapper">

              <table className="table">

                <thead>
                  <tr>
                    <th>Requisition No</th>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRequisitions.length > 0 ? (

                    filteredRequisitions.map((req) => (

                      <tr key={req.id}>

                        <td>
                          {req.requisitionNo || "-"}
                        </td>

                        <td>
                          {req.title || "-"}
                        </td>

                        <td>
                          {req.departmentName || "-"}
                        </td>

                        <td><span className={`priority-badge ${req.priority === "HIGH" ? "high" : "normal"}`}>{req.priority || "NORMAL"}</span></td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              req._bucket
                            )}`}
                          >
                            {formatStatus(req.status)}
                          </span>
                        </td>

                        <td>
                          ₹
                          {formatAmount(
                            req.totalEstimatedAmount
                          )}
                        </td>

                        <td>
                          {formatDate(req.createdAt)}
                        </td>

                        <td>

                          <div className="action-group">

                            <button
                              type="button"
                              className="view-btn"
                              onClick={() =>
                                handleView(req)
                              }
                            >
                              <Eye size={14} />
                              View
                            </button>

                            <button
                              type="button"
                              className="track-btn"
                              disabled={
                                trackingId === req.id
                              }
                              onClick={() =>
                                handleTrack(req)
                              }
                            >
                              <Clock3 size={14} />
                              {trackingId === req.id
                                ? "..."
                                : "Track"}
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td
                        colSpan="8"
                        className="no-data"
                      >
                        No requisitions found.
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>
      )}

      {/* VIEW MODAL */}

      {selectedRequisition &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedRequisition(null)
            }
          >
            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <h2>
                  {selectedRequisition.requisitionNo}
                </h2>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedRequisition(null)
                  }
                >
                  ×
                </button>

              </div>

              <p>
                <strong>Title:</strong>{" "}
                {selectedRequisition.title || "-"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedRequisition.description ||
                  "-"}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {selectedRequisition.departmentName ||
                  "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}

                <span
                  className={`status-badge ${getStatusClass(
                    selectedRequisition._bucket
                  )}`}
                >
                  {formatStatus(
                    selectedRequisition.status
                  )}
                </span>
              </p>

              <p>
                <strong>Total Amount:</strong>{" "}
                ₹
                {formatAmount(
                  selectedRequisition.totalEstimatedAmount
                )}
              </p>

              <h3>Products</h3>

              <div className="table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                    </tr>
                  </thead>

                  <tbody>

                    {selectedRequisition.items?.length >
                    0 ? (

                      selectedRequisition.items.map(
                        (item) => (
                          <tr key={item.id}>

                            <td>
                              {item.productName ||
                                "-"}
                            </td>

                            <td>
                              {item.quantity || 0}
                            </td>

                            <td>
                              ₹
                              {formatAmount(
                                item.unitPrice
                              )}
                            </td>

                          </tr>
                        )
                      )

                    ) : (

                      <tr>
                        <td
                          colSpan="3"
                          className="no-data"
                        >
                          No item details available
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              <div className="modal-actions">

                <button
                  className="close-btn"
                  onClick={() =>
                    setSelectedRequisition(null)
                  }
                >
                  Close
                </button>

              </div>

            </div>
          </div>,
          document.body
        )}

      {/* TRACK MODAL */}

      {showTrackModal &&
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
                  Track Requisition{" "}
                  {trackedReq
                    ? `- ${trackedReq.requisitionNo}`
                    : ""}
                </h2>

                <button
                  className="modal-close"
                  onClick={closeTrackModal}
                >
                  ×
                </button>

              </div>

              {loadingHistory ? (

                <p className="no-data">
                  Loading history...
                </p>

              ) : history.length > 0 ? (

                <div className="timeline">

                  {history.map(
                    (item, index) => (

                      <div
                        className="timeline-item"
                        key={index}
                      >

                        <div className="timeline-dot" />

                        <div className="timeline-content">

                          <h4>
                            {formatStatus(
                              item.newStatus
                            )}
                          </h4>

                          <p>
                            <b>Previous:</b>{" "}
                            {item.oldStatus
                              ? formatStatus(
                                  item.oldStatus
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

                    )
                  )}

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
