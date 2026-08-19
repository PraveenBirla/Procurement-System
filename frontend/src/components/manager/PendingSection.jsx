import { useEffect, useState, useRef } from "react";
import requisitionService from "../../services/requisitionService";
import { createPortal } from "react-dom";
import { Eye, CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const PENDING_STATUS = "PENDING_MANAGER";
const STORAGE_KEY = "manager_pending_timers_v2";

export const PendingSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [resettingId, setResettingId] = useState(null);

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
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  const storeTimer = (id, timerData) => {
    try {
      const timers = getStoredTimers();
      timers[id] = timerData; // stores { expiresAt, decision, remarks }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (e) {
      console.error(e);
    }
  };

  const removeStoredTimer = (id) => {
    try {
      const timers = getStoredTimers();
      delete timers[id];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    } catch (e) {
      console.error(e);
    }
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
  };

  const commitBackendAction = async (id, decision, remarks) => {
    try {
      await requisitionService.managerUpdate(id, {
        decision,
        remarks,
      });

      setRequisitions((prev) => prev.filter((r) => r.id !== id));
      removeStoredTimer(id);
    } catch (err) {
      console.error("Failed to commit delayed backend decision:", err);
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
      const result = await requisitionService.getRequisitionsByStatusManager(
        PENDING_STATUS
      );

      const storedTimers = getStoredTimers();
      const now = Date.now();

      const data = Array.isArray(result) ? [...result] : [];

      const mappedData = data.map((req) => {
        const timerInfo = storedTimers[req.id];
        const expiry = typeof timerInfo === "object" ? timerInfo?.expiresAt : timerInfo;

        if (expiry && expiry > now) {
          scheduleExpiration(req.id, expiry, timerInfo.decision, timerInfo.remarks);

          return {
            ...req,
            status: timerInfo.decision === "approved" ? "APPROVED" : "REJECTED",
            pendingDecision: timerInfo.decision,
            pendingRemarks: timerInfo.remarks,
            localExpiresAt: expiry,
          };
        } else {
          if (expiry) removeStoredTimer(req.id);
          return { ...req, localExpiresAt: null, pendingDecision: null, pendingRemarks: null };
        }
      });

      setRequisitions(mappedData);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load pending requisitions"
      );
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
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to reset decision"
      );
    } finally {
      setResettingId(null);
    }
  };

  const formatStatus = (status) => {
    return status ? status.replaceAll("_", " ") : "-";
  };

  const getRemainingSeconds = (localExpiresAt) => {
    if (!localExpiresAt) return 0;
    return Math.max(0, Math.ceil((localExpiresAt - Date.now()) / 1000));
  };

  return (
    <div className="manager-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Pending Requisitions</h2>
          <p className="section-subtitle">
            Requisitions waiting for your decision.
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
              <th>Status</th>
              <th>Amount</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="no-data">
                  Loading...
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
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Pending Requisitions
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
                <strong>Amount:</strong> ₹
                {Number(
                  selectedRequisition.totalEstimatedAmount || 0
                ).toLocaleString("en-IN")}
              </p>

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
                      if (remarkError) setRemarkError("");
                    }}
                    placeholder="Enter remarks..."
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
                    {submittingAction ? "Submitting..." : "Confirm"}
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