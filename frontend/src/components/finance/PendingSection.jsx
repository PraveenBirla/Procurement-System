import { useEffect, useState } from "react";
import requisitionService from "../../services/requisitionService";
import { createPortal } from "react-dom";
import { Eye } from "lucide-react";
// import "./FinanceRequisitionSection.css";

const PENDING_STATUS = "PENDING_FINANCE";

export const  PendingSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] =
    useState(null);

  const [actionModal, setActionModal] =
    useState(null);

  const [remarks, setRemarks] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPending = async () => {
    setLoading(true);

    try {
      const result =
        await requisitionService.getRequisitionsByStatus(
          PENDING_STATUS
        );

      setRequisitions(
        Array.isArray(result) ? result : []
      );

      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load pending requisitions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const openActionModal = (req, type) => {
    setActionModal({
      req,
      type,
    });

    setRemarks("");
    setRemarkError("");
  };

  const closeActionModal = () => {
    if (submitting) return;

    setActionModal(null);
    setRemarks("");
    setRemarkError("");
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();

    if (!actionModal) return;

    if (!remarks.trim()) {
      setRemarkError(
        "Remarks are required"
      );
      return;
    }

    setSubmitting(true);

    try {
      await requisitionService.financeUpdate(
        actionModal.req.id,
        {
          decision: actionModal.type,
          remarks: remarks.trim(),
        }
      );

      setActionModal(null);
      setRemarks("");

      await loadPending();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Action failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-requisition-section">

      <div className="section-header">
        <h2 className="section-title">
          Pending Finance Requisitions
        </h2>
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

      <div className="table-wrapper">

        <table className="table">

          <thead>
            <tr>
              <th>Requisition No</th>
              <th>Title</th>
              <th>Department</th>
              <th>Amount</th>
              <th>Created</th>
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
                  Loading requisitions...
                </td>
              </tr>

            ) : requisitions.length > 0 ? (

              requisitions.map((req) => (

                <tr key={req.id}>

                  <td>
                    {req.requisitionNo || "-"}
                  </td>

                  <td>
                    {req.title || "-"}
                  </td>

                  <td>
                    {req.departmentName || "-"}
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
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td>

                  <td>

                    <div className="action-group">

                      <button
                        className="view-btn"
                        onClick={() =>
                          setSelectedRequisition(req)
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
                        Reject
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="6"
                  className="no-data"
                >
                  No pending requisitions
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* VIEW MODAL */}

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
                  {selectedRequisition.requisitionNo}
                </h2>

                <button
                  className="modal-close"
                  onClick={() =>
                    setSelectedRequisition(null)
                  }
                >
                  ×
                </button>

              </div>

              <p>
                <strong>Title:</strong>{" "}
                {selectedRequisition.title ||
                  "-"}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {selectedRequisition.description ||
                  "-"}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {selectedRequisition.departmentName ||
                  "-"}
              </p>

              <p>
                <strong>Amount:</strong> ₹
                {Number(
                  selectedRequisition.totalEstimatedAmount ||
                    0
                ).toLocaleString("en-IN")}
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
                              {item.productName ||
                                "-"}
                            </td>

                            <td>
                              {item.quantity || 0}
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
                    setSelectedRequisition(null)
                  }
                >
                  Close
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

      {/* APPROVE / REJECT */}

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
                  {actionModal.type === "approved"
                    ? "Approve"
                    : "Reject"}{" "}
                  -{" "}
                  {
                    actionModal.req
                      .requisitionNo
                  }
                </h2>

                <button
                  className="modal-close"
                  onClick={closeActionModal}
                  disabled={submitting}
                >
                  ×
                </button>

              </div>

              <p className="action-summary">
                <strong>
                  {actionModal.req.title}
                </strong>
                {" - "}₹
                {Number(
                  actionModal.req
                    .totalEstimatedAmount ||
                    0
                ).toLocaleString("en-IN")}
              </p>

              <form
                onSubmit={handleSubmitAction}
                noValidate
              >

                <div className="field">

                  <label>
                    Remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);

                      if (remarkError) {
                        setRemarkError("");
                      }
                    }}
                    placeholder={
                      actionModal.type ===
                      "approved"
                        ? "Add a note for this approval..."
                        : "Reason for rejection..."
                    }
                    rows={4}
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
                    disabled={submitting}
                  >
                    {submitting
                      ? "Submitting..."
                      : actionModal.type ===
                        "approved"
                      ? "Confirm Approve"
                      : "Confirm Reject"}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeActionModal}
                    disabled={submitting}
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