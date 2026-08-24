import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import returnReplacementService from "../../services/returnReplacementService";
    
const ACTIVE_STATUSES = [
    "RAISED",
    "UNDER_REVIEW",
    "RETURN_APPROVED",
    "REPLACEMENT_APPROVED",
    "REPLACEMENT_DISPATCHED",
    "REPLACEMENT_DELIVERED"
];

const STATUS_LABELS = {
    RAISED: "Raised",
    UNDER_REVIEW: "Under Review",
    RETURN_APPROVED: "Return Approved",
    REPLACEMENT_APPROVED: "Replacement Approved",
    REPLACEMENT_DISPATCHED: "Replacement Dispatched",
    REPLACEMENT_DELIVERED: "Replacement Delivered",
    RESOLVED: "Resolved",
    REJECTED: "Rejected"
};

export const ReturnReplacementSection = () => {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedRequest, setSelectedRequest] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {

        const modalOpen = !!selectedRequest;

        document.body.style.overflow =
            modalOpen ? "hidden" : "";

        const handleKey = (e) => {

            if (e.key === "Escape") {
                setSelectedRequest(null);
            }
        };

        document.addEventListener(
            "keydown",
            handleKey
        );

        return () => {

            document.body.style.overflow = "";

            document.removeEventListener(
                "keydown",
                handleKey
            );
        };

    }, [selectedRequest]);

    const getErrorMessage = (err) => {

        return (
            err?.response?.data?.error?.message ||
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong"
        );
    };

    const loadRequests = async () => {

        setLoading(true);
        setError("");

        try {

            const data = await returnReplacementService.getSupplierPendingReturns();

            setRequests(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);
        }
    };

    const updateStatus = async (
        requestId,
        status
    ) => {

        setUpdatingId(requestId);
        setError("");

        try {

            const updated =
                await returnReplacementService
                    .updateSupplierStatus(
                        requestId,
                        status
                    );

            setRequests((prev) =>
                prev.map((item) =>
                    item.id === requestId
                        ? updated
                        : item
                )
            );

            setSelectedRequest(updated);

        } catch (err) {

            setError(
                getErrorMessage(err)
            );

        } finally {

            setUpdatingId(null);
        }
    };

    const getAvailableActions = (status) => {

        switch (status) {

            case "RAISED":

                return [
                    {
                        status: "UNDER_REVIEW",
                        label: "Review Request",
                        className: "approve-btn"
                    },
                    {
                        status: "REJECTED",
                        label: "Reject",
                        className: "reject-btn"
                    }
                ];

            case "UNDER_REVIEW":

                return [
                    {
                        status: "RETURN_APPROVED",
                        label: "Approve Return",
                        className: "approve-btn"
                    },
                    {
                        status: "REPLACEMENT_APPROVED",
                        label: "Approve Replacement",
                        className: "approve-btn"
                    },
                    {
                        status: "REJECTED",
                        label: "Reject",
                        className: "reject-btn"
                    }
                ];

            case "REPLACEMENT_APPROVED":

                return [
                    {
                        status: "REPLACEMENT_DISPATCHED",
                        label: "Mark Replacement Dispatched",
                        className: "approve-btn"
                    }
                ];

            case "REPLACEMENT_DISPATCHED":

                return [
                    {
                        status: "REPLACEMENT_DELIVERED",
                        label: "Mark Replacement Delivered",
                        className: "approve-btn"
                    }
                ];

            case "REPLACEMENT_DELIVERED":

                return [
                    {
                        status: "RESOLVED",
                        label: "Mark Resolved",
                        className: "approve-btn"
                    }
                ];

            case "RETURN_APPROVED":

                return [
                    {
                        status: "RESOLVED",
                        label: "Mark Resolved",
                        className: "approve-btn"
                    }
                ];

            default:
                return [];
        }
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "RAISED":
                return "pending";

            case "UNDER_REVIEW":
                return "pending";

            case "RETURN_APPROVED":
            case "REPLACEMENT_APPROVED":
            case "REPLACEMENT_DELIVERED":
            case "RESOLVED":
                return "approved";

            case "REPLACEMENT_DISPATCHED":
                return "in-progress";

            case "REJECTED":
                return "rejected";

            default:
                return "pending";
        }
    };

    return (
        <div className="admin-requisition-section">

            <div className="section-header">

                <h2 className="section-title">
                    Return / Replacement
                </h2>

                <button
                    className="view-btn"
                    onClick={loadRequests}
                    disabled={loading}
                >
                    {loading
                        ? "Loading..."
                        : "Refresh"}
                </button>

            </div>

            {error && (
                <div className="error-box">

                    <span>
                        {error}
                    </span>

                    <button
                        className="error-dismiss"
                        onClick={() =>
                            setError("")
                        }
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
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Raised Date</th>
                            <th>Items</th>
                            <th>Action</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="no-data"
                                >
                                    Loading return/replacement
                                    requests...
                                </td>
                            </tr>

                        ) : requests.length === 0 ? (

                            <tr>
                                <td
                                    colSpan="6"
                                    className="no-data"
                                >
                                    No return/replacement
                                    requests.
                                </td>
                            </tr>

                        ) : (

                            requests.map((request) => {

                                const actions =
                                    getAvailableActions(
                                        request.status
                                    );

                                return (
                                    <tr
                                        key={
                                            request.id
                                        }
                                    >

                                        <td>
                                            {request.purchaseOrderNumber ||
                                                request.poNumber ||
                                                `PO #${request.purchaseOrderId}`}
                                        </td>

                                        <td>
                                            {request.reason ||
                                                "-"}
                                        </td>

                                        <td>

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    request.status
                                                )}`}
                                            >
                                                {STATUS_LABELS[
                                                    request.status
                                                ] ||
                                                    request.status}
                                            </span>

                                        </td>

                                        <td>
                                            {request.raisedAt
                                                ? new Date(
                                                    request.raisedAt
                                                ).toLocaleString()
                                                : "-"}
                                        </td>

                                        <td>
                                            {request.items?.length ||
                                                0}
                                        </td>

                                        <td>

                                            <div className="action-group">

                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        setSelectedRequest(
                                                            request
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>

                                                {actions.length > 0 && (
                                                    <button
                                                        className={
                                                            actions[0]
                                                                .className
                                                        }
                                                        disabled={
                                                            updatingId ===
                                                            request.id
                                                        }
                                                        onClick={() =>
                                                            updateStatus(
                                                                request.id,
                                                                actions[0]
                                                                    .status
                                                            )
                                                        }
                                                    >
                                                        {updatingId ===
                                                        request.id
                                                            ? "Updating..."
                                                            : actions[0]
                                                                .label}
                                                    </button>
                                                )}

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })
                        )}

                    </tbody>

                </table>

            </div>

            {selectedRequest &&
                createPortal(

                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setSelectedRequest(
                                null
                            )
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
                                        Request
                                    </h2>

                                    <p>
                                        PO:{" "}
                                        <strong>
                                            {selectedRequest.purchaseOrderNumber ||
                                                selectedRequest.poNumber ||
                                                `#${selectedRequest.purchaseOrderId}`}
                                        </strong>
                                    </p>

                                </div>

                                <button
                                    className="modal-close"
                                    onClick={() =>
                                        setSelectedRequest(
                                            null
                                        )
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div>

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}

                                    <span
                                        className={`status-badge ${getStatusClass(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {STATUS_LABELS[
                                            selectedRequest.status
                                        ] ||
                                            selectedRequest.status}
                                    </span>
                                </p>

                                <p>
                                    <strong>
                                        Reason:
                                    </strong>{" "}
                                    {selectedRequest.reason ||
                                        "-"}
                                </p>

                                <p>
                                    <strong>
                                        Raised At:
                                    </strong>{" "}
                                    {selectedRequest.raisedAt
                                        ? new Date(
                                            selectedRequest.raisedAt
                                        ).toLocaleString()
                                        : "-"}
                                </p>

                            </div>

                            <div className="table-wrapper">

                                <table className="table">

                                    <thead>

                                        <tr>
                                            <th>
                                                Product
                                            </th>
                                            <th>
                                                Expected
                                            </th>
                                            <th>
                                                Received
                                            </th>
                                            <th>
                                                Accepted
                                            </th>
                                            <th>
                                                Defective
                                            </th>
                                            <th>
                                                Shortage
                                            </th>
                                            <th>
                                                Extra
                                            </th>
                                            <th>
                                                Issue
                                            </th>
                                            <th>
                                                Remarks
                                            </th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {selectedRequest
                                            .items
                                            ?.map(
                                                (item) => (

                                                    <tr
                                                        key={
                                                            item.id ||
                                                            item.goodsReceiptItemId
                                                        }
                                                    >

                                                        <td>
                                                            {item.productName ||
                                                                "-"}
                                                        </td>

                                                        <td>
                                                            {item.expectedQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.receivedQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.acceptedQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.defectiveQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.shortageQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.extraQuantity ??
                                                                0}
                                                        </td>

                                                        <td>
                                                            {item.issueType ||
                                                                "-"}
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

                                {getAvailableActions(
                                    selectedRequest.status
                                ).map(
                                    (action) => (

                                        <button
                                            key={
                                                action.status
                                            }
                                            className={
                                                action.className
                                            }
                                            disabled={
                                                updatingId ===
                                                selectedRequest.id
                                            }
                                            onClick={() =>
                                                updateStatus(
                                                    selectedRequest.id,
                                                    action.status
                                                )
                                            }
                                        >
                                            {updatingId ===
                                            selectedRequest.id
                                                ? "Updating..."
                                                : action.label}
                                        </button>

                                    )
                                )}

                                <button
                                    className="close-btn"
                                    onClick={() =>
                                        setSelectedRequest(
                                            null
                                        )
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

export default ReturnReplacementSection;