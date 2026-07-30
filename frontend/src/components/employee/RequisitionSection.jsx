import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import requisitionService from "../../services/requisitionService";
import productService from "../../services/productService";
import "./RequisitionSection.css";

const emptyItem = { productId: "", quantity: 1, unitPrice: "" };

export const RequisitionSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const [showTrackModal, setShowTrackModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [trackedReq, setTrackedReq] = useState(null);

  // Create Requisition modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [reqForm, setReqForm] = useState({
    title: "",
    description: "",
    items: [{ ...emptyItem }],
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadRequisitions();
    loadProducts();
  }, []);

  useEffect(() => {
    const anyOpen = !!selectedRequisition || showTrackModal || showCreateModal;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
        closeCreateModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRequisition, showTrackModal, showCreateModal]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const res = await requisitionService.getEmployeeRequisitions();
      setRequisitions(res);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productService.getProducts();
      setProducts(res);
    } catch (err) {
      setError(err.message);
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

  // ─── Create Requisition handlers ───
  const openCreateModal = () => {
    setReqForm({ title: "", description: "", items: [{ ...emptyItem }] });
    setFormErrors({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;
    setShowCreateModal(false);
  };

  const handleReqFieldChange = (e) => {
    const { name, value } = e.target;
    setReqForm({ ...reqForm, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleItemChange = (index, field, value) => {
    const items = [...reqForm.items];
    items[index] = { ...items[index], [field]: value };

    // Auto-fill unit price from product's standard price when product selected
    if (field === "productId") {
      const product = products.find((p) => String(p.id) === String(value));
      if (product && !items[index].unitPrice) {
        items[index].unitPrice = product.standardPrice ?? "";
      }
    }

    setReqForm({ ...reqForm, items });

    const itemErrKey = `item_${index}`;
    if (formErrors[itemErrKey]) {
      const newErrs = { ...formErrors };
      delete newErrs[itemErrKey];
      setFormErrors(newErrs);
    }
  };

  const addItemRow = () => {
    setReqForm({ ...reqForm, items: [...reqForm.items, { ...emptyItem }] });
  };

  const removeItemRow = (index) => {
    if (reqForm.items.length === 1) return;
    const items = reqForm.items.filter((_, i) => i !== index);
    setReqForm({ ...reqForm, items });
  };

  const validateReqForm = () => {
    const errs = {};
    if (!reqForm.title.trim()) errs.title = "Title is required";

    reqForm.items.forEach((item, index) => {
      if (!item.productId || !item.quantity || Number(item.quantity) <= 0 || !item.unitPrice || Number(item.unitPrice) <= 0) {
        errs[`item_${index}`] = "Select product and enter valid quantity/price";
      }
    });

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const estimatedTotal = reqForm.items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleCreateRequisition = async (e) => {
    e.preventDefault();
    if (!validateReqForm()) return;

    const payload = {
      title: reqForm.title.trim(),
      description: reqForm.description.trim(),
      items: reqForm.items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    };

    setCreating(true);
    try {
      await requisitionService.createRequisition(payload);
      setShowCreateModal(false);
      await loadRequisitions();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return ( 
    <> 
    <div className="requisition-section">
      <div className="section-header">
        <h2 className="section-title">My Requisitions</h2>
        <button className="btn-primary" onClick={openCreateModal}>
          + Create Requition
        </button>
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
              requisitions.map((req) => (
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
                      <button
                        className="track-btn"
                        disabled={trackingId === req.id}
                        onClick={() => handleTrack(req)}
                      >
                        {trackingId === req.id ? "��" : "Track"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
    </div>

      {/* View Modal - using React Portal */}
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
                  {selectedRequisition.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Product">{item.productName}</td>
                      <td data-label="Qty">{item.quantity}</td>
                      <td data-label="Unit Price">₹{item.unitPrice}</td>
                    </tr>
                  ))}
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

      {/* Track Requisition Modal - using React Portal */}
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
        </div>,
        document.body
      )}

      {/* Create Requisition Modal - using React Portal */}
      {showCreateModal && createPortal(
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Requisition</h2>
              <button className="modal-close" onClick={closeCreateModal} aria-label="Close" disabled={creating}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} noValidate>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Office IT Equipment Purchase"
                  value={reqForm.title}
                  onChange={handleReqFieldChange}
                  className={formErrors.title ? "input-error" : ""}
                />
                {formErrors.title && <span className="field-error">{formErrors.title}</span>}
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="e.g. Purchase laptops, monitors and printer for new employees"
                  value={reqForm.description}
                  onChange={handleReqFieldChange}
                  rows={2}
                />
              </div>

              <div className="items-header">
                <h3>Items</h3>
                <button type="button" className="add-item-btn" onClick={addItemRow}>
                  + Add Item
                </button>
              </div>

              <div className="items-list">
                {reqForm.items.map((item, index) => (
                  <div className="item-row" key={index}>
                    <div className="item-field product-field">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.sku ? `(${p.sku})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="item-field qty-field">
                      <input
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </div>

                    <div className="item-field price-field">
                      <input
                        type="number"
                        placeholder="Unit Price"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                      />
                    </div>

                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItemRow(index)}
                      disabled={reqForm.items.length === 1}
                      aria-label="Remove item"
                    >
                      ×
                    </button>

                    {formErrors[`item_${index}`] && (
                      <span className="field-error item-error">{formErrors[`item_${index}`]}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="total-row">
                <span>Estimated Total:</span>
                <strong>₹{estimatedTotal.toLocaleString()}</strong>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Submitting…" : "Submit Requisition"}
                </button>
                <button type="button" className="btn-secondary" onClick={closeCreateModal} disabled={creating}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>

  );
};
