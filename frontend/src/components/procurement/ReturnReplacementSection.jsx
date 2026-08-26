import { useEffect, useState } from "react";

import { createPortal } from "react-dom";

import returnReplacementService from "../../services/returnReplacementService";

import purchaseOrderService from "../../services/purchaseOrderService";

const ACTIVE_STATUSES = [
    "RAISED",
    "UNDER_REVIEW",
    "RETURN_APPROVED",
    "REPLACEMENT_APPROVED",
    "REPLACEMENT_DISPATCHED",
    "REPLACEMENT_DELIVERED",
    "RESOLVED"
];

const STATUS_LABELS = {
    RAISED: "Raised",
    UNDER_REVIEW: "Under Review",
    RETURN_APPROVED: "Return Approved",
    REPLACEMENT_APPROVED: "Replacement Approved",
    REPLACEMENT_DISPATCHED: "Replacement Dispatched",
    REPLACEMENT_DELIVERED: "Replacement Delivered",
    RESOLVED: "Awaiting Procurement Confirmation",
    REJECTED: "Rejected"
};

export const ReturnReplacementSection = () => {

    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [selectedRequest, setSelectedRequest] = useState(null);

    const [updatingId, setUpdatingId] = useState(null);

    const [rating, setRating] = useState(0);

    const [showRatingModal, setShowRatingModal] =
        useState(false);

    const [requestToResolve, setRequestToResolve] =
        useState(null);


    useEffect(() => {

        loadRequests();

    }, []);


    useEffect(() => {

        const modalOpen =
            !!selectedRequest || showRatingModal;

        document.body.style.overflow =
            modalOpen ? "hidden" : "";

        const handleKey = (e) => {

            if (e.key === "Escape") {

                setSelectedRequest(null);

                setShowRatingModal(false);

                setRequestToResolve(null);

                setRating(0);

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

    }, [
        selectedRequest,
        showRatingModal
    ]);


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

            const data = await returnReplacementService.getPOPendingReturns();

            const filteredRequests =
                Array.isArray(data)
                    ? data.filter((item) =>
                        ACTIVE_STATUSES.includes(
                            item.status
                        )
                    )
                    : [];

            setRequests(filteredRequests);

        } catch (err) {

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);

        }

    };


    const openResolveModal = (request) => {

        setRequestToResolve(request);

        setRating(0);

        setShowRatingModal(true);

        setError("");

    };


    const closeResolveModal = () => {

        if (updatingId) return;

        setShowRatingModal(false);

        setRequestToResolve(null);

        setRating(0);

    };


    const confirmResolution = async () => {

        if (!requestToResolve) return;

        if (!rating || rating < 1 || rating > 5) {

            setError(
                "Please provide a rating between 1 and 5."
            );

            return;

        }

        const poId =
            requestToResolve.purchaseOrderId;

        if (!poId) {

            setError(
                "Purchase Order ID is missing."
            );

            return;

        }

        setUpdatingId(
            requestToResolve.id
        );

        setError("");

        try {

            const payload = {

                status: "PROCUREMENT_ACCEPTED",

                rating: rating

            };

            await purchaseOrderService
                .updateStatus(
                    poId,
                    payload
                );

            setRequests((prev) =>
                prev.filter(
                    (item) =>
                        item.id !==
                        requestToResolve.id
                )
            );

            if (
                selectedRequest?.id ===
                requestToResolve.id
            ) {

                setSelectedRequest(null);

            }

            setShowRatingModal(false);

            setRequestToResolve(null);

            setRating(0);

        } catch (err) {

            setError(
                getErrorMessage(err)
            );

        } finally {

            setUpdatingId(null);

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

                return "approved";

            case "REPLACEMENT_DISPATCHED":

                return "in-progress";

            case "RESOLVED":

                return "approved";

            case "REJECTED":

                return "rejected";

            default:

                return "pending";

        }

    };


    return (

        <div className="admin-requisition-section">

            <div className="section-header">

                <div>

                    <h2 className="section-title">

                        Return / Replacement

                    </h2>

                    <p className="section-subtitle">

                        Track supplier return and replacement requests.

                    </p>

                </div>

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

                            <th>
                                PO Number
                            </th>

                            <th>
                                Reason
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Raised Date
                            </th>

                            <th>
                                Items
                            </th>

                            <th>
                                Action
                            </th>

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

                                    No active return/replacement
                                    requests.

                                </td>

                            </tr>

                        ) : (

                            requests.map((request) => (

                                <tr
                                    key={request.id}
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


                                            {request.status ===
                                                "RESOLVED" && (

                                                <button
                                                    className="approve-btn"
                                                    disabled={
                                                        updatingId ===
                                                        request.id
                                                    }
                                                    onClick={() =>
                                                        openResolveModal(
                                                            request
                                                        )
                                                    }
                                                >

                                                    {updatingId ===
                                                        request.id
                                                        ? "Updating..."
                                                        : "Confirm Resolution"}

                                                </button>

                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>


            {selectedRequest &&

                createPortal(

                    <div
                        className="modal-overlay"
                        onClick={() =>
                            setSelectedRequest(null)
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

                                        {selectedRequest.items?.map(
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

                                {selectedRequest.status ===
                                    "RESOLVED" && (

                                    <button
                                        className="approve-btn"
                                        onClick={() =>
                                            openResolveModal(
                                                selectedRequest
                                            )
                                        }
                                    >

                                        Confirm Resolution

                                    </button>

                                )}


                                <button
                                    className="close-btn"
                                    onClick={() =>
                                        setSelectedRequest(null)
                                    }
                                >

                                    Close

                                </button>

                            </div>

                        </div>

                    </div>,

                    document.body

                )}


            {showRatingModal &&

                createPortal(

                    <div
                        className="modal-overlay"
                        onClick={closeResolveModal}
                    >

                        <div
                            className="modal-content action-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="modal-header">

                                <h2>

                                    Confirm Resolution

                                </h2>


                                <button
                                    className="modal-close"
                                    onClick={closeResolveModal}
                                    disabled={
                                        updatingId !== null
                                    }
                                >

                                    ×

                                </button>

                            </div>


                            <p>

                                The supplier has marked this
                                return/replacement request as
                                resolved.

                            </p>

                            <p>

                                Please provide your rating before
                                accepting the resolution.

                            </p>


                            <div className="field">

                                <label>

                                    Supplier Rating

                                </label>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                        marginTop: "8px"
                                    }}
                                >

                                    return (
            <div
                style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "8px"
                }}
            >
                    {[1, 2, 3, 4, 5].map(
                        (star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() =>
                                    onChange(star)
                                }
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    cursor: "pointer",
                                    fontSize:
                                        "28px",
                                    opacity:
                                        star <= value
                                            ? 1
                                            : 0.3
                                }}
                            >
                                ★
                            </button>
                        )
                    )}
                </div>
            );

                                </div>

                            </div>


                            <div className="modal-actions">

                                <button
                                    className="approve-btn"
                                    disabled={
                                        updatingId !== null
                                    }
                                    onClick={
                                        confirmResolution
                                    }
                                >

                                    {updatingId !== null
                                        ? "Confirming..."
                                        : "Accept & Mark Resolved"}

                                </button>


                                <button
                                    className="close-btn"
                                    onClick={
                                        closeResolveModal
                                    }
                                    disabled={
                                        updatingId !== null
                                    }
                                >

                                    Cancel

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