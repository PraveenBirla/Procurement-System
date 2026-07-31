import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import procurementService from "../../services/requisitionService";
import purchaseOrderService from "../../services/purchaseOrderService";
import suppliersService from "../../services/suppliersService";

const APPROVED_STATUS = "APPROVED";
const PO_GENERATED_STATUS = "PO_GENERATED";

export const ApprovedRequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // requisitionId -> generated PO id (for POs generated in this session)
  const [poMap, setPoMap] = useState({});

  // Generate PO modal
  const [poModalReq, setPoModalReq] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [poError, setPoError] = useState("");
  const [submittingPO, setSubmittingPO] = useState(false);

  // Track PO history modal
  const [trackPoReq, setTrackPoReq] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingPoId, setTrackingPoId] = useState(null);

  // Download PO
  const [downloadingPoId, setDownloadingPoId] = useState(null);

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
    const anyOpen = !!poModalReq || !!trackPoReq;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") {
        closePOModal();
        closeTrackPOModal();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [poModalReq, trackPoReq]);

 const loadRequisitions = async () => {
  setLoading(true);
  try {
    const approved = await procurementService.getProcurementRequisitionsByStatus(APPROVED_STATUS);
    approved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setRequisitions(approved);
    setError("");

    // For rows whose PO is already generated, fetch the PO to get its id
    const poGeneratedReqs = approved.filter((r) => r.status === PO_GENERATED_STATUS);
    if (poGeneratedReqs.length > 0) {
      const results = await Promise.all(
        poGeneratedReqs.map((r) =>
          purchaseOrderService
            .getPurchaseOrderRequisionId(r.id)
            .then((po) => [r.id, po.id])
            .catch(() => [r.id, null])
        )
      );
      setPoMap((prev) => {
        const next = { ...prev };
        results.forEach(([reqId, poId]) => {
          if (poId) next[reqId] = poId;
        });
        return next;
      });
    }
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

  // Resolve PO id for a requisition: prefer freshly-generated one in this session,
  // fall back to the id coming from the requisition response (after PO_GENERATED status).
  const getPoId = (req) => poMap[req.id] ?? null;

  // ---------- Generate PO ----------
  const openPOModal = async (req) => {
    const categoryId = req.items?.[0]?.categoryId;

    if (!categoryId) {
      setPoModalReq(req);
      setPoError("categories not found");
      return;
    }

    setPoModalReq(req);
    setSelectedSupplierId("");
    setExpectedDeliveryDate("");
    setPoError("");
    setLoadingSuppliers(true);
    try {
      const list = await suppliersService.getAllSuppliersByCategoriyId(categoryId);
      setSuppliers(list);
    } catch (err) {
      setPoError(getErrorMessage(err));
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const closePOModal = () => {
    if (submittingPO) return;
    setPoModalReq(null);
    setSuppliers([]);
    setSelectedSupplierId("");
    setExpectedDeliveryDate("");
    setPoError("");
  };

  const handleGeneratePO = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setPoError("select supplier");
      return;
    }
    if (!expectedDeliveryDate) {
      setPoError("Expected delivery date zaroori hai");
      return;
    }

    try {
      setSubmittingPO(true);
    const po = await purchaseOrderService.generatePurchaseOrder({
    requisitionId: poModalReq.id,
    supplierId: Number(selectedSupplierId),
    expectedDeliveryDate,
    poItems: poModalReq.items.map(item => ({
        requisitionItemId: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice
    }))
});

      setPoMap((prev) => ({ ...prev, [poModalReq.id]: po.id }));
      closePOModal();
      await loadRequisitions();
    } catch (err) {
      setPoError(getErrorMessage(err));
    } finally {
      setSubmittingPO(false);
    }
  };

  // ---------- Track PO ----------
  const handleTrackPO = async (req) => {
    const poId = getPoId(req);
    if (!poId) return;

    setTrackingPoId(req.id);
    setTrackPoReq(req);
    setPoHistory([]);
    setLoadingPoHistory(true);

    try {
      const res = await purchaseOrderService.generatePurchaseOrderHistory(poId);
      setPoHistory(res);
    } catch (err) {
      setError(getErrorMessage(err));
      setTrackPoReq(null);
    } finally {
      setLoadingPoHistory(false);
      setTrackingPoId(null);
    }
  };

  const closeTrackPOModal = () => {
    setTrackPoReq(null);
    setPoHistory([]);
  };

  // ---------- Download PO ----------
  const handleDownloadPO = async (req) => {
    const poId = getPoId(req);
    if (!poId) return;

    setDownloadingPoId(req.id);
    try {
      const blob = await purchaseOrderService.downloadePurchaseOrder(poId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `PurchaseOrder-${req.requisitionNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDownloadingPoId(null);
    }
  };

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Approved Requisitions</h2>
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
                const isPoGenerated = req.status === PO_GENERATED_STATUS;
                const poId = getPoId(req);

                return (
                  <tr key={req.id}>
                    <td data-label="Req No">{req.requisitionNo}</td>
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
                        {isPoGenerated ? (
                          <>
                            <button
                              className="view-btn"
                              onClick={() => handleDownloadPO(req)}
                              disabled={!poId || downloadingPoId === req.id}
                            >
                              {downloadingPoId === req.id ? "…" : "Download PO"}
                            </button>
                            <button
                              className="track-btn"
                              onClick={() => handleTrackPO(req)}
                              disabled={!poId || trackingPoId === req.id}
                            >
                              {trackingPoId === req.id ? "…" : "Track PO"}
                            </button>
                          </>
                        ) : (
                          <button className="approve-btn" onClick={() => openPOModal(req)}>
                            Generate PO
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
                  No Approved Requisitions Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate PO Modal */}
      {poModalReq &&
        createPortal(
          <div className="modal-overlay" onClick={closePOModal}>
            <div className="modal-content action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Purchase Order — {poModalReq.requisitionNo}</h2>
                <button className="modal-close" onClick={closePOModal} disabled={submittingPO} aria-label="Close">
                  ×
                </button>
              </div>

              <p className="action-summary">
                <strong>{poModalReq.title}</strong> — ₹{Number(poModalReq.totalEstimatedAmount).toLocaleString()}
              </p>

              {poError && (
                <div className="error-box">
                  <span>{poError}</span>
                </div>
              )}

              <form onSubmit={handleGeneratePO} noValidate>
                <div className="field">
                  <label>Supplier</label>
                  {loadingSuppliers ? (
                    <p className="no-data">Loading suppliers…</p>
                  ) : (
                    <select
                      value={selectedSupplierId}
                      onChange={(e) => setSelectedSupplierId(e.target.value)}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="field">
                  <label>Expected Delivery Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="submit"
                    className="approve-btn-lg"
                    disabled={submittingPO || loadingSuppliers}
                  >
                    {submittingPO ? "Generating…" : "Generate PO & Notify Supplier"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={closePOModal} disabled={submittingPO}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* Track PO Modal */}
      {trackPoReq &&
        createPortal(
          <div className="modal-overlay" onClick={closeTrackPOModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Track PO — {trackPoReq.requisitionNo}</h2>
                <button className="modal-close" onClick={closeTrackPOModal} aria-label="Close">
                  ×
                </button>
              </div>

              {loadingPoHistory ? (
                <p className="no-data">Loading history…</p>
              ) : poHistory.length > 0 ? (
                <div className="timeline">
                  {poHistory.map((item, index) => (
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
                          <b>Date:</b> {new Date(item.changedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No history available.</p>
              )}

              <div className="modal-actions">
                <button className="close-btn" onClick={closeTrackPOModal}>
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