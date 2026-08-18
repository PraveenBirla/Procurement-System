import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  RefreshCw,
  Eye,
  Clock3,
} from "lucide-react";

import requisitionService from "../../services/requisitionService";
// import "./RejectedSection.css";

const REJECTED_STATUS = "REJECTED";

export const RejectedSection = () => {
  const [requisitions, setRequisitions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedRequisition,
    setSelectedRequisition,
  ] = useState(null);

  const [trackReq, setTrackReq] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [loadingHistory, setLoadingHistory] =
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
      !!trackReq;

    document.body.style.overflow = modalOpen
      ? "hidden"
      : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
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
    trackReq,
  ]);

  const loadRequisitions = async () => {
    setLoading(true);

    try {
      const res =
        await requisitionService.getManagerRequisitionsByStatus(
          REJECTED_STATUS
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

  const handleTrack = async (req) => {
    setTrackReq(req);
    setHistory([]);
    setLoadingHistory(true);

    try {
      const res =
        await requisitionService.getRequisitionHistory(
          req.id
        );

      setHistory(
        Array.isArray(res) ? res : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setTrackReq(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const closeTrackModal = () => {
    setTrackReq(null);
    setHistory([]);
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
            Rejected Requisitions
          </h2>

          <p className="section-subtitle">
            Requisitions rejected by the manager.
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
        {requisitions.length} rejected requisition(s)
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
                    {req.requisitionNo}
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
                        req.status?.toLowerCase() ||
                        ""
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
                    ).toLocaleString(
                      "en-IN"
                    )}
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
                        className="track-btn"
                        onClick={() =>
                          handleTrack(req)
                        }
                      >
                        <Clock3 size={14} />
                        Track
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
                  No Rejected Requisitions
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
              setSelectedRequisition(
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

              <h3>
                Products
              </h3>

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

                          <tr
                            key={item.id}
                          >

                            <td>
                              {
                                item.productName
                              }
                            </td>

                            <td>
                              {
                                item.quantity
                              }
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

      {/* Track Modal */}

      {trackReq &&
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
                  Track Requisition - {" "}
                  {
                    trackReq.requisitionNo
                  }
                </h2>

                <button
                  className="modal-close"
                  onClick={
                    closeTrackModal
                  }
                >
                  ×
                </button>

              </div>

              {loadingHistory ? (

                <p className="no-data">
                  Loading history…
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
                            <b>
                              Previous:
                            </b>{" "}
                            {formatStatus(
                              item.oldStatus
                            )}
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