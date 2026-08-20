import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import goodsReceiptService from "../../services/goodsReceiptService";
import purchaseOrderService from "../../services/purchaseOrderService";
import supplierService from "../../services/suppliersService";
import { Clock3 } from "lucide-react";

const DELIVERED_STATUS = "DELIVERED";
const COMPLETED_STATUS = "COMPLETED";

export const DeliveredSection = () => {
  // =========================================================
  // MAIN DATA
  // =========================================================

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PO -> Goods Receipt mapping
  const [goodsReceiptMap, setGoodsReceiptMap] = useState({});

  // =========================================================
  // LOADING / ACTION STATES
  // =========================================================

  const [inspectingId, setInspectingId] = useState(null);
  const [generatingGR, setGeneratingGR] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);

  // =========================================================
  // MODALS
  // =========================================================

  const [inspectionPO, setInspectionPO] = useState(null);
  const [inspectionItems, setInspectionItems] = useState([]);

  const [viewingGR, setViewingGR] = useState(null);

  const [ratingPO, setRatingPO] = useState(null);

  const [returnPO, setReturnPO] = useState(null);
  const [returnGR, setReturnGR] = useState(null);

  const [trackPo, setTrackPo] = useState(null);
  const [poHistory, setPoHistory] = useState([]);
  const [loadingPoHistory, setLoadingPoHistory] = useState(false);
  const [trackingId, setTrackingId] = useState(null);

  // =========================================================
  // RATING
  // =========================================================

  const [qualityRating, setQualityRating] = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [priceRating, setPriceRating] = useState(0);

  // =========================================================
  // RETURN / REPLACEMENT
  // =========================================================

  const [returnReason, setReturnReason] = useState("");

  // =========================================================
  // ERROR HANDLER
  // =========================================================

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadOrders();
  }, []);

  // =========================================================
  // BODY SCROLL LOCK
  // =========================================================

  useEffect(() => {
    const modalOpen =
      inspectionPO ||
      viewingGR ||
      ratingPO ||
      returnPO ||
      trackPo;

    document.body.style.overflow = modalOpen ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key !== "Escape") return;

      setInspectionPO(null);
      setViewingGR(null);
      setRatingPO(null);
      setReturnPO(null);
      setReturnGR(null);
      closeTrackModal();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [
    inspectionPO,
    viewingGR,
    ratingPO,
    returnPO,
    trackPo,
  ]);

  const loadOrders = async () => {
    setLoading(true);

    try {
      const delivered =
        await purchaseOrderService.getPurchaseOrderByStatus(
          DELIVERED_STATUS
        );

      setOrders(delivered);

      const grMap = {};

      await Promise.all(
        delivered.map(async (po) => {
          try {
            const gr =
              await goodsReceiptService.getByPurchaseOrder(
                po.id
              );

            if (gr) {
              grMap[po.id] = gr;
            }
          } catch (err) {
            /*
             * No GR is expected for a new delivered PO.
             *
             * Do not show an error here because a missing GR
             * is a normal state.
             */
          }
        })
      );

      setGoodsReceiptMap(grMap);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPO = (po) => {
    if (!po?.pdfURL) {
      setError("PO PDF is not available.");
      return;
    }

    window.open(
      po.pdfURL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleViewInvoice = (po) => {
    if (!po?.invoiceURL) {
      setError("Invoice is not available.");
      return;
    }

    window.open(
      po.invoiceURL,
      "_blank",
      "noopener,noreferrer"
    );
  };


  const handleInspectGoods = async (po) => {
    setInspectingId(po.id);
    setError("");

    try {

      let existingGR = null;

      try {
        existingGR =
          await goodsReceiptService.getByPurchaseOrder(
            po.id
          );
      } catch (err) {
        // No GR -> normal inspection flow
      }

      if (existingGR) {
        setGoodsReceiptMap((prev) => ({
          ...prev,
          [po.id]: existingGR,
        }));

        handleAfterGoodsReceipt(
          po,
          existingGR
        );

        return;
      }

      const items = (po.items || []).map((item) => ({
        id: item.id,
        productId:
          item.productId ||
          item.product?.id,

        productName:
          item.productName ||
          item.product?.name ||
          "-",

        orderedQuantity:
          Number(
            item.quantity ||
            item.orderedQuantity ||
            0
          ),

        receivedQuantity:
          Number(
            item.quantity ||
            item.orderedQuantity ||
            0
          ),

        acceptedQuantity:
          Number(
            item.quantity ||
            item.orderedQuantity ||
            0
          ),

        rejectedQuantity: 0,

        remarks: "",

        inspected: false,
      }));

      setInspectionItems(items);
      setInspectionPO(po);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setInspectingId(null);
    }
  };

  const handleAfterGoodsReceipt = (po, gr) => {
    if (!gr) return;

    const hasRejectedItems =
      gr.items?.some(
        (item) =>
          Number(item.rejectedQuantity || 0) > 0
      );

    const qualityStatus =
      gr.qualityStatus;

    if (
      hasRejectedItems ||
      qualityStatus === "FAIL"
    ) {
      setReturnPO(po);
      setReturnGR(gr);
      return;
    }

    if (
      qualityStatus === "PASS"
    ) {
      openRatingModal(po);
    }
  };

  const updateInspectionItem = (
    itemId,
    field,
    value
  ) => {
    setInspectionItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        let updated = {
          ...item,
          [field]: value,
        };

        if (
          field === "acceptedQuantity" ||
          field === "receivedQuantity"
        ) {
          const received =
            Number(
              field === "receivedQuantity"
                ? value
                : item.receivedQuantity
            );

          const accepted =
            Number(
              field === "acceptedQuantity"
                ? value
                : item.acceptedQuantity
            );

          updated.rejectedQuantity =
            Math.max(
              0,
              received - accepted
            );
        }

        if (field === "inspected") {
          updated.inspected = value;
        }

        return updated;
      })
    );
  };

  const allItemsInspected =
    inspectionItems.length > 0 &&
    inspectionItems.every(
      (item) => item.inspected
    );

  const allGoodsPerfect =
    inspectionItems.length > 0 &&
    inspectionItems.every(
      (item) =>
        Number(item.rejectedQuantity || 0) === 0 &&
        Number(item.acceptedQuantity || 0) ===
          Number(item.receivedQuantity || 0)
    );

  const handleGenerateGoodsReceipt =
    async () => {
      if (!inspectionPO) {
        return;
      }

      if (!allItemsInspected) {
        setError(
          "Please inspect every item before generating the Goods Receipt."
        );
        return;
      }

      setGeneratingGR(true);
      setError("");

      try {

        let existingGR = null;

        try {
          existingGR =
            await goodsReceiptService.getByPurchaseOrder(
              inspectionPO.id
            );
        } catch (err) {
          // No GR
        }

        if (existingGR) {
          setGoodsReceiptMap((prev) => ({
            ...prev,
            [inspectionPO.id]: existingGR,
          }));

          setInspectionPO(null);
          setInspectionItems([]);

          handleAfterGoodsReceipt(
            inspectionPO,
            existingGR
          );

          return;
        }

        const qualityStatus = allGoodsPerfect? "PASS": "FAIL";


        const request = {
          purchaseOrderId: inspectionPO.id,

          isDelayed: false,

          receivedDate: new Date().toISOString().split("T")[0],

          qualityStatus,

          remarks: allGoodsPerfect
            ? "All goods inspected and accepted."
            : "Some goods were rejected during inspection.",

          items: inspectionItems.map(
            (item) => ({
              productId: item.productId,

              orderedQuantity: Number(item.orderedQuantity),

              receivedQuantity: Number(item.receivedQuantity),

              acceptedQuantity: Number(item.acceptedQuantity),

              rejectedQuantity: Number(item.rejectedQuantity),

              remarks: item.remarks || null,
            })
          ),
        };

        const createdGR =
          await goodsReceiptService.createGoodsReceipt(inspectionPO.id,
            request
          );

        setGoodsReceiptMap((prev) => ({
          ...prev,
          [inspectionPO.id]: createdGR,
        }));

        const currentPO = inspectionPO;

        setInspectionPO(null);
        setInspectionItems([]);

        handleAfterGoodsReceipt(
          currentPO,
          createdGR
        );

      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setGeneratingGR(false);
      }
    };

  const handleViewGoodsReceipt = (gr) => {
    if (!po?.invoiceURL) {
      setError("Invoice is not available.");
      return;
    }

    window.open(
      po.invoiceURL,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openRatingModal = (po) => {
    setRatingPO(po);

    setQualityRating(0);
    setDeliveryRating(0);
    setPriceRating(0);
  };

  const closeRatingModal = () => {
    setRatingPO(null);

    setQualityRating(0);
    setDeliveryRating(0);
    setPriceRating(0);
  };

  const handleSubmitRating = async () => {
    if (!ratingPO) {
      return;
    }

    if (
      qualityRating === 0 ||
      deliveryRating === 0 ||
      priceRating === 0
    ) {
      setError(
        "Please provide a rating for all fields."
      );
      return;
    }

    setRatingSubmitting(true);
    setError("");

    try {
      const request = {
        supplierId:
          ratingPO.supplierId,

        purchaseOrderId:
          ratingPO.id,

        qualityRating,

        deliveryRating,

        priceRating,

        reviewDate:
          new Date()
            .toISOString()
            .split("T")[0],

        reviewedById:
          ratingPO.generatedById,
      };

      await supplierService.createSupplierPerformance(
        request
      );

      await purchaseOrderService.updateStatus(
        ratingPO.id,
        {
          status: COMPLETED_STATUS,
        }
      );

      closeRatingModal();

      await loadOrders();

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRatingSubmitting(false);
    }
  };

  const openReturnReplacementModal = (
    po,
    gr
  ) => {
    setReturnPO(po);
    setReturnGR(gr);
    setReturnReason("");
  };

  const closeReturnModal = () => {
    setReturnPO(null);
    setReturnGR(null);
    setReturnReason("");
  };

  const handleSubmitReturn = async () => {
    if (!returnPO || !returnGR) {
      return;
    }

    if (!returnReason.trim()) {
      setError(
        "Please provide a reason for return/replacement."
      );
      return;
    }

    setReturnSubmitting(true);
    setError("");

    try {
      const request = {
        purchaseOrderId:
          returnPO.id,

        goodsReceiptId:
          returnGR.id,

        reason:
          returnReason.trim(),

        status: "RAISED",
      };

      await purchaseOrderService.createReturnReplacement(
        request
      );

      closeReturnModal();

      await loadOrders();

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReturnSubmitting(false);
    }
  };

  const handleConfirmDelivery = async (po) => {
    const gr =
      goodsReceiptMap[po.id];

    if (!gr) {
      setError(
        "Goods Receipt must be generated before confirming delivery."
      );
      return;
    }

    const allPerfect =
      gr.qualityStatus === "PASS" &&
      !gr.items?.some(
        (item) =>
          Number(
            item.rejectedQuantity || 0
          ) > 0
      );

    if (!allPerfect) {
      setError(
        "Delivery cannot be confirmed because some goods were rejected."
      );
      return;
    }

    setError(
      "Please complete supplier performance rating before confirming delivery."
    );

    openRatingModal(po);
  };


  const handleTrack = async (po) => {
    setTrackingId(po.id);
    setTrackPo(po);
    setPoHistory([]);
    setLoadingPoHistory(true);

    try {
      const res =
        await purchaseOrderService.getPurchaseOrderHistory(
          po.id
        );

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

  const RatingInput = ({value, onChange}) => {
    return (
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginTop: "8px",
        }}
      >
        {[1, 2, 3, 4, 5].map(
          (star) => {
            const starValue = star;
            return (
              <button
                key={star}
                type="button"
                onClick={() =>
                  onChange(starValue)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "28px",
                  opacity:
                    starValue <= value
                      ? 1
                      : 0.3,
                }}
              >
                ★
              </button>
            );
          }
        )}
      </div>
    );
  };

  return (
    <div className="admin-requisition-section">

      <div className="section-header">
        <h2 className="section-title">
          Delivered Purchase Orders
        </h2>
      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>

          <button
            className="error-dismiss"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
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
                <td
                  colSpan="8"
                  className="no-data"
                >
                  Loading…
                </td>
              </tr>

            ) : orders.length > 0 ? (

              orders.map((po) => {

                const existingGR =
                  goodsReceiptMap[po.id];

                const inspecting =
                  inspectingId ===
                  po.id;

                const canViewGR =
                  !!existingGR;

                const canConfirm =
                  !!existingGR &&
                  existingGR.qualityStatus ===
                    "PASS" &&
                  !existingGR.items?.some(
                    (item) =>
                      Number(
                        item.rejectedQuantity ||
                          0
                      ) > 0
                  );

                return (
                  <tr key={po.id}>

                    {/* PO NUMBER */}

                    <td data-label="PO Number">
                      {po.poNumber}
                    </td>

                    {/* REQUISITION */}

                    <td data-label="Requisition No">
                      {po.requisitionNo}
                    </td>

                    {/* SUPPLIER */}

                    <td data-label="Supplier">
                      {po.supplierName ||
                        "-"}
                    </td>

                    {/* STATUS */}

                    <td data-label="Status">
                      <span
                        className={`status-badge ${
                          po.status?.toLowerCase()
                        }`}
                      >
                        {po.status
                          ?.replaceAll(
                            "_",
                            " "
                          )}
                      </span>
                    </td>

                    {/* AMOUNT */}

                    <td data-label="Amount">
                      ₹
                      {Number(
                        po.totalAmount || 0
                      ).toLocaleString()}
                    </td>

                    {/* EXPECTED DELIVERY */}

                    <td data-label="Expected Delivery">
                      {po.expectedDeliveryDate
                        ? new Date(
                            po.expectedDeliveryDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* CREATED */}

                    <td data-label="Created">
                      {po.createdAt
                        ? new Date(
                            po.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTION */}

                    <td data-label="Action">

                      <div className="action-group">

                        {/* VIEW PO */}

                        <button
                          className="view-btn"
                          onClick={() =>
                            handleViewPO(
                              po
                            )
                          }
                          disabled={
                            !po.pdfURL
                          }
                        >
                          View PO
                        </button>

                        {/* VIEW INVOICE */}

                        <button
                          className="view-btn"
                          onClick={() =>
                            handleViewInvoice(
                              po
                            )
                          }
                          disabled={
                            !po.invoiceURL
                          }
                        >
                          View Invoice
                        </button>

                        {canViewGR ? (

                          <button
                            className="view-btn"
                            onClick={() =>
                              handleViewGoodsReceipt(
                                existingGR
                              )
                            }
                          >
                            View GR
                          </button>

                        ) : (

                          <button
                            className="approve-btn"
                            onClick={() =>
                              handleInspectGoods(
                                po
                              )
                            }
                            disabled={
                              inspecting
                            }
                          >
                            {inspecting
                              ? "Checking..."
                              : "Inspect Goods"}
                          </button>

                        )}

                        {canConfirm && (
                          <button
                            className="approve-btn"
                            onClick={() =>
                              handleConfirmDelivery(
                                po
                              )
                            }
                            disabled={
                              confirmingId ===
                              po.id
                            }
                          >
                            {confirmingId ===
                            po.id
                              ? "..."
                              : "Confirm Delivery"}
                          </button>
                        )}

                        {/* TRACK */}

                        <button
                          className="track-btn"
                          onClick={() =>
                            handleTrack(
                              po
                            )
                          }
                          disabled={
                            trackingId ===
                            po.id
                          }
                        >
                          <Clock3 size={14} />
                          {trackingId ===
                          po.id
                            ? "..."
                            : "Track"}
                        </button>

                      </div>

                    </td>

                  </tr>
                );
              })

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="no-data"
                >
                  No Purchase Orders Found
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {inspectionPO &&
        createPortal(

          <div
            className="modal-overlay"
            onClick={() =>
              setInspectionPO(null)
            }
          >

            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Inspect Goods
                  </h2>

                  <p>
                    PO:{" "}
                    <strong>
                      {inspectionPO.poNumber}
                    </strong>
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setInspectionPO(null)
                  }
                >
                  ×
                </button>

              </div>

              <div className="table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Product</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Accepted</th>
                      <th>Rejected</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>

                    {inspectionItems.map(
                      (item) => (

                        <tr key={item.id}>

                          {/* CHECK */}

                          <td>
                            <input
                              type="checkbox"
                              checked={
                                item.inspected
                              }
                              onChange={(e) =>
                                updateInspectionItem(
                                  item.id,
                                  "inspected",
                                  e.target.checked
                                )
                              }
                            />
                          </td>

                          {/* PRODUCT */}

                          <td>
                            {item.productName}
                          </td>

                          {/* ORDERED */}

                          <td>
                            {item.orderedQuantity}
                          </td>

                          {/* RECEIVED */}

                          <td>
                            <input
                              type="number"
                              min="0"
                              value={
                                item.receivedQuantity
                              }
                              onChange={(e) =>
                                updateInspectionItem(
                                  item.id,
                                  "receivedQuantity",
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                            />
                          </td>

                          {/* ACCEPTED */}

                          <td>
                            <input
                              type="number"
                              min="0"
                              max={
                                item.receivedQuantity
                              }
                              value={
                                item.acceptedQuantity
                              }
                              onChange={(e) =>
                                updateInspectionItem(
                                  item.id,
                                  "acceptedQuantity",
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                            />
                          </td>

                          {/* REJECTED */}

                          <td>
                            <input
                              type="number"
                              value={
                                item.rejectedQuantity
                              }
                              disabled
                              readOnly
                            />
                          </td>

                          {/* REMARKS */}

                          <td>
                            <input
                              type="text"
                              value={
                                item.remarks
                              }
                              onChange={(e) =>
                                updateInspectionItem(
                                  item.id,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Remarks"
                            />
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                <strong>
                  Inspection:
                </strong>{" "}

                {allItemsInspected
                  ? allGoodsPerfect
                    ? "All goods are perfect."
                    : "Some goods are rejected."
                  : "Please inspect every item."}
              </div>

              <div className="modal-actions">

                <button
                  className="close-btn"
                  onClick={() =>
                    setInspectionPO(null)
                  }
                >
                  Cancel
                </button>

                <button
                  className={
                    allItemsInspected
                      ? "approve-btn"
                      : "approve-btn"
                  }
                  disabled={
                    !allItemsInspected ||
                    generatingGR
                  }
                  onClick={
                    handleGenerateGoodsReceipt
                  }
                >
                  {generatingGR
                    ? "Generating..."
                    : "Generate Goods Receipt"}
                </button>

              </div>

            </div>

          </div>,

          document.body
        )}

      {viewingGR &&
        createPortal(

          <div
            className="modal-overlay"
            onClick={() =>
              setViewingGR(null)
            }
          >

            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Goods Receipt
                  </h2>

                  <p>
                    GR Number:{" "}
                    <strong>
                      {
                        viewingGR.goodsReceiptNumber
                      }
                    </strong>
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setViewingGR(null)
                  }
                >
                  ×
                </button>

              </div>

              <p>
                <strong>
                  Quality Status:
                </strong>{" "}

                <span
                  className={`status-badge ${
                    viewingGR.qualityStatus ===
                    "PASS"
                      ? "approved"
                      : viewingGR.qualityStatus ===
                        "FAIL"
                      ? "rejected"
                      : "pending"
                  }`}
                >
                  {viewingGR.qualityStatus ||
                    "PENDING"}
                </span>
              </p>

              <p>
                <strong>
                  Received Date:
                </strong>{" "}
                {viewingGR.receivedDate
                  ? new Date(
                      viewingGR.receivedDate
                    ).toLocaleDateString()
                  : "-"}
              </p>

              <div className="table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Accepted</th>
                      <th>Rejected</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>

                    {viewingGR.items?.map(
                      (item) => (

                        <tr key={item.id}>

                          <td>
                            {item.productName ||
                              item.product?.name ||
                              "-"}
                          </td>

                          <td>
                            {
                              item.orderedQuantity
                            }
                          </td>

                          <td>
                            {
                              item.receivedQuantity
                            }
                          </td>

                          <td>
                            {
                              item.acceptedQuantity
                            }
                          </td>

                          <td>
                            {
                              item.rejectedQuantity
                            }
                          </td>

                          <td>
                            {item.remarks ||
                              "-"}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

              <div className="modal-actions">

                <button
                  className="close-btn"
                  onClick={() =>
                    setViewingGR(null)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>,

          document.body
        )}

      {ratingPO &&
        createPortal(

          <div
            className="modal-overlay"
            onClick={closeRatingModal}
          >

            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Supplier Performance
                  </h2>

                  <p>
                    Supplier:{" "}
                    <strong>
                      {
                        ratingPO.supplierName ||
                        "-"
                      }
                    </strong>
                  </p>

                  <p>
                    PO:{" "}
                    <strong>
                      {
                        ratingPO.poNumber
                      }
                    </strong>
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={
                    closeRatingModal
                  }
                >
                  ×
                </button>

              </div>

              {/* QUALITY */}

              <div className="form-group">

                <label>
                  Quality Rating
                </label>

                <RatingInput
                  value={
                    qualityRating
                  }
                  onChange={
                    setQualityRating
                  }

                />

              </div>

              {/* DELIVERY */}

              <div className="form-group">

                <label>
                  Delivery Rating
                </label>

                <RatingInput
                  value={
                    deliveryRating
                  }
                  onChange={
                    setDeliveryRating
                  }
                />

              </div>

              {/* PRICE */}

              <div className="form-group">

                <label>
                  Price Rating
                </label>

                <RatingInput
                  value={
                    priceRating
                  }
                  onChange={
                    setPriceRating
                  }
                />

              </div>

              <div className="modal-actions">

                <button
                  className="close-btn"
                  onClick={
                    closeRatingModal
                  }
                >
                  Cancel
                </button>

                <button
                  className="approve-btn"
                  disabled={
                    ratingSubmitting ||
                    qualityRating === 0 ||
                    deliveryRating === 0 ||
                    priceRating === 0
                  }
                  onClick={
                    handleSubmitRating
                  }
                >
                  {ratingSubmitting
                    ? "Submitting..."
                    : "Submit Rating"}
                </button>

              </div>

            </div>

          </div>,

          document.body
        )}

      {returnPO &&
        returnGR &&
        createPortal(

          <div
            className="modal-overlay"
            onClick={
              closeReturnModal
            }
          >

            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <div>
                  <h2>
                    Return / Replacement
                  </h2>

                  <p>
                    PO:{" "}
                    <strong>
                      {
                        returnPO.poNumber
                      }
                    </strong>
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={
                    closeReturnModal
                  }
                >
                  ×
                </button>

              </div>

              <p>
                Some goods were rejected
                during inspection.
              </p>

              <div className="table-wrapper">

                <table className="table">

                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Received</th>
                      <th>Accepted</th>
                      <th>Rejected</th>
                    </tr>
                  </thead>

                  <tbody>

                    {returnGR.items?.filter(
                        (item) => Number(item.rejectedQuantity || 0) > 0)
                      .map(
                        (item) => (

                          <tr key={item.id}>

                            <td>{item.productName || item.product?.name || "-"}</td>

                            <td>{item.receivedQuantity}</td>

                            <td>{item.acceptedQuantity}</td>

                            <td>{item.rejectedQuantity}</td>

                          </tr>

                        )
                      )}

                  </tbody>

                </table>

              </div>

              <div className="form-group">

                <label>
                  Reason for Return /
                  Replacement
                </label>

                <textarea rows="4" value={returnReason}
                  onChange={(e) =>
                    setReturnReason(e.target.value)
                  }
                  placeholder="Enter reason..."
                />

              </div>

              <div className="modal-actions">

                <button className="close-btn" onClick={closeReturnModal}>
                  Cancel
                </button>

                <button
                  className="reject-btn"
                  disabled={returnSubmitting || !returnReason.trim()}
                  onClick={handleSubmitReturn}>
                  {returnSubmitting? "Submitting..." : "Create Return / Replacement"}
                </button>

              </div>

            </div>

          </div>,

          document.body
        )}

      {trackPo && createPortal(

          <div className="modal-overlay" onClick={closeTrackModal}>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <div className="modal-header">

                <h2>Track PO -{" "}
                  {trackPo.poNumber}
                </h2>

                <button className="modal-close" onClick={closeTrackModal}>
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

                          <h4>
                            {item.newStatus? item.newStatus.replaceAll("_"," "): "-"}
                          </h4>

                          <p>
                            <b>Previous:</b>{" "}
                            {item.oldStatus? item.oldStatus.replaceAll("_", " "): "-"}
                          </p>

                          <p>
                            <b>Remarks:</b>
                            {" "}{item.remarks || "-"}
                          </p>

                          <p>
                            <b>
                              Date:
                            </b>{" "}
                            {item.changedAt? new Date(item.changedAt).toLocaleString(): "-"}
                          </p>

                        </div>

                      </div>

                    )
                  )}

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