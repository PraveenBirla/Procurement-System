import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import procurementService from "../../services/requisitionService";
import purchaseOrderService from "../../services/purchaseOrderService";
import suppliersService from "../../services/suppliersService";

const APPROVED_STATUS = "APPROVED";
const PO_GENERATED_STATUS = "PO_GENERATED";

// TODO: confirm against your actual PurchaseOrderStatus enum values.
const PO_SENT_STATUS = "SENT_TO_SUPPLIER";

export const ApprovedRequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // requisitionId -> { id, status, pdfURL, poNumber }
  const [poMap, setPoMap] = useState({});

  // View PO modal
  const [viewPoReq, setViewPoReq] = useState(null);

  // Generate PO modal (supplier + date selected here now)
  const [genModalReq, setGenModalReq] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [genError, setGenError] = useState("");
  const [submittingGenerate, setSubmittingGenerate] = useState(false);

  // Send to Supplier (direct action, no modal, only poId)
  const [sendingPoReqId, setSendingPoReqId] = useState(null);

  // Track PO history modal
  const [trackPoReq, setTrackPoReq] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingPoId, setTrackingPoId] = useState(null);

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
    const anyOpen = !!viewPoReq || !!genModalReq || !!trackPoReq;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") {
        closeViewPoModal();
        closeGenerateModal();
        closeTrackPOModal();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [viewPoReq, genModalReq, trackPoReq]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const approved = await procurementService.getProcurementRequisitionsByStatus(APPROVED_STATUS);
      approved.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequisitions(approved);
      setError("");

      // Load POs for all requisitions that already have a PO (generated / sent / delivered)
      const poGeneratedReqs = approved.filter((r) => r.status !== "APPROVED");

      if (poGeneratedReqs.length > 0) {
        const results = await Promise.all(
          poGeneratedReqs.map((r) =>
            purchaseOrderService
              .getPurchaseOrderRequisionId(r.id)
              .then((po) => [r.id, po])
              .catch(() => [r.id, null])
          )
        );

        const newPoMap = {};
        results.forEach(([reqId, po]) => {
          if (po) {
            newPoMap[reqId] = {
              id: po.id,
              status: po.status,
              pdfURL: po.pdfURL,
              poNumber: po.poNumber,
            };
          }
        });

        // Replace entire map to ensure fresh data
        setPoMap(newPoMap);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getPo = (req) => poMap[req.id] ?? null;
  const isPoSent = (req) => getPo(req)?.status === PO_SENT_STATUS;

  // ---------- Generate PO (modal: supplier + date selected here) ----------
  const openGenerateModal = async (req) => {
    const categoryId = req.items?.[0]?.categoryId;

    setGenModalReq(req);
    setSelectedSupplierId("");
    setExpectedDeliveryDate("");
    setGenError("");

    if (!categoryId) {
      setGenError("categories not found");
      return;
    }

    setLoadingSuppliers(true);
    try {
      const list = await suppliersService.getAllSuppliersByCategoriyId(categoryId);
      setSuppliers(list);
    } catch (err) {
      setGenError(getErrorMessage(err));
    } finally {
      setLoadingSuppliers(false);
    }
  };
   
  const handleOpenPdf = (req) => {
  const po = getPo(req);

  if (po?.pdfURL) {
    window.open(po.pdfURL, "_blank");
  } else {
    setError("PDF not available");
  }
};
  const closeGenerateModal = () => {
    if (submittingGenerate) return;
    setGenModalReq(null);
    setSuppliers([]);
    setSelectedSupplierId("");
    setExpectedDeliveryDate("");
    setGenError("");
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setGenError("select supplier");
      return;
    }
    if (!expectedDeliveryDate) {
      setGenError("Expected delivery date zaroori hai");
      return;
    }

    if (!genModalReq?.items || genModalReq.items.length === 0) {
      setPoError("No requisition items found");
      return;
    }

    const req = genModalReq;
    if (!req) return;

    setError("");
    try {
      setSubmittingGenerate(true);
      const po = await purchaseOrderService.generatePurchaseOrder({
        requisitionId: req.id,
        poItems: req.items.map((item) => ({
          requisitionItemId: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        supplierId: Number(selectedSupplierId),
        expectedDeliveryDate,
        poItems: genModalReq.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      });

      setPoMap((prev) => ({
        ...prev,
        [req.id]: {
          id: po.id,
          status: po.status,
          pdfURL: po.pdfURL,
          poNumber: po.poNumber,
        },
      }));

      closeGenerateModal();
      await loadRequisitions();
    } catch (err) {
      setGenError(getErrorMessage(err));
    } finally {
      setSubmittingGenerate(false);
    }
  };

  // ---------- View PO (opens Cloudinary pdfURL directly in a new tab) ----------
  const openViewPoModal = (req) => setViewPoReq(req);
  const closeViewPoModal = () => setViewPoReq(null);

  

  // ---------- Send to Supplier (direct action, only poId sent) ----------
  const handleSendToSupplier = async (req) => {
    const po = getPo(req);
    if (!po) {
      setError("PO not found");
      return;
    }

    setError("");
    setSendingPoReqId(req.id);
    try {
      const updatedPo = await purchaseOrderService.sendToSupplier(po.id);

      const newStatus = updatedPo?.status || PO_SENT_STATUS;
      setPoMap((prev) => ({
        ...prev,
        [req.id]: {
          id: updatedPo?.id || po.id,
          status: newStatus,
          pdfURL: updatedPo?.pdfURL || po.pdfURL,
          poNumber: updatedPo?.poNumber || po.poNumber,
        },
      }));

      await loadRequisitions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSendingPoReqId(null);
    }
  };

  // ---------- Track PO ----------
  const handleTrackPO = async (req) => {
    const po = getPo(req);
    if (!po) return;

    setTrackingPoId(req.id);
    setTrackPoReq(req);
    setPoHistory([]);
    setLoadingPoHistory(true);

    try {
      const res = await purchaseOrderService.getPurchaseOrderHistory(po.id);
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
                const po = getPo(req);

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
                        {req.status === "APPROVED" ? (
                          <button className="approve-btn" onClick={() => openGenerateModal(req)}>
                            Generate PO
                          </button>
                        ) : req.status === "PO_GENERATED" ? (
                          <>
                            <button className="view-btn" onClick={() =>  handleOpenPdf(req)} disabled={!po}>
                              View PO
                            </button>

                            <button className="track-btn" onClick={() => handleTrackPO(req)} disabled={!po}>
                              Track PO
                            </button>

                            <button
                              className="approve-btn"
                              onClick={() => handleSendToSupplier(req)}
                              disabled={!po || sendingPoReqId === req.id}
                            >
                              {sendingPoReqId === req.id ? "Sending…" : "Send to Supplier"}
                            </button>
                          </>
                        ) : req.status === "SENT_TO_SUPPLIER" ? (
                          <>
                            <button className="view-btn" onClick={() => openViewPoModal(req)} disabled={!po}>
                              View PO
                            </button>

                            <button className="track-btn" onClick={() => handleTrackPO(req)} disabled={!po}>
                              Track PO
                            </button>
                          </>
                        ) : req.status === "DELIVERED" ? (
                          <>
                            <button className="view-btn" onClick={() => openViewPoModal(req)} disabled={!po}>
                              View PO
                            </button>

                            <button className="track-btn" onClick={() => handleTrackPO(req)} disabled={!po}>
                              Track PO
                            </button>
                          </>
                        ) : null}
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

      {/* Generate PO Modal — supplier + expected delivery date selected here */}
      {genModalReq &&
        createPortal(
          <div className="modal-overlay" onClick={closeGenerateModal}>
            <div className="modal-content action-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate PO — {genModalReq.requisitionNo}</h2>
                <button
                  className="modal-close"
                  onClick={closeGenerateModal}
                  disabled={submittingGenerate}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <p className="action-summary">
                <strong>{genModalReq.title}</strong> — ₹
                {Number(genModalReq.totalEstimatedAmount).toLocaleString()}
              </p>

              {genError && (
                <div className="error-box">
                  <span>{genError}</span>
                </div>
              )}

              <form onSubmit={handleGenerateSubmit} noValidate>
                <div className="field">
                  <label>Supplier</label>
                  {loadingSuppliers ? (
                    <p className="no-data">Loading suppliers…</p>
                  ) : (
                    <select value={selectedSupplierId} onChange={(e) => setSelectedSupplierId(e.target.value)}>
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
                  <button type="submit" className="approve-btn-lg" disabled={submittingGenerate || loadingSuppliers}>
                    {submittingGenerate ? "Generating…" : "Generate PO"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeGenerateModal}
                    disabled={submittingGenerate}
                  >
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