import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react";

import requisitionService from "../../services/requisitionService";
import "./OverviewSection.css";

/* =====================================================
   QUERY PARAMS — same ones already used (and working) in
   PendingSection / ApprovedSection / RejectedSection.
===================================================== */
const PENDING_QUERY = "PENDING_MANAGER";
const APPROVED_QUERY = "APPROVED";
const REJECTED_QUERY = "REJECTED";

/* =====================================================
   BUCKETS — counting/chart/filter logic is based on WHICH
   API call a requisition came from, not on matching the
   raw `status` text returned by the backend.

   Why: PendingSection/ApprovedSection/RejectedSection just
   render whatever `status` text the backend sends back, so
   they "work" regardless of what that text actually is.
   The Overview used to do `req.status === "APPROVED"` etc.
   to build counts — if the backend's real stored status
   after manager action isn't literally "APPROVED"/"REJECTED"
   (e.g. it becomes something like PENDING_FINANCE or
   MANAGER_REJECTED once workflow moves on), that equality
   check silently fails, all counts come out 0, and the
   chart shows "No requisition data available" even though
   the table has rows. Tagging by source query fixes this
   regardless of what the backend's status text is.
===================================================== */
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

const STATUS_LABELS = {
  [BUCKET.PENDING]: "Pending",
  [BUCKET.APPROVED]: "Approved",
  [BUCKET.REJECTED]: "Rejected",
};

// CSS class names so existing .pending/.approved/.rejected badge styles keep working
const STATUS_CLASSNAMES = {
  [BUCKET.PENDING]: "pending",
  [BUCKET.APPROVED]: "approved",
  [BUCKET.REJECTED]: "rejected",
};

export const OverviewSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Current filter — "ALL" | BUCKET.PENDING | BUCKET.APPROVED | BUCKET.REJECTED
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  // Selected requisition for modal
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  /* =====================================================
     ERROR MESSAGE
  ===================================================== */

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  /* =====================================================
     LOAD ALL REQUISITIONS
  ===================================================== */

  const loadOverview = async () => {
    setLoading(true);

    try {
      const [pending, approved, rejected] = await Promise.all([
        requisitionService.getRequisitionsByStatusManager(PENDING_QUERY),
        requisitionService.getManagerRequisitionsByStatus(APPROVED_QUERY),
        requisitionService.getManagerRequisitionsByStatus(REJECTED_QUERY),
      ]);

      // Tag each requisition with the bucket it was fetched under —
      // this is what drives counts/chart/filter, NOT req.status text.
      const pendingTagged = (Array.isArray(pending) ? pending : []).map(
        (req) => ({ ...req, _bucket: BUCKET.PENDING })
      );

      const approvedTagged = (Array.isArray(approved) ? approved : []).map(
        (req) => ({ ...req, _bucket: BUCKET.APPROVED })
      );

      const rejectedTagged = (Array.isArray(rejected) ? rejected : []).map(
        (req) => ({ ...req, _bucket: BUCKET.REJECTED })
      );

      const merged = [...pendingTagged, ...approvedTagged, ...rejectedTagged];

      // Remove duplicate requisitions (keeps first occurrence's bucket)
      const seen = new Map();
      for (const req of merged) {
        if (!seen.has(req.id)) {
          seen.set(req.id, req);
        }
      }
      const unique = Array.from(seen.values());

      // Latest requisition first
      unique.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      setRequisitions(unique);
      setError("");
    } catch (err) {
      console.error("Failed to load requisitions:", err);

      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadOverview();
  }, []);

  /* =====================================================
     COUNTS (bucket-based)
  ===================================================== */

  const pendingCount = useMemo(() => {
    return requisitions.filter((req) => req._bucket === BUCKET.PENDING)
      .length;
  }, [requisitions]);

  const approvedCount = useMemo(() => {
    return requisitions.filter((req) => req._bucket === BUCKET.APPROVED)
      .length;
  }, [requisitions]);

  const rejectedCount = useMemo(() => {
    return requisitions.filter((req) => req._bucket === BUCKET.REJECTED)
      .length;
  }, [requisitions]);

  const total = requisitions.length;

  /* =====================================================
     CHART DATA
  ===================================================== */

  const chartData = useMemo(() => {
    return [
      {
        status: BUCKET.PENDING,
        name: STATUS_LABELS[BUCKET.PENDING],
        value: pendingCount,
      },
      {
        status: BUCKET.APPROVED,
        name: STATUS_LABELS[BUCKET.APPROVED],
        value: approvedCount,
      },
      {
        status: BUCKET.REJECTED,
        name: STATUS_LABELS[BUCKET.REJECTED],
        value: rejectedCount,
      },
    ].filter((item) => Number(item.value) > 0);
  }, [pendingCount, approvedCount, rejectedCount]);

  /* =====================================================
     FILTERED REQUISITIONS (bucket-based)
  ===================================================== */

  const filteredRequisitions = useMemo(() => {
    if (selectedFilter === "ALL") {
      return requisitions;
    }

    return requisitions.filter((req) => req._bucket === selectedFilter);
  }, [requisitions, selectedFilter]);

  /* =====================================================
     CHART CLICK
  ===================================================== */

  const handleChartClick = (data) => {
    const status = data?.payload?.status;

    if (!status) {
      return;
    }

    setSelectedFilter(status);
  };

  /* =====================================================
     FORMAT STATUS — shows the real raw status text from
     the backend (whatever it is), just underscore-cleaned.
  ===================================================== */

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status.toString().replaceAll("_", " ");
  };

  // Badge color/class is driven by bucket, not raw status text
  const getStatusClass = (bucket) => {
    return STATUS_CLASSNAMES[bucket] || "";
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  /* =====================================================
     FORMAT AMOUNT
  ===================================================== */

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <div className="manager-overview">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="overview-header">
        <div>
          <h2>Manager Overview</h2>
          <p>Overview of all employee requisitions.</p>
        </div>

        <button
          type="button"
          className="overview-refresh-btn"
          onClick={loadOverview}
          disabled={loading}
        >
          <RefreshCw size={17} className={loading ? "spin" : ""} />
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
            type="button"
            className="error-dismiss"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          CONTENT
      ================================================= */}

      {!loading && (
        <>
          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="overview-metrics">
            {/* ALL */}
            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === "ALL" ? "selected" : ""
              }`}
              onClick={() => setSelectedFilter("ALL")}
            >
              <div className="overview-icon purple">
                <ClipboardList size={23} />
              </div>

              <div>
                <span>All Requisitions</span>
                <strong>{total}</strong>
              </div>
            </button>

            {/* PENDING */}
            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.PENDING ? "selected" : ""
              }`}
              onClick={() => setSelectedFilter(BUCKET.PENDING)}
            >
              <div className="overview-icon amber">
                <Clock3 size={23} />
              </div>

              <div>
                <span>Pending</span>
                <strong>{pendingCount}</strong>
              </div>
            </button>

            {/* APPROVED */}
            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.APPROVED ? "selected" : ""
              }`}
              onClick={() => setSelectedFilter(BUCKET.APPROVED)}
            >
              <div className="overview-icon green">
                <CheckCircle2 size={23} />
              </div>

              <div>
                <span>Approved</span>
                <strong>{approvedCount}</strong>
              </div>
            </button>

            {/* REJECTED */}
            <button
              type="button"
              className={`overview-metric-card ${
                selectedFilter === BUCKET.REJECTED ? "selected" : ""
              }`}
              onClick={() => setSelectedFilter(BUCKET.REJECTED)}
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

        {/* =================================================
    CHART
================================================= */}

<div className="overview-chart-card">

  <div className="chart-header">
    <div>
      <h3>Requisition Status</h3>
      <p>
        Click a chart section to filter the requisitions.
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
        minHeight={0}
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
                  STATUS_COLORS[entry.status] ||
                  "#8884d8"
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
          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="overview-filter-card">
            <div className="filter-heading">
              <Filter size={17} />
              <span>Requisition Filter</span>
            </div>

            <div className="filter-buttons">
              {/* ALL */}
              <button
                type="button"
                className={
                  selectedFilter === "ALL"
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() => setSelectedFilter("ALL")}
              >
                All ({total})
              </button>

              {/* PENDING */}
              <button
                type="button"
                className={
                  selectedFilter === BUCKET.PENDING
                    ? "filter-btn active pending"
                    : "filter-btn"
                }
                onClick={() => setSelectedFilter(BUCKET.PENDING)}
              >
                Pending ({pendingCount})
              </button>

              {/* APPROVED */}
              <button
                type="button"
                className={
                  selectedFilter === BUCKET.APPROVED
                    ? "filter-btn active approved"
                    : "filter-btn"
                }
                onClick={() => setSelectedFilter(BUCKET.APPROVED)}
              >
                Approved ({approvedCount})
              </button>

              {/* REJECTED */}
              <button
                type="button"
                className={
                  selectedFilter === BUCKET.REJECTED
                    ? "filter-btn active rejected"
                    : "filter-btn"
                }
                onClick={() => setSelectedFilter(BUCKET.REJECTED)}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* =================================================
              TABLE
          ================================================= */}

          <div className="overview-table-card">
            <div className="overview-table-header">
              <div>
                <h3>
                  {selectedFilter === "ALL"
                    ? "All Requisitions"
                    : selectedFilter === BUCKET.PENDING
                    ? "Pending Requisitions"
                    : selectedFilter === BUCKET.APPROVED
                    ? "Approved Requisitions"
                    : "Rejected Requisitions"}
                </h3>

                <p>Showing {filteredRequisitions.length} requisition(s)</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Requisition No</th>
                    <th>Title</th>
                    <th>Employee</th>
                    <th>Department</th>
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
                        <td>{req.requisitionNo || "-"}</td>
                        <td>{req.title || "-"}</td>
                        <td>{req.employeeName || "-"}</td>
                        <td>{req.departmentName || "-"}</td>

                        <td>
                          <span
                            className={`status-badge ${getStatusClass(
                              req._bucket
                            )}`}
                          >
                            {formatStatus(req.status)}
                          </span>
                        </td>

                        <td>₹{formatAmount(req.totalEstimatedAmount)}</td>
                        <td>{formatDate(req.createdAt)}</td>

                        <td>
                          <button
                            type="button"
                            className="view-btn"
                            onClick={() => setSelectedRequisition(req)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
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

      {/* =================================================
          VIEW MODAL
      ================================================= */}

      {selectedRequisition &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() => setSelectedRequisition(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* MODAL HEADER */}
              <div className="modal-header">
                <h2>
                  {selectedRequisition.requisitionNo ||
                    "Requisition Details"}
                </h2>

                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setSelectedRequisition(null)}
                >
                  ×
                </button>
              </div>

              {/* BASIC DETAILS */}
              <p>
                <strong>Title:</strong> {selectedRequisition.title || "-"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedRequisition.description || "-"}
              </p>

              <p>
                <strong>Employee:</strong>{" "}
                {selectedRequisition.employeeName || "-"}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {selectedRequisition.departmentName || "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${getStatusClass(
                    selectedRequisition._bucket
                  )}`}
                >
                  {formatStatus(selectedRequisition.status)}
                </span>
              </p>

              <p>
                <strong>Total Amount:</strong> ₹
                {formatAmount(selectedRequisition.totalEstimatedAmount)}
              </p>

              <p>
                <strong>Created:</strong>{" "}
                {formatDate(selectedRequisition.createdAt)}
              </p>

              {/* PRODUCTS */}
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
                    {Array.isArray(selectedRequisition.items) &&
                    selectedRequisition.items.length > 0 ? (
                      selectedRequisition.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{item.productName || "-"}</td>
                          <td>{item.quantity || 0}</td>
                          <td>₹{formatAmount(item.unitPrice)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-data">
                          No item details available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* MODAL ACTIONS */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setSelectedRequisition(null)}
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