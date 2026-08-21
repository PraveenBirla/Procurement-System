import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";

import requisitionService from "../../services/requisitionService";
// import "./PendingSection.css";

const PENDING_STATUS = "PENDING_MANAGER";

export const PendingSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] =
    useState(null);

  const [actionModal, setActionModal] =
    useState(null);

  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] =
    useState("");

  const [submittingAction, setSubmittingAction] =
    useState(false);

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
    const modalOpen =
      !!selectedRequisition ||
      !!actionModal;

    document.body.style.overflow = modalOpen
      ? "hidden"
      : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeActionModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedRequisition,
    actionModal,
  ]);

  const loadRequisitions = async () => {
    setLoading(true);

    try {
      const res =
        await requisitionService.getRequisitionsByStatusManager(
          PENDING_STATUS
        );

      const data = Array.isArray(res)
        ? [...res]
        : [];

      data.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      setRequisitions(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (
    req,
    type
  ) => {
    setActionModal({
      req,
      type,
    });

    setRemarks("");
    setRemarkError("");
  };

  const closeActionModal = () => {
    if (submittingAction) return;

    setActionModal(null);
    setRemarks("");
    setRemarkError("");
  };

  const handleSubmitAction = async (
    e
  ) => {
    e.preventDefault();

    if (!actionModal) return;

    if (!remarks.trim()) {
      setRemarkError(
        "Remarks are required"
      );
      return;
    }

    try {
      setSubmittingAction(true);

      await requisitionService.managerUpdate(
        actionModal.req.id,
        {
          decision: actionModal.type,
          remarks: remarks.trim(),
        }
      );

      setActionModal(null);
      setRemarks("");
      setRemarkError("");

      await loadRequisitions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmittingAction(false);
    }
  };

  const formatStatus = (status) => {
    return status
      ? status.replaceAll("_", " ")
      : "-";
  };

  return (
    <div className="manager-section">

      <div className="section-header">

        <div>
          <h2 className="section-title">
            Pending Requisitions
          </h2>

          <p className="section-subtitle">
            Requisitions waiting for your
            approval decision.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadRequisitions}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
          />

          {loading
            ? "Refreshing..."
            : "Refresh"}
        </button>

      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <div className="section-count">
        {requisitions.length} pending requisition(s)
      </div>

      <div className="table-wrapper">

        <table className="table">

          <thead>
            <tr>
              <th>Requisition No</th>
              <th>Title</th>
              <th>Employee</th>
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
                <td
                  colSpan="8"
                  className="no-data"
                >
                  Loading…
                </td>
              </tr>
            ) : requisitions.length > 0 ? (

              requisitions.map((req) => (

                <tr key={req.id}>

                  <td>
                    <div className="req-number-cell">
                      {req.requisitionNo}

                      {req.isDuplicate && (
                        <span className="duplicate-badge">
                          Duplicate
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    {req.title || "-"}
                  </td>

                  <td>
                    {req.employeeName || "-"}
                  </td>

                  <td>
                    {req.departmentName || "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        req.status?.toLowerCase() || ""
                      }`}
                    >
                      {formatStatus(
                        req.status
                      )}
                    </span>
                  </td>

                  <td>
                    ₹
                    {Number(
                      req.totalEstimatedAmount || 0
                    ).toLocaleString("en-IN")}
                  </td>

                  <td>
                    {req.createdAt
                      ? new Date(
                          req.createdAt
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>

                    <div className="action-group">

                      <button
                        className="view-btn"
                        onClick={() =>
                          setSelectedRequisition(
                            req
                          )
                        }
                      >
                        <Eye size={14} />
                        View
                      </button>

                      <button
                        className="approve-btn"
                        onClick={() =>
                          openActionModal(
                            req,
                            "approved"
                          )
                        }
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() =>
                          openActionModal(
                            req,
                            "rejected"
                          )
                        }
                      >
                        <XCircle size={14} />
                        Reject
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="no-data"
                >
                  No Pending Requisitions
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* View Modal */}

      {selectedRequisition &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() =>
              setSelectedRequisition(null)
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
                  {
                    selectedRequisition.requisitionNo
                  }
                </h2>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedRequisition(
                      null
                    )
                  }
                >
                  ×
                </button>
              </div>

              <p>
                <strong>
                  Title:
                </strong>{" "}
                {
                  selectedRequisition.title ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Description:
                </strong>{" "}
                {
                  selectedRequisition.description ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Employee:
                </strong>{" "}
                {
                  selectedRequisition.employeeName ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Department:
                </strong>{" "}
                {
                  selectedRequisition.departmentName ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}

                <span
                  className={`status-badge ${
                    selectedRequisition.status?.toLowerCase() ||
                    ""
                  }`}
                >
                  {formatStatus(
                    selectedRequisition.status
                  )}
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

                    {selectedRequisition.items?.length >
                    0 ? (

                      selectedRequisition.items.map(
                        (item) => (
                          <tr key={item.id}>

                            <td>
                              {item.productName}
                            </td>

                            <td>
                              {item.quantity}
                            </td>

                            <td>
                              ₹
                              {Number(
                                item.unitPrice || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </td>

                          </tr>
                        )
                      )

                    ) : (

                      <tr>
                        <td
                          colSpan="3"
                          className="no-data"
                        >
                          No item details
                          available
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              <div className="modal-actions">
                <button
                  className="close-btn"
                  onClick={() =>
                    setSelectedRequisition(
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

      {/* Approve / Reject Modal */}

      {actionModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={closeActionModal}
          >

            <div
              className="modal-content action-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">

                <h2>
                  {actionModal.type ===
                  "approved"
                    ? "Approve"
                    : "Reject"}{" "}
                  - {" "}
                  {
                    actionModal.req
                      .requisitionNo
                  }
                </h2>

                <button
                  className="modal-close"
                  onClick={
                    closeActionModal
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleSubmitAction
                }
              >

                <p className="action-summary">
                  <strong>
                    {actionModal.req.title}
                  </strong>
                </p>

                <div className="field">

                  <label>Remarks</label>

                  <textarea
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(
                        e.target.value
                      );

                      if (remarkError) {
                        setRemarkError("");
                      }
                    }}
                    rows={4}
                    placeholder={
                      actionModal.type ===
                      "approved"
                        ? "Approval remarks..."
                        : "Reason for rejection..."
                    }
                    className={
                      remarkError
                        ? "input-error"
                        : ""
                    }
                  />

                  {remarkError && (
                    <span className="field-error">
                      {remarkError}
                    </span>
                  )}

                </div>

                <div className="modal-actions">

                  <button
                    type="submit"
                    className={
                      actionModal.type ===
                      "approved"
                        ? "approve-btn-lg"
                        : "reject-btn-lg"
                    }
                    disabled={
                      submittingAction
                    }
                  >
                    {submittingAction
                      ? "Submitting..."
                      : actionModal.type ===
                        "approved"
                      ? "Confirm Approve"
                      : "Confirm Reject"}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={
                      closeActionModal
                    }
                    disabled={
                      submittingAction
                    }
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