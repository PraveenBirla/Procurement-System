import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import suppliersService from "../../services/suppliersService";
import purchaseOrderService from "../../services/purchaseOrderService";
import { Clock3 } from "lucide-react";

const DELIVERED_STATUS = "DELIVERED";

export const DeliveredOrderSection = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [returnMap, setReturnMap] = useState({});

    const [trackPo, setTrackPo] = useState(null);
    const [poHistory, setPoHistory] = useState([]);
    const [loadingPoHistory, setLoadingPoHistory] = useState(false);

    const [trackingId, setTrackingId] = useState(null);

    const [returnPO, setReturnPO] = useState(null);
    const [returnDetails, setReturnDetails] = useState(null);

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

        document.body.style.overflow = trackPo || returnPO? "hidden": "";

        const handleKey = (e) => {

            if (e.key !== "Escape") {
                return;
            }

            closeTrackModal();
            closeReturnModal();
        };

        document.addEventListener(
            "keydown",
            handleKey
        );

        return () => {

            document.body.style.overflow = "";

            document.removeEventListener("keydown", handleKey);
        };

    }, [trackPo, returnPO]);

    const loadOrders = async () => {

        setLoading(true);

        try {

            const res = await suppliersService.getSuppliersOrderByStatus(DELIVERED_STATUS);

            setOrders(res);

            const returns = {};

            await Promise.all(

                res.map(async (po) => {

                    try {

                        const returnRequests = await suppliersService
                                .getReturnReplacementByPurchaseOrder(
                                    po.id
                                );

                        if (Array.isArray(returnRequests) && returnRequests.length > 0) {
                            returns[po.id] = returnRequests[returnRequests.length - 1];
                        }

                    } catch (err) {
                        // No return request is normal.
                    }
                })
            );

            setReturnMap(returns);
            setError("");

        } catch (err) {

            setError(getErrorMessage(err));

        } finally {
            setLoading(false);
        }
    };

    const handleViewPO = (po) => {

        if (!po?.pdfURL) {
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
            return;
        }

        window.open(
            po.invoiceURL,
            "_blank",
            "noopener,noreferrer"
        );
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

    const openReturnDetails = (po) => {

        const returnRequest = returnMap[po.id];

        if (!returnRequest) {
            return;
        }

        setReturnPO(po);
        setReturnDetails(returnRequest);
    };

    const closeReturnModal = () => {

        setReturnPO(null);
        setReturnDetails(null);
    };

    const formatIssueType = (issueType) => {

        if (!issueType) {
            return "-";
        }

        return issueType
            .replaceAll("_", " ");
    };

    return (

        <div className="admin-requisition-section">

            <div className="section-header">

                <h2 className="section-title">
                    Delivered Orders
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

                            <th>Status</th>

                            <th>Return Status</th>

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

                                const returnRequest =
                                    returnMap[po.id];

                                return (

                                    <tr key={po.id}>

                                        <td data-label="PO Number">
                                            {po.poNumber}
                                        </td>

                                        <td data-label="Requisition No">
                                            {po.requisitionNo}
                                        </td>

                                        <td data-label="Status">

                                            <span
                                                className={`status-badge ${po.status?.toLowerCase()}`}
                                            >
                                                {po.status?.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </span>

                                        </td>

                                        <td data-label="Return Status">

                                            {returnRequest ? (

                                                <span
                                                    className={`status-badge ${returnRequest.status?.toLowerCase()}`}
                                                >
                                                    {returnRequest.status?.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>

                                            ) : (
                                                "-"
                                            )}

                                        </td>

                                        <td data-label="Amount">

                                            ₹{Number(po.totalAmount || 0).toLocaleString()}

                                        </td>

                                        <td data-label="Expected Delivery">

                                            {po.expectedDeliveryDate
                                                ? new Date(
                                                    po.expectedDeliveryDate
                                                ).toLocaleDateString()
                                                : "-"}

                                        </td>

                                        <td data-label="Created">

                                            {po.createdAt
                                                ? new Date(
                                                    po.createdAt
                                                ).toLocaleDateString()
                                                : "-"}

                                        </td>

                                        <td data-label="Action">

                                            <div className="action-group">

                                                {returnRequest && (

                                                    <button
                                                        className="reject-btn"
                                                        onClick={() =>
                                                            openReturnDetails(
                                                                po
                                                            )
                                                        }
                                                    >
                                                        View Issue
                                                    </button>
                                                )}

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
                                                    <Clock3
                                                        size={14}
                                                    />

                                                    {trackingId ===
                                                    po.id
                                                        ? "…"
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

            {returnPO &&
                returnDetails &&
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
                                        Return / Replacement Request
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
                                    aria-label="Close"
                                >
                                    ×
                                </button>

                            </div>

                            <div className="form-group">

                                <label>
                                    Buyer Reason
                                </label>

                                <textarea
                                    value={
                                        returnDetails.reason ||
                                        ""
                                    }
                                    readOnly
                                    rows="4"
                                />

                            </div>

                            <p>

                                <strong>
                                    Status:
                                </strong>{" "}

                                <span
                                    className={`status-badge ${returnDetails.status?.toLowerCase()}`}
                                >
                                    {returnDetails.status
                                        ?.replaceAll(
                                            "_",
                                            " "
                                        )}
                                </span>

                            </p>

                            <div className="table-wrapper">

                                <table className="table">

                                    <thead>

                                        <tr>

                                            <th>Product</th>

                                            <th>Expected</th>

                                            <th>Received</th>

                                            <th>Accepted</th>

                                            <th>Defective</th>

                                            <th>Shortage</th>

                                            <th>Extra</th>

                                            <th>Issue Type</th>

                                            <th>Remarks</th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {returnDetails.items?.length >
                                        0 ? (

                                            returnDetails.items.map(
                                                (item) => (

                                                    <tr
                                                        key={
                                                            item.id ||
                                                            item.goodsReceiptItemId
                                                        }
                                                    >

                                                        <td>
                                                            {item.productName ||
                                                                `GR Item #${item.goodsReceiptItemId}`}
                                                        </td>

                                                        <td>
                                                            {
                                                                item.expectedQuantity
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
                                                                item.defectiveQuantity ||
                                                                0
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.shortageQuantity ||
                                                                0
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.extraQuantity ||
                                                                0
                                                            }
                                                        </td>

                                                        <td>

                                                            <span className="status-badge rejected">
                                                                {formatIssueType(
                                                                    item.issueType
                                                                )}
                                                            </span>

                                                        </td>

                                                        <td>
                                                            {
                                                                item.remarks ||
                                                                "-"
                                                            }
                                                        </td>

                                                    </tr>
                                                )
                                            )

                                        ) : (

                                            <tr>

                                                <td
                                                    colSpan="9"
                                                    className="no-data"
                                                >
                                                    No item details available.
                                                </td>

                                            </tr>
                                        )}

                                    </tbody>

                                </table>

                            </div>

                            <div className="modal-actions">

                                <button
                                    className="close-btn"
                                    onClick={
                                        closeReturnModal
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body
                )}

            {trackPo &&
                createPortal(

                    <div
                        className="modal-overlay"
                        onClick={
                            closeTrackModal
                        }
                    >

                        <div
                            className="modal-content"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>
                                    Track PO -{" "}
                                    {trackPo.poNumber}
                                </h2>

                                <button
                                    className="modal-close"
                                    onClick={
                                        closeTrackModal
                                    }
                                    aria-label="Close"
                                >
                                    ×
                                </button>

                            </div>

                            {loadingPoHistory ? (

                                <p className="no-data">
                                    Loading history…
                                </p>

                            ) : poHistory.length > 0 ? (

                                <div className="timeline">

                                    {poHistory.map(
                                        (item, index) => (

                                            <div
                                                className="timeline-item"
                                                key={index}
                                            >

                                                <div className="timeline-dot" />

                                                <div className="timeline-content">

                                                    <h4>
                                                        {item.newStatus
                                                            ? item.newStatus.replaceAll(
                                                                "_",
                                                                " "
                                                            )
                                                            : "-"}
                                                    </h4>

                                                    <p>
                                                        <b>
                                                            Previous:
                                                        </b>{" "}
                                                        {item.oldStatus
                                                            ? item.oldStatus.replaceAll(
                                                                "_",
                                                                " "
                                                            )
                                                            : "-"}
                                                    </p>

                                                    <p>
                                                        <b>
                                                            Remarks:
                                                        </b>{" "}
                                                        {item.remarks ||
                                                            "-"}
                                                    </p>

                                                    <p>
                                                        <b>
                                                            Date:
                                                        </b>{" "}
                                                        {item.changedAt
                                                            ? new Date(
                                                                item.changedAt
                                                            ).toLocaleString()
                                                            : "-"}
                                                    </p>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                            ) : (

                                <p className="no-data">
                                    No history available.
                                </p>
                            )}

                            <div className="modal-actions">

                                <button
                                    className="close-btn"
                                    onClick={
                                        closeTrackModal
                                    }
                                >
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