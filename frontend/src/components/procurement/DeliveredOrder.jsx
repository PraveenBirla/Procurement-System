import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import purchaseOrderService from "../../services/purchaseOrderService";
import suppliersService from "../../services/suppliersService";

const DELIVERED_STATUS = "DELIVERED";
const COMPLETED_STATUS = "COMPLETED";

export const  DeliveredSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmingId, setConfirmingId] = useState(null);

  const [trackPo, setTrackPo] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);

  const [ratingPo, setRatingPo] = useState(null);

  const [ratings, setRatings] = useState({
    qualityRating: 0,
    deliveryRating: 0,
    priceRating: 0
  });

  const [submittingRating, setSubmittingRating] = useState(false);

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

    const modalOpen = trackPo || ratingPo;

    document.body.style.overflow = trackPo ? "hidden" : "";

    const handleKey = (e) => {

      if (e.key === "Escape") {

        if (ratingPo && !submittingRating) {
          closeRatingModal();
        }

        if (trackPo) {
          closeTrackModal();
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [trackPo, ratingPo, submittingRating]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const delivered = await purchaseOrderService.getPurchaseOrderByStatus(DELIVERED_STATUS);
      // console.log(delivered);
      setOrders(delivered);
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

  const handleConfirmDelivery = async (po) => {

      setRatingPo(po);

      setRatings({
        qualityRating: 0,
        deliveryRating: 0,
        priceRating: 0
      });

      setError("");
  };

  const closeRatingModal = () => {

    if (submittingRating) {
      return;
    }

    setRatingPo(null);

    setRatings({
      qualityRating: 0,
      deliveryRating: 0,
      priceRating: 0
    });
  };

  const handleRatingChange = (field, value) => {

    setRatings((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const getRatingLabelText = (score) => {
    switch (score) {
      case 1: return "Poor 😞";
      case 2: return "Fair 😐";
      case 3: return "Good 🙂";
      case 4: return "Very Good 😊";
      case 5: return "Excellent 🌟";
      default: return "Click to rate";
    }
  };

  const RatingStars = ({ field, label, description }) => {
    const currentRating = ratings[field];

    return (
      <div className="enhanced-rating-card">
        <div className="rating-card-header">
          <div>
            <span className="rating-category-title">{label}</span>
            <p className="rating-category-desc">{description}</p>
          </div>
          <span className={`rating-status-badge ${currentRating > 0 ? "active" : ""}`}>
            {getRatingLabelText(currentRating)}
          </span>
        </div>

        <div className="rating-stars-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`rating-star-btn ${star <= currentRating ? "filled" : ""}`}
              onClick={() => handleRatingChange(field, star)}
              disabled={submittingRating}
              aria-label={`${star} out of 5`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getCurrentUserId = () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      return user?.id || user?.userId || null;

    } catch {

      return null;

    }
  };

  const handleSubmitRating = async () => {

    if (!ratingPo) {
      return;
    }

    if (ratings.qualityRating === 0 || ratings.deliveryRating === 0 || ratings.priceRating === 0) {

      setError("Please provide a rating for Quality, Delivery and Price.");
      return;
    }

    const reviewedById = ratingPo.generatedById;

    if (!reviewedById) {

      setError("Unable to identify the logged-in user.");
      return;
    }

    setSubmittingRating(true);
    setError("");

    try {

        await suppliersService.createSupplierPerformance({

        supplierId: ratingPo.supplierId,

        purchaseOrderId: ratingPo.id,

        qualityRating: ratings.qualityRating,

        deliveryRating: ratings.deliveryRating,

        priceRating: ratings.priceRating,

        reviewDate: new Date()
          .toISOString()
          .split("T")[0],

        reviewedById: reviewedById

      });

      await purchaseOrderService.updateStatus(
        ratingPo.id,
        {
          status: COMPLETED_STATUS
        }
      );

      setRatingPo(null);

      setRatings({
        qualityRating: 0,
        deliveryRating: 0,
        priceRating: 0
      });

      await loadOrders();

    } catch (err) {

      console.error("Supplier performance submission error:", err);

      setError(getErrorMessage(err));

    } finally {
      setSubmittingRating(false);
    }
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
        <h2 className="section-title">Delivered Purchase Orders</h2>
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
              <th>Supplier</th>
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
                <td colSpan="8" className="no-data">
                  Loading…
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((po) => {
                const canConfirm = po.status === DELIVERED_STATUS;
                return (
                  <tr key={po.id}>
                    <td data-label="PO Number">{po.poNumber}</td>
                    <td data-label="Requisition No">{po.requisitionNo}</td>
                    <td data-label="Supplier">{po.supplierName || "-"}</td>
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

                        {canConfirm && (
                          <button
                            className="approve-btn"
                            onClick={() => handleConfirmDelivery(po)}
                            disabled={confirmingId === po.id}
                          >
                            {confirmingId === po.id ? "…" : "Confirm Delivery"}
                          </button>
                        )}

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
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Purchase Orders Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {ratingPo &&

        createPortal(

          <div
            className="modal-overlay"
            onClick={closeRatingModal}
          >

            <div className="modal-content supplier-rating-modal"
              onClick={(e) => e.stopPropagation()}>

              {/* HEADER */}

              <div className="modal-header">

                <div>

                  <h2>Supplier Performance Rating</h2>

                  <p>{ratingPo.supplierName || "-"}</p>

                  <small>PO: {ratingPo.poNumber}</small>

                </div>

                <button className="modal-close" onClick={closeRatingModal}
                  disabled={submittingRating}
                  aria-label="Close"
                >
                  ×
                </button>

              </div>


              {/* DESCRIPTION */}

              <div className="rating-info">

                <p>
                  Please rate the supplier's performance
                  for this purchase order.
                </p>

              </div>


              {/* QUALITY */}

              <RatingStars
                field="qualityRating"
                label="Quality"
              />


              {/* DELIVERY */}

              <RatingStars
                field="deliveryRating"
                label="Delivery"
              />


              {/* PRICE */}

              <RatingStars
                field="priceRating"
                label="Price"
              />


              {/* OVERALL PREVIEW */}

              <div className="overall-rating">

                <strong>
                  Overall Rating
                </strong>

                <span>

                  {(
                    (
                      ratings.qualityRating +
                      ratings.deliveryRating +
                      ratings.priceRating
                    ) / 3
                  ).toFixed(2)}

                  / 5

                </span>

              </div>


              {/* FOOTER */}

              <div className="modal-actions">

                <button className="close-btn" onClick={closeRatingModal} disabled={submittingRating}>
                  Cancel
                </button>

                <button className="approve-btn" onClick={handleSubmitRating} disabled={submittingRating}>

                  {submittingRating ? "Submitting...": "Submit Rating"}
                </button>

              </div>
            </div>
          </div>,
          document.body

        )}

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