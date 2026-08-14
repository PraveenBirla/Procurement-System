import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import requisitionService from "../../services/requisitionService";
// import "./FinanceRequisitionSection.css";

const STATUS = "APPROVED";

export const  ApprovedSection = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRequisition, setSelectedRequisition] =
    useState(null);

  const [trackedReq, setTrackedReq] = useState(null);
  const [showTrackModal, setShowTrackModal] =
    useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const loadApproved = async () => {
    setLoading(true);

    try {
      const result =
        await requisitionService.getFinanceRequisitionsByStatus(
          STATUS
        );

      setRequisitions(
        Array.isArray(result) ? result : []
      );

      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load approved requisitions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApproved();
  }, []);

  const handleTrack = async (req) => {
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setHistory([]);

    try {
      const result =
        await requisitionService.getRequisitionHistory(
          req.id
        );

      setHistory(
        Array.isArray(result) ? result : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Failed to load history"
      );
      setShowTrackModal(false);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeTrack = () => {
    setShowTrackModal(false);
    setTrackedReq(null);
    setHistory([]);
  };

  const formatStatus = (status) =>
    status
      ? status.replaceAll("_", " ")
      : "-";

  return (
    <div className="admin-requisition-section">

      <div className="section-header">
        <h2 className="section-title">
          Approved Requisitions
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
                  colSpan="7"
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
                    <span className="status-badge approved">
                      {formatStatus(req.status)}
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
                        View
                      </button>

                      <button
                        className="track-btn"
                        onClick={() =>
                          handleTrack(req)
                        }
                      >
                        Track
                      </button>

                    </div>

                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="7"
                  className="no-data"
                >
                  No approved requisitions
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

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
                <strong>Status:</strong>{" "}
                <span className="status-badge approved">
                  {formatStatus(
                    selectedRequisition.status
                  )}
                </span>
              </p>

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

      {showTrackModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={closeTrack}
          >
            <div
              className="modal-content"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="modal-header">
                <h2>
                  Track{" "}
                  {trackedReq?.requisitionNo}
                </h2>

                <button
                  className="modal-close"
                  onClick={closeTrack}
                >
                  ×
                </button>
              </div>

              {loadingHistory ? (
                <p className="no-data">
                  Loading history...
                </p>
              ) : history.length > 0 ? (
                <div className="timeline">

                  {history.map(
                    (item, index) => (
                      <div
                        className="timeline-item"
                        key={index}
                      >
                        <div className="timeline-dot" />

                        <div className="timeline-content">

                          <h4>
                            {formatStatus(
                              item.newStatus
                            )}
                          </h4>

                          <p>
                            <b>Previous:</b>{" "}
                            {formatStatus(
                              item.oldStatus
                            )}
                          </p>

                          <p>
                            <b>Remarks:</b>{" "}
                            {item.remarks || "-"}
                          </p>

                          <p>
                            <b>Date:</b>{" "}
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
                  onClick={closeTrack}
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