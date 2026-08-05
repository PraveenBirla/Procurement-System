import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import suppliersService from "../../services/suppliersService";
import purchaseOrderService from "../../services/purchaseOrderService";

const COMPLETED_STATUS = "COMPLETED";

export const CompletedOrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [trackPo, setTrackPo] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    document.body.style.overflow = trackPo ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") closeTrackModal();
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [trackPo]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await  purchaseOrderService.getPurchaseOrderByStatus(COMPLETED_STATUS);
      setOrders(res);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = (po) => {
    if (!po.pdfURL) return;
    window.open(po.pdfURL, "_blank", "noopener,noreferrer");
  };

  const handleViewInvoice = (po) => {
    if (!po.invoiceURL) return;
    window.open(po.invoiceURL, "_blank", "noopener,noreferrer");
  };

  const handleTrack = async (po) => {
    setTrackingId(po.id);
    setTrackPo(po);
    setPoHistory([]);
    setLoadingPoHistory(true);

    try {
      const res = await purchaseOrderService.getPurchaseOrderHistory(po.id);
      setPoHistory(res);
    } catch (err) {
      setError(getErrorMessage(err));
      setTrackPo(null);
    } finally {
      setLoadingPoHistory(false);
      setTrackingId(null);
    }
  };

  const closeTrackModal = () => {
    setTrackPo(null);
    setPoHistory([]);
  };

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Completed Orders</h2>
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
              <th>PO Number</th>
              <th>Requisition No</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Expected Delivery</th>
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
            ) : orders.length > 0 ? (
              orders.map((po) => (
                <tr key={po.id}>
                  <td data-label="PO Number">{po.poNumber}</td>
                  <td data-label="Requisition No">{po.requisitionNo}</td>
                  <td data-label="Status">
                    <span className={`status-badge ${po.status.toLowerCase()}`}>
                      {po.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td data-label="Amount">₹{Number(po.totalAmount).toLocaleString()}</td>
                  <td data-label="Expected Delivery">
                    {po.expectedDeliveryDate
                      ? new Date(po.expectedDeliveryDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td data-label="Created">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td data-label="Action">
                    <div className="action-group">
                      <button
                        className="view-btn"
                        onClick={() => handleViewPO(po)}
                        disabled={!po.pdfURL}
                      >
                        View PO
                      </button>

                      <button
                        className="view-btn"
                        onClick={() => handleViewInvoice(po)}
                        disabled={!po.invoiceURL}
                      >
                        View Invoice
                      </button>

                      <button
                        className="track-btn"
                        onClick={() => handleTrack(po)}
                        disabled={trackingId === po.id}
                      >
                        {trackingId === po.id ? "…" : "Track"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No Purchase Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Track PO Modal */}
      {trackPo &&
        createPortal(
          <div className="modal-overlay" onClick={closeTrackModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Track PO — {trackPo.poNumber}</h2>
                <button className="modal-close" onClick={closeTrackModal} aria-label="Close">
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
                <button className="close-btn" onClick={closeTrackModal}>
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