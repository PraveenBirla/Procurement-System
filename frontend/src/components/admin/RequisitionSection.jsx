
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

import requisitionService from "../../services/requisitionService";
import { Clock, Clock3, Eye } from "lucide-react";
 

const ALL_STATUSES = [
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
  "COMPLETED"
];

const STATUS_COLORS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#06b6d4",
  "#b91c1c",
  "#991b1b",
  "#22c55e",
  "#3b82f6",
  "#64748b",
  "#14b8a6",
];

export const RequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [trackedReq, setTrackedReq] = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Interactive filters
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    const anyOpen = !!selectedRequisition || showTrackModal;

    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
      }
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [selectedRequisition, showTrackModal]);

  const loadRequisitions = async () => {
    setLoading(true);

    try {
      const res = await requisitionService.getAllRequisitions();

      const data = Array.isArray(res) ? [...res] : [];

      data.sort(
        (a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
      );
      console.log(data);
      setRequisitions(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleView = (req) => {
    setSelectedRequisition(req);
  };

  const handleTrack = async (req) => {
    setTrackingId(req.id);
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setHistory([]);

    try {
      const res =
        await requisitionService.getRequisitionHistory(req.id);

      setHistory(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(getErrorMessage(err));
      setShowTrackModal(false);
    } finally {
      setLoadingHistory(false);
      setTrackingId(null);
    }
  };

  const closeTrackModal = () => {
    setTrackedReq(null);
    setHistory([]);
    setShowTrackModal(false);
  };

  /* =====================================================
     FILTERED REQUISITIONS
  ===================================================== */

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((req) => {
      if (selectedStatus === "DUPLICATE") {
        return req.isDuplicate === true;
      }

      const statusMatch =
        selectedStatus === "ALL" ||
        req.status === selectedStatus;

      const duplicateMatch =
        !showDuplicatesOnly || req.isDuplicate === true;

      return statusMatch && duplicateMatch;
    });
  }, [
    requisitions,
    selectedStatus,
    showDuplicatesOnly,
  ]);

  /* =====================================================
     STATUS DISTRIBUTION
  ===================================================== */

  const statusChartData = useMemo(() => {
    return ALL_STATUSES.map((status) => ({
      name: status.replaceAll("_", " "),
      value: requisitions.filter(
        (req) => req.status === status
      ).length,
      status,
    })).filter((item) => item.value > 0);
  }, [requisitions]);

  /* =====================================================
     AMOUNT BY STATUS
  ===================================================== */

  const amountByStatus = useMemo(() => {
    return ALL_STATUSES.map((status) => {
      const amount = requisitions
        .filter((req) => req.status === status)
        .reduce(
          (sum, req) =>
            sum + Number(req.totalEstimatedAmount || 0),
          0
        );

      return {
        status: status.replaceAll("_", " "),
        amount,
        originalStatus: status,
      };
    }).filter((item) => item.amount > 0);
  }, [requisitions]);

  /* =====================================================
     DUPLICATE DATA
  ===================================================== */

  const duplicateChartData = useMemo(() => {
    const duplicateCount = requisitions.filter(
      (req) => req.isDuplicate === true
    ).length;

    const normalCount =
      requisitions.length - duplicateCount;

    return [
      {
        name: "Normal",
        value: normalCount,
      },
      {
        name: "Duplicate",
        value: duplicateCount,
      },
    ];
  }, [requisitions]);

  /* =====================================================
     METRICS
  ===================================================== */

  const totalRequisitions = requisitions.length;

  const pendingCount = requisitions.filter((req) =>
    req.status?.startsWith("PENDING_")
  ).length;

  const approvedCount = requisitions.filter(
    (req) => req.status === "APPROVED"
  ).length;

  const rejectedCount = requisitions.filter((req) =>
    req.status?.includes("REJECTED")
  ).length;

  const duplicateCount = requisitions.filter(
    (req) => req.isDuplicate === true
  ).length;

  const totalEstimatedAmount = requisitions.reduce(
    (sum, req) =>
      sum + Number(req.totalEstimatedAmount || 0),
    0
  );

  return (
    <div className="admin-requisition-section">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="section-header">
        <h2 className="section-title">
          All Requisitions
        </h2>

        <button
          className="refresh-btn"
          onClick={loadRequisitions}
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
              📋
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Total Requisitions
              </div>

              <div className="metric-value">
                {totalRequisitions}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon amber">
              ⏳
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Pending
              </div>

              <div className="metric-value">
                {pendingCount}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon green">
              ✓
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Approved
              </div>

              <div className="metric-value">
                {approvedCount}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon red">
              !
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Rejected
              </div>

              <div className="metric-value">
                {rejectedCount}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon blue">
              ₹
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Estimated Amount
              </div>

              <div className="metric-value">
                ₹
                {totalEstimatedAmount.toLocaleString(
                  "en-IN",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon red">
              ⚠
            </div>

            <div className="metric-content">
              <div className="metric-label">
                Duplicates
              </div>

              <div className="metric-value">
                {duplicateCount}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* =================================================
          CHARTS
      ================================================= */}

      {!loading && requisitions.length > 0 && (
        <div className="charts-grid">

          {/* STATUS DISTRIBUTION */}

          <div className="chart-card">

            <div className="chart-header">
              <div>
                <h3>
                  Requisition Status Distribution
                </h3>

                <p>
                  Requisitions grouped by workflow status
                </p>
              </div>
            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={360}
              >
                <PieChart>

                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusChartData.map(
                      (entry, index) => (
                        <Cell
                          key={`status-${index}`}
                          fill={
                            STATUS_COLORS[
                              index %
                                STATUS_COLORS.length
                            ]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend
                    wrapperStyle={{
                      fontSize: "11px",
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>

            </div>
          </div>

         
 

          {/* DUPLICATE CHART */}

          <div className="chart-card duplicate-chart">

            <div className="chart-header">

              <div>
                <h3>
                  Duplicate Requisitions
                </h3>

                <p>
                  Duplicate vs normal requisitions
                </p>
              </div>

            </div>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={duplicateChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#ef4444" />
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

            <button
              className={
                showDuplicatesOnly
                  ? "duplicate-filter active"
                  : "duplicate-filter"
              }
              onClick={() =>
                setShowDuplicatesOnly(
                  (prev) => !prev
                )
              }
            >
              {showDuplicatesOnly
                ? "Show All Requisitions"
                : "Show Duplicate Requisitions"}
            </button>

          </div>

        </div>
      )}

      {/* =================================================
          STATUS FILTERS
      ================================================= */}

      {!loading && requisitions.length > 0 && (
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
              onClick={() =>
                setSelectedStatus(status)
              }
            >
              {status.replaceAll("_", " ")}
            </button>
          ))}

          <button
            className={
              selectedStatus === "DUPLICATE"
                ? "status-filter duplicate-status active"
                : "status-filter duplicate-status"
            }
            onClick={() => {
              setSelectedStatus("DUPLICATE");
              setShowDuplicatesOnly(false);
            }}
          >
            DUPLICATE
          </button>

        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-wrapper">

        <table className="table">

          <thead>

            <tr>
              <th>Req No</th>
              <th>Title</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Status</th>
              <th>Duplicate</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan="9"
                  className="no-data"
                >
                  Loading…
                </td>
              </tr>

            ) : filteredRequisitions.length > 0 ? (

              filteredRequisitions.map((req) => (

                <tr key={req.id}>

                  <td data-label="Req No">
                    {req.requisitionNo}
                  </td>

                  <td data-label="Title">
                    {req.title}
                  </td>

                  <td data-label="Employee">
                    {req.employeeName}
                  </td>

                  <td data-label="Department">
                    {req.departmentName}
                  </td>

                  <td data-label="Status">

                    <span
                      className={`status-badge ${
                        req.status
                          ? req.status.toLowerCase()
                          : ""
                      }`}
                    >
                      {req.status
                        ? req.status.replaceAll(
                            "_",
                            " "
                          )
                        : "-"}
                    </span>

                  </td>

                  <td data-label="Duplicate">

                    {req.isDuplicate ? (
                      <span className="duplicate-badge">
                        Duplicate
                      </span>
                    ) : (
                      <span className="normal-badge">
                        Normal
                      </span>
                    )}

                  </td>

                  <td data-label="Amount">

                    ₹
                    {Number(
                      req.totalEstimatedAmount || 0
                    ).toLocaleString("en-IN")}

                  </td>

                  <td data-label="Created">

                    {req.createdAt
                      ? new Date(
                          req.createdAt
                        ).toLocaleDateString()
                      : "-"}

                  </td>

                  <td data-label="Action">

                    <div className="action-group">

                      <button
                        className="view-btn"
                        onClick={() =>
                          handleView(req)
                        }
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        className="track-btn"
                        onClick={() =>
                          handleTrack(req)
                        }
                        disabled={
                          trackingId === req.id
                        }
                      >
                        <Clock size={14} />
                        {trackingId === req.id
                          ? "…"
                          : "Track"}
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="9"
                  className="no-data"
                >
                  No Requisitions Found
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          VIEW MODAL
      ================================================= */}

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
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              <p>
                <strong>Title:</strong>{" "}
                {selectedRequisition.title}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedRequisition.description}
              </p>

              <p>
                <strong>Employee:</strong>{" "}
                {selectedRequisition.employeeName}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {selectedRequisition.departmentName}
              </p>

              <p>
                <strong>Status:</strong>{" "}

                <span
                  className={`status-badge ${
                    selectedRequisition.status
                      ? selectedRequisition.status.toLowerCase()
                      : ""
                  }`}
                >
                  {selectedRequisition.status
                    ? selectedRequisition.status.replaceAll(
                        "_",
                        " "
                      )
                    : "-"}
                </span>
              </p>

              <p>
                <strong>Duplicate:</strong>{" "}

                {selectedRequisition.isDuplicate ? (
                  <span className="duplicate-badge">
                    Duplicate
                  </span>
                ) : (
                  <span className="normal-badge">
                    Normal
                  </span>
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

                    {selectedRequisition.items &&
                    selectedRequisition.items.length >
                      0 ? (

                      selectedRequisition.items.map(
                        (item) => (

                          <tr key={item.id}>

                            <td data-label="Product">
                              {item.productName}
                            </td>

                            <td data-label="Qty">
                              {item.quantity}
                            </td>

                            <td data-label="Unit Price">
                              ₹
                              {Number(
                                item.unitPrice || 0
                              ).toLocaleString(
                                "en-IN"
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

      {/* =================================================
          TRACK MODAL
      ================================================= */}

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
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              {loadingHistory ? (

                <p className="no-data">
                  Loading history…
                </p>

              ) : history.length > 0 ? (

                <div className="timeline">

                  {history.map((item, index) => (

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
 