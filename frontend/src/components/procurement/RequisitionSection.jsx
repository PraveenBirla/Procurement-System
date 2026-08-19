import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import procurementService from "../../services/requisitionService";
import { Clock3, Eye } from "lucide-react";

const PENDING_STATUS = "PENDING_PROCUREMENT";
const PROCUREMENT_DECIDED = ["APPROVED", "REJECTED"];
const STORAGE_KEY = "procurement_pending_timers_v1";

const mockRequisitions = [
  { id: 1, requisitionNo: "REQ-001", title: "Office Laptops", employeeName: "Alice Smith", departmentName: "Engineering", status: "PENDING_PROCUREMENT", totalEstimatedAmount: 125000, createdAt: new Date(Date.now() - 86400000).toISOString(), isDuplicate: false, description: "Need 5 new laptops for the engineering team." },
  { id: 2, requisitionNo: "REQ-002", title: "Marketing Software", employeeName: "Bob Jones", departmentName: "Marketing", status: "APPROVED", totalEstimatedAmount: 45000, createdAt: new Date(Date.now() - 172800000).toISOString(), isDuplicate: false, description: "Annual subscription for Adobe Creative Cloud." },
  { id: 3, requisitionNo: "REQ-003", title: "Office Chairs", employeeName: "Charlie Brown", departmentName: "HR", status: "REJECTED", totalEstimatedAmount: 15000, createdAt: new Date(Date.now() - 259200000).toISOString(), isDuplicate: false, description: "Ergonomic chairs for new hires." },
  { id: 4, requisitionNo: "REQ-005", title: "Office Supplies", employeeName: "Eva White", departmentName: "Operations", status: "PENDING_PROCUREMENT", totalEstimatedAmount: 5000, createdAt: new Date(Date.now() - 43200000).toISOString(), isDuplicate: true, description: "Pens, paper, and staplers." },
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

  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [resettingId, setResettingId] = useState(null);

  const [tick, setTick] = useState(0);
  const timeoutsRef = useRef({});

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
      timers[id] = timerData; 
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
      if (procurementService.procurementUpdate) {
        await procurementService.procurementUpdate(id, payload);
      }
      setRequisitions((prev) => prev.filter((r) => r.id !== id));
      removeStoredTimer(id);
    } catch (err) {
      console.error("Failed to commit delayed procurement decision:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to commit decision");
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
    loadRequisitions();
  }, []);

  useEffect(() => {
    const anyOpen = !!selectedRequisition || showTrackModal || !!actionModal;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
        closeActionModal();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [selectedRequisition, showTrackModal, actionModal]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const pending = await procurementService.getRequisitionsByStatus(PENDING_STATUS);

      const processed = await Promise.all(
        PROCUREMENT_DECIDED.map(async (status) => {
          try {
            if (procurementService.getProcurementRequisitionsByStatus) {
              return await procurementService.getProcurementRequisitionsByStatus(status);
            }
            return [];
          } catch {
            return [];
          }
        })
      );

      const merged = [...(Array.isArray(pending) ? pending : []), ...processed.flat()];
      const unique = Array.from(new Map(merged.map((r) => [r.id, r])).values());
      
      const storedTimers = getStoredTimers();
      const now = Date.now();

      const mappedData = unique.map((req) => {
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

      mappedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequisitions(mappedData);
      setError("");
    } catch (err) {
      console.error(err);
      const storedTimers = getStoredTimers();
      const now = Date.now();
      const mappedMock = mockRequisitions.map((req) => {
        const timerInfo = storedTimers[req.id];
        if (timerInfo && typeof timerInfo === "object" && timerInfo.expiresAt > now) {
          scheduleExpiration(req.id, timerInfo.expiresAt, timerInfo.decision, timerInfo.remarks);
          return {
            ...req,
            status: timerInfo.decision === "approved" ? "APPROVED" : "REJECTED",
            localExpiresAt: timerInfo.expiresAt,
          };
        }
        return { ...req, localExpiresAt: null };
      });

      setRequisitions(mappedMock);
      setError(""); 
    } finally {
      setLoading(false);
    }
  };

  const handleView = (req) => setSelectedRequisition(req);

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

  const getRemainingSeconds = (localExpiresAt) => {
    if (!localExpiresAt) return 0;
    return Math.max(0, Math.ceil((localExpiresAt - Date.now()) / 1000));
  };

  const handleSubmitAction = (e) => {
    e.preventDefault();

    if (!remarks.trim()) {
      setRemarkError("Remarks required");
      return;
    }

    const { req, type } = actionModal;
    const trimmedRemarks = remarks.trim();
    const expiresAt = Date.now() + 60 * 1000;

    try {
      setSubmittingAction(true);

      storeTimer(req.id, {
        expiresAt,
        decision: type,
        remarks: trimmedRemarks,
      });

      scheduleExpiration(req.id, expiresAt, type, trimmedRemarks);

      const newStatus = type === "approved" ? "APPROVED" : "REJECTED";

      setRequisitions((prev) =>
        prev.map((r) =>
          r.id === req.id
            ? {
                ...r,
                status: newStatus,
                pendingDecision: type,
                pendingRemarks: trimmedRemarks,
                localExpiresAt: expiresAt,
              }
            : r
        )
      );

      closeActionModal();
    } catch (err) {
      setError(err?.message || "Failed to update decision");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResetDecision = async (requisitionId) => {
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
      if (procurementService.getRequisitionHistory) {
        const res = await procurementService.getRequisitionHistory(req.id);
        setHistory(res || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setError(err.message);
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

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Procurement Requisitions</h2>
      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Req No</th>
              <th>Title</th>
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
                <td colSpan="7" className="no-data">
                  Loading…
                </td>
              </tr>
            ) : requisitions.length > 0 ? (
              requisitions.map((req) => {
                const remaining = getRemainingSeconds(req.localExpiresAt);
                const isDecidedRecently = Boolean(req.localExpiresAt && remaining > 0);
                const isPending = req.status === PENDING_STATUS && !isDecidedRecently;

                return (
                  <tr key={req.id}>
                    <td data-label="Req No">
                      <div className="req-number-cell">
                        {req.requisitionNo}
                        {req.isDuplicate && (
                          <span className="duplicate-badge" title="Potential duplicate requisition detected">
                            Duplicate
                          </span>
                        )}
                      </div>
                    </td>
                    <td data-label="Title">{req.title}</td>
                    <td data-label="Department">{req.departmentName}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${req.status ? req.status.toLowerCase() : ""}`}>
                        {req.status ? req.status.replaceAll("_", " ") : "-"}
                      </span>
                    </td>
                    <td data-label="Amount">₹{Number(req.totalEstimatedAmount || 0).toLocaleString()}</td>
                    <td data-label="Created">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "-"}</td>
                    <td data-label="Action">
                      <div className="action-group">
                        <button className="view-btn" onClick={() => handleView(req)}>
                          <Eye size={14} />
                          View
                        </button>

                        {isDecidedRecently ? (
                          <div
                            className="inline-reset-container"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                color: "#b58100",
                                fontWeight: "bold",
                              }}
                            >
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
                        ) : isPending ? (
                          <>
                            <button className="approve-btn" onClick={() => openActionModal(req, "approved")}>
                              Approve
                            </button>
                            <button className="reject-btn" onClick={() => openActionModal(req, "rejected")}>
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
                          </>
                        ) : (
                          <button
                            className="track-btn"
                            onClick={() => handleTrack(req)}
                            disabled={trackingId === req.id}
                          >
                            <Clock3 size={14} />
                            {trackingId === req.id ? "…" : "Track"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No Requisitions Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedRequisition &&
        createPortal(
          <div className="modal-overlay" onClick={() => setSelectedRequisition(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedRequisition.requisitionNo}</h2>
                <button
                  className="modal-close"
                  onClick={() => setSelectedRequisition(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <p>
                <strong>Title:</strong> {selectedRequisition.title}
              </p>
              <p>
                <strong>Description:</strong> {selectedRequisition.description}
              </p> 
              <p>
                <strong>Employee:</strong>{" "}
                {selectedRequisition.employeeName || "-"}
              </p> 
              <p>
                <strong>Department:</strong> {selectedRequisition.departmentName}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${selectedRequisition.status ? selectedRequisition.status.toLowerCase() : ""}`}>
                  {selectedRequisition.status ? selectedRequisition.status.replaceAll("_", " ") : "-"}
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
                    {selectedRequisition.items && selectedRequisition.items.length > 0 ? (
                      selectedRequisition.items.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Product">{item.productName}</td>
                          <td data-label="Qty">{item.quantity}</td>
                          <td data-label="Unit Price">₹{item.unitPrice}</td>
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
                <button className="close-btn" onClick={() => setSelectedRequisition(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Track Modal */}
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

      {/* Approve / Reject Modal */}
      {actionModal &&
        createPortal(
          <div className="modal-overlay" onClick={closeActionModal}>
            <div className="modal-content action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  {actionModal.type === "approved" ? "Approve Procurement" : "Reject Procurement"} -{" "}
                  {actionModal.req.requisitionNo}
                </h2>
                <button
                  className="modal-close"
                  onClick={closeActionModal}
                  aria-label="Close"
                  disabled={submittingAction}
                >
                  ×
                </button>
              </div>

              <p className="action-summary">
                <strong>{actionModal.req.title}</strong> - ₹
                {Number(actionModal.req.totalEstimatedAmount || 0).toLocaleString()}
              </p>

              <form onSubmit={handleSubmitAction} noValidate>
                <div className="field">
                  <label>Remarks</label>
                  <textarea
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                      if (remarkError) setRemarkError("");
                    }}
                    placeholder={
                      actionModal.type === "approved"
                        ? "Approval remarks…"
                        : "Reason for rejection…"
                    }
                    rows={4}
                    className={remarkError ? "input-error" : ""}
                  />
                  {remarkError && <span className="field-error">{remarkError}</span>}
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className={actionModal.type === "approved" ? "approve-btn-lg" : "reject-btn-lg"}
                    disabled={submittingAction}
                  >
                    {submittingAction
                      ? "Submitting…"
                      : actionModal.type === "approved"
                      ? "Confirm Approval"
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