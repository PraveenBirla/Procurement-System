import { useEffect, useState } from "react";
import requisitionService from "../../services/requisitionService";
import { createPortal } from "react-dom";
import "./RequisitionSection.css";

const PENDING_STATUS = "PENDING_MANAGER";
 
const MANAGER_DECIDED_STATUSES = ["APPROVED", "REJECTED"];

export const RequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [trackedReq, setTrackedReq] = useState(null);

  const [actionModal, setActionModal] = useState(null);  
  const [remarks, setRemarks] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [remarkError, setRemarkError] = useState("");

  
  const [processedIds, setProcessedIds] = useState({});

  useEffect(() => {
    loadRequisitions();
  }, []);

  useEffect(() => {
    const anyOpen = !!selectedRequisition || showTrackModal || !!actionModal;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
        closeActionModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRequisition, showTrackModal, actionModal]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      
      const pending = await requisitionService.getRequisitionsByStatus(PENDING_STATUS);

     
      const decidedResults = await Promise.all(
        MANAGER_DECIDED_STATUSES.map((status) =>
          requisitionService.getManagerRequisitionsByStatus(status)
        )
      );

      const merged = [...pending, ...decidedResults.flat()];

      
      const deduped = Array.from(new Map(merged.map((r) => [r.id, r])).values());
      deduped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequisitions(deduped);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (req) => setSelectedRequisition(req);

  const handleTrack = async (req) => {
    setTrackingId(req.id);
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setHistory([]);
    try {
      const res = await requisitionService.getRequisitionHistory(req.id);
      setHistory(res);
    } catch (err) {
      setError(err.message);
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

  const handleSubmitAction = async (e) => {
    e.preventDefault();
    const { req, type } = actionModal;

    if (!remarks.trim()) {
      setRemarkError("Remarks are required");
      return;
    }

    const payload = {
      decision: type,  
      remarks: remarks.trim(),
    };

    setSubmittingAction(true);
    try {
      await requisitionService.managerUpdate(req.id, payload);

      setProcessedIds((prev) => ({ ...prev, [req.id]: type }));
      setActionModal(null);
      setRemarks("");

      await loadRequisitions();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  
  const isActionable = (req) => {
    if (processedIds[req.id]) return false;
    return req.status.toUpperCase() === PENDING_STATUS;
  };

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Manager Requisitions</h2>
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
              <th>Requisition No</th>
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
                  Loading requisitions…
                </td>
              </tr>
            ) : requisitions.length > 0 ? (
              requisitions.map((req) => {
                const actionable = isActionable(req);
                return (
                  <tr key={req.id}>
                    <td data-label="Requisition No">{req.requisitionNo}</td>
                    <td data-label="Title">{req.title}</td>
                    <td data-label="Department">{req.departmentName}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${req.status.toLowerCase()}`}>
                        {req.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td data-label="Amount">₹{Number(req.totalEstimatedAmount).toLocaleString()}</td>
                    <td data-label="Created">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td data-label="Action">
                      <div className="action-group">
                        <button className="view-btn" onClick={() => handleView(req)}>
                          View
                        </button>

                        {actionable ? (
                          <>
                            <button
                              className="approve-btn"
                              onClick={() => openActionModal(req, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() => openActionModal(req, "rejected")}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="track-btn"
                            disabled={trackingId === req.id}
                            onClick={() => handleTrack(req)}
                          >
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
                  No requisitions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selectedRequisition && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedRequisition(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRequisition.requisitionNo}</h2>
              <button className="modal-close" onClick={() => setSelectedRequisition(null)} aria-label="Close">
                ×
              </button>
            </div>

            <p><strong>Title:</strong> {selectedRequisition.title}</p>
            <p><strong>Description:</strong> {selectedRequisition.description}</p>
            <p><strong>Department:</strong> {selectedRequisition.departmentName}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-badge ${selectedRequisition.status.toLowerCase()}`}>
                {selectedRequisition.status.replaceAll("_", " ")}
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
      {showTrackModal && createPortal(
        <div className="modal-overlay" onClick={closeTrackModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Track Requisition {trackedReq ? `— ${trackedReq.requisitionNo}` : ""}</h2>
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
                      <h4>{item.newStatus.replaceAll("_", " ")}</h4>
                      <p><b>Previous:</b> {item.oldStatus ? item.oldStatus.replaceAll("_", " ") : "-"}</p>
                      <p><b>Remarks:</b> {item.remarks || "-"}</p>
                      <p><b>Date:</b> {new Date(item.changedAt).toLocaleString()}</p>
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
        </div>, document.body
      )}

      {/* Approve / Reject Modal */}
      {actionModal && createPortal(
        <div className="modal-overlay" onClick={closeActionModal}>
          <div className="modal-content action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionModal.type === "approve" ? "Approve" : "Reject"} — {actionModal.req.requisitionNo}
              </h2>
              <button className="modal-close" onClick={closeActionModal} aria-label="Close" disabled={submittingAction}>
                ×
              </button>
            </div>

            <p className="action-summary">
              <strong>{actionModal.req.title}</strong> — ₹
              {Number(actionModal.req.totalEstimatedAmount).toLocaleString()}
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
                      ? "Add a note for this approval…"
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