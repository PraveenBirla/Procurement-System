import { useEffect, useState, useRef } from "react";
import requisitionService from "../../services/requisitionService";
import { createPortal } from "react-dom";
import { Eye, CheckCircle2, XCircle, RefreshCw, RotateCcw, Clock3 } from "lucide-react";

const PENDING_STATUS = "PENDING_PROCUREMENT";
const STORAGE_KEY = "procurement_pending_timers_v1";

export const RequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  // Track and History Modal states
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [trackedReq, setTrackedReq] = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [tick, setTick] = useState(0);
  const timeoutsRef = useRef({});

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  const getStoredTimers = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const storeTimer = (id, timerData) => {
    try {
      const timers = getStoredTimers();
      timers[id] = timerData; 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (e) {
      console.error(e);
    }
  };

  const removeStoredTimer = (id) => {
    try {
      const timers = getStoredTimers();
      delete timers[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (e) {
      console.error(e);
    }
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  };

  const commitBackendAction = async (id, decision, remarks) => {
    if (!decision || !remarks) {
      console.error("Missing decision or remarks for backend submission", { decision, remarks });
      removeStoredTimer(id);
      return;
    }

    const payload = {
      decision: decision,
      remarks: remarks,
    };

    try {
      if (requisitionService.procurementUpdate) {
        await requisitionService.procurementUpdate(id, payload);
      }
      setRequisitions((prev) => prev.filter((r) => r.id !== id));
      removeStoredTimer(id);
    } catch (err) {
      console.error("Failed to commit delayed procurement decision:", err);
      setError(getErrorMessage(err));
    }
  };

  const scheduleExpiration = (id, expiresAt, decision, remarks) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
    }

    const delay = Math.max(0, expiresAt - Date.now());

    timeoutsRef.current[id] = setTimeout(() => {
      commitBackendAction(id, decision, remarks);
    }, delay);
  };

  const loadPending = async () => {
    setLoading(true);
    try {
      const result = await requisitionService.getRequisitionsByStatus(
        PENDING_STATUS
      );

      const storedTimers = getStoredTimers();
      const now = Date.now();

      const data = Array.isArray(result) ? [...result] : [];

      const mappedData = data.map((req) => {
        const timerInfo = storedTimers[req.id];

        if (timerInfo && typeof timerInfo === "object" && timerInfo.expiresAt > now) {
          scheduleExpiration(req.id, timerInfo.expiresAt, timerInfo.decision, timerInfo.remarks);

          return {
            ...req,
            status: timerInfo.decision === "approved" ? "APPROVED" : "REJECTED",
            pendingDecision: timerInfo.decision,
            pendingRemarks: timerInfo.remarks,
            localExpiresAt: timerInfo.expiresAt,
          };
        } else {
          if (timerInfo) removeStoredTimer(req.id);
          return { ...req, localExpiresAt: null, pendingDecision: null, pendingRemarks: null };
        }
      });

      setRequisitions(mappedData);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    loadPending();
  }, []);

  const openActionModal = (req, type) => {
    setActionModal({ req, type });
    setRemarks("");
    setRemarkError("");
  };

  const closeActionModal = () => {
    if (submittingAction) return;
    setActionModal(null);
    setRemarks("");
    setRemarkError("");
  };

  const handleSubmitAction = (e) => {
    e.preventDefault();
    if (!actionModal) return;

    if (!remarks.trim()) {
      setRemarkError("Remarks are required");
      return;
    }

    try {
      setSubmittingAction(true);

      const expiresAt = Date.now() + 60 * 1000;
      const decisionType = actionModal.type;
      const trimmedRemarks = remarks.trim();
      const reqId = actionModal.req.id;

      storeTimer(reqId, {
        expiresAt,
        decision: decisionType,
        remarks: trimmedRemarks,
      });

      scheduleExpiration(reqId, expiresAt, decisionType, trimmedRemarks);

      const newStatus = decisionType === "approved" ? "APPROVED" : "REJECTED";

      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === reqId
            ? {
                ...r,
                status: newStatus,
                pendingDecision: decisionType,
                pendingRemarks: trimmedRemarks,
                localExpiresAt: expiresAt,
              }
            : r
        )
      );

      setActionModal(null);
      setRemarks("");
      setRemarkError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResetDecision = (requisitionId) => {
    try {
      setResettingId(requisitionId);
      removeStoredTimer(requisitionId);

      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === requisitionId
            ? {
                ...r,
                status: PENDING_STATUS,
                pendingDecision: null,
                pendingRemarks: null,
                localExpiresAt: null,
              }
            : r
        )
      );

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResettingId(null);
    }
  };

  const handleTrack = async (req) => {
    setTrackingId(req.id);
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setHistory([]);

    try {
      if (requisitionService.getRequisitionHistory) {
        const res = await requisitionService.getRequisitionHistory(req.id);
        setHistory(res || []);
      } else {
        setHistory([]);
      }
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

  const formatStatus = (status) => {
    return status ? status.replaceAll("_", " ") : "-";
  };

  const getRemainingSeconds = (localExpiresAt) => {
    if (!localExpiresAt) return 0;
    return Math.max(0, Math.ceil((localExpiresAt - Date.now()) / 1000));
  };

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Procurement Requisitions</h2>
          <p className="section-subtitle">
            Requisitions waiting for procurement review and decision.
          </p>
        </div>
        <button
          className="refresh-btn"
          onClick={loadPending}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Requisition No</th>
              <th>Title</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-data">
                  Loading requisitions...
                </td>
              </tr>
            ) : requisitions.length > 0 ? (
              requisitions.map((req) => {
                const remaining = getRemainingSeconds(req.localExpiresAt);
                const isDecidedRecently = Boolean(req.localExpiresAt && remaining > 0);

                return (
                  <tr key={req.id}>
                    <td>
                      <div className="req-number-cell">
                        {req.requisitionNo}
                        {req.isDuplicate && (
                          <span className="duplicate-badge">Duplicate</span>
                        )}
                      </div>
                    </td>
                    <td>{req.title || "-"}</td>
                    <td>{req.employeeName || "-"}</td>
                    <td>{req.departmentName || "-"}</td>
                    <td><span className={`priority-badge ${req.priority === "HIGH" ? "high" : "normal"}`}>{req.priority || "NORMAL"}</span></td>
                    <td>
                      <span
                        className={`status-badge ${
                          req.status?.toLowerCase() || ""
                        }`}
                      >
                        {formatStatus(req.status)}
                      </span>
                    </td>
                    <td>
                      ₹
                      {Number(req.totalEstimatedAmount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {isDecidedRecently ? (
                        <div className="inline-reset-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: '#b58100', fontWeight: 'bold' }}>
                            Reset in {remaining}s
                          </span>
                          <button
                            className="reset-btn"
                            onClick={() => handleResetDecision(req.id)}
                            disabled={resettingId === req.id}
                          >
                            <RotateCcw size={14} />
                            {resettingId === req.id ? "Resetting…" : "Reset Decision"}
                          </button>
                        </div>
                      ) : (
                        <div className="action-group">
                          <button
                            className="view-btn"
                            onClick={() => setSelectedRequisition(req)}
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            className="approve-btn"
                            onClick={() => openActionModal(req, "approved")}
                          >
                            <CheckCircle2 size={14} />
                            Approve
                          </button>

                          <button
                            className="reject-btn"
                            onClick={() => openActionModal(req, "rejected")}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>

                          <button
                            className="track-btn"
                            onClick={() => handleTrack(req)}
                            disabled={trackingId === req.id}
                          >
                            <Clock3 size={14} />
                            {trackingId === req.id ? "…" : "Track"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No Procurement Requisitions Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {selectedRequisition &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() => setSelectedRequisition(null)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>{selectedRequisition.requisitionNo}</h2>
                <button
                  className="modal-close"
                  onClick={() => setSelectedRequisition(null)}
                >
                  ×
                </button>
              </div>

              <p>
                <strong>Title:</strong> {selectedRequisition.title || "-"}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {selectedRequisition.description || "-"}
              </p>
              <p>
                <strong>Employee:</strong> {selectedRequisition.employeeName || "-"}
              </p>
              <p>
                <strong>Department:</strong>{" "}
                {selectedRequisition.departmentName || "-"}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status-badge ${
                    selectedRequisition.status?.toLowerCase() || ""
                  }`}
                >
                  {formatStatus(selectedRequisition.status)}
                </span>
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
                    {selectedRequisition.items?.length > 0 ? (
                      selectedRequisition.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>
                            ₹
                            {Number(item.unitPrice || 0).toLocaleString(
                              "en-IN"
                            )}
                          </td>
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

              <div className="modal-actions">
                <button
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

      {/* TRACK MODAL */}
      {showTrackModal &&
        createPortal(
          <div className="modal-overlay" onClick={closeTrackModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Track Requisition {trackedReq ? `- ${trackedReq.requisitionNo}` : ""}</h2>
                <button className="modal-close" onClick={closeTrackModal} aria-label="Close">
                  ×
                </button>
              </div>

              {loadingHistory ? (
                <p className="no-data">Loading history…</p>
              ) : history.length > 0 ? (
                <div className="timeline">
                  {history.map((item, index) => (
                    <div className="timeline-item" key={index}>
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <h4>{item.newStatus ? item.newStatus.replaceAll("_", " ") : "-"}</h4>
                        <p>
                          <b>Previous:</b> {item.oldStatus ? item.oldStatus.replaceAll("_", " ") : "-"}
                        </p>
                        <p>
                          <b>Remarks:</b> {item.remarks || "-"}
                        </p>
                        <p>
                          <b>Date:</b> {item.changedAt ? new Date(item.changedAt).toLocaleString() : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No history available.</p>
              )}

              <div className="modal-actions">
                <button className="close-btn" onClick={closeTrackModal}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ACTION MODAL */}
      {actionModal &&
        createPortal(
          <div className="modal-overlay" onClick={closeActionModal}>
            <div
              className="modal-content action-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  {actionModal.type === "approved" ? "Approve" : "Reject"} -{" "}
                  {actionModal.req.requisitionNo}
                </h2>
                <button
                  className="modal-close"
                  onClick={closeActionModal}
                  disabled={submittingAction}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitAction} noValidate>
                <div className="field">
                  <label>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                      if (remarkError) {
                        setRemarkError("");
                      }
                    }}
                    placeholder={
                      actionModal.type === "approved"
                        ? "Add a note for this approval..."
                        : "Reason for rejection..."
                    }
                    rows={4}
                    className={remarkError ? "input-error" : ""}
                  />
                  {remarkError && (
                    <span className="field-error">{remarkError}</span>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className={
                      actionModal.type === "approved"
                        ? "approve-btn-lg"
                        : "reject-btn-lg"
                    }
                    disabled={submittingAction}
                  >
                    {submittingAction ? "Submitting..." : actionModal.type === "approved"
                      ? "Confirm Approve"
                      : "Confirm Reject"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeActionModal}
                    disabled={submittingAction}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};