import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react";

import requisitionService from "../../services/requisitionService";
import "./RequisitionSection.css";

const PENDING_STATUS = "PENDING_MANAGER";
const STORAGE_KEY = "manager_pending_timers_v2";
const TIMER_DURATION = 60 * 1000; // 60 seconds

export const PendingSection = ({ urgentOnly = false }) => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  // Timer & countdown state management
  const [timers, setTimers] = useState({}); // { [id]: { expiresAt, decision, remarks } }
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

  useEffect(() => {
    loadRequisitions();
  }, [urgentOnly]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentTimeouts = timeoutsRef.current;
    return () => {
      Object.values(currentTimeouts).forEach((t) => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const modalOpen = !!selectedRequisition || !!actionModal;
    document.body.style.overflow = modalOpen ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeActionModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRequisition, actionModal]);

  const loadRequisitions = async () => {
    setLoading(true);

    try {
      const res = urgentOnly
        ? await requisitionService.getManagerUrgentRequisitions()
        : await requisitionService.getRequisitionsByStatusManager(PENDING_STATUS);

      const data = Array.isArray(res) ? [...res] : [];

      data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRequisitions(data);
      setError("");

      hydrateTimersFromStorage(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const hydrateTimersFromStorage = (currentReqs) => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsedTimers = JSON.parse(stored);
      const now = Date.now();
      const activeTimers = {};

      currentReqs.forEach((req) => {
        const timerData = parsedTimers[req.id];
        if (timerData) {
          if (timerData.expiresAt > now) {
           
            activeTimers[req.id] = timerData;
            const remainingTime = timerData.expiresAt - now;
            
            if (timeoutsRef.current[req.id]) {
              clearTimeout(timeoutsRef.current[req.id]);
            }

            timeoutsRef.current[req.id] = setTimeout(() => {
              commitBackendAction(req.id, timerData.decision, timerData.remarks);
            }, remainingTime);
          } else {
            // Already expired while away, trigger commit immediately
            commitBackendAction(req.id, timerData.decision, timerData.remarks);
          }
        }
      });

      setTimers(activeTimers);
      saveTimersToStorage(activeTimers);
    } catch (e) {
      console.error("Failed to parse session storage timers", e);
    }
  };

  const saveTimersToStorage = (timerMap) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timerMap));
  };

  const removeStoredTimer = (id) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }

    setTimers((prev) => {
      const updated = { ...prev };
      delete updated[id];
      saveTimersToStorage(updated);
      return updated;
    });
  };

  const commitBackendAction = async (id, decision, remarksText) => {
    try {
      await requisitionService.managerUpdate(id, {
        decision,
        remarks: remarksText,
      });
      removeStoredTimer(id);
      loadRequisitions();
    } catch (err) {
      setError(getErrorMessage(err));
      removeStoredTimer(id);
    }
  };

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

    const reqId = actionModal.req.id;
    const decision = actionModal.type;
    const finalRemarks = remarks.trim();

    const expiresAt = Date.now() + TIMER_DURATION;

    const newTimerData = { expiresAt, decision, remarks: finalRemarks };

    const updatedTimers = {
      ...timers,
      [reqId]: newTimerData,
    };
    setTimers(updatedTimers);
    saveTimersToStorage(updatedTimers);

    if (timeoutsRef.current[reqId]) {
      clearTimeout(timeoutsRef.current[reqId]);
    }

    timeoutsRef.current[reqId] = setTimeout(() => {
      commitBackendAction(reqId, decision, finalRemarks);
    }, TIMER_DURATION);

    closeActionModal();
  };

  const handleResetDecision = (reqId) => {
    removeStoredTimer(reqId);
  };

  const formatStatus = (status) => {
    return status ? status.replaceAll("_", " ") : "-";
  };

  return (
    <div className="manager-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Pending Requisitions</h2>
          <p className="section-subtitle">
            Requisitions waiting for your approval decision.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadRequisitions}
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

      <div className="section-count">
        {requisitions.length} pending requisition(s)
      </div>

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
                <td colSpan="8" className="no-data">
                  Loading…
                </td>
              </tr>
            ) : requisitions.length > 0 ? (
              requisitions.map((req) => {
                const activeTimer = timers[req.id];
                const timeLeft = activeTimer
                  ? Math.max(0, Math.ceil((activeTimer.expiresAt - Date.now()) / 1000))
                  : 0;

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
                      {Number(
                        req.totalEstimatedAmount || 0
                      ).toLocaleString("en-IN")}
                    </td>
                    <td>
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="action-group">
                        <button
                          className="view-btn"
                          onClick={() => setSelectedRequisition(req)}
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {activeTimer ? (
                          <div className="timer-action-group" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span className="timer-badge" style={{ fontSize: "12px", fontWeight: 600, color: "#d97706" }}>
                              Reset in {timeLeft}s
                            </span>
                            <button
                              className="reset-btn"
                              onClick={() => handleResetDecision(req.id)}
                            >
                              <RotateCcw size={14} />
                              Reset Decision
                            </button>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
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

      {/* View Modal */}
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

      {/* Approve / Reject Modal */}
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
                <button className="modal-close" onClick={closeActionModal}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitAction}>
                <p className="action-summary">
                  <strong>{actionModal.req.title}</strong>
                </p>

                <div className="field">
                  <label>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                      if (remarkError) setRemarkError("");
                    }}
                    rows={4}
                    placeholder={
                      actionModal.type === "approved"
                        ? "Approval remarks..."
                        : "Reason for rejection..."
                    }
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
                  >
                    Confirm {actionModal.type === "approved" ? "Approve" : "Reject"}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeActionModal}
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
