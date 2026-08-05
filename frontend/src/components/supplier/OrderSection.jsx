import { useEffect, useState } from "react";
import suppliersService from "../../services/suppliersService";
import purchaseOrderService from "../../services/purchaseOrderService";

export const OrderSection = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [actioning, setActioning] = useState({
  id: null,
  type: null,
});
  const [actionedIds, setActionedIds] = useState({}); // poId -> "accepted" | "rejected"

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

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await  suppliersService.getSuppliersOrder();
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

  const handleAccept = async (po) => {
    setActioning({
  id: po.id,
  type: "accept",
});
    try {
      // TODO: replace with actual accept endpoint when available
      await   purchaseOrderService.updateStatus(po.id, {
  status: "PO_RECEIVED",
});
      setActionedIds((prev) => ({ ...prev, [po.id]: "accepted" }));
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
    setActioning({
  id: null,
  type: null,
});
    }
  };

  const handleReject = async (po) => {
   setActioning({
  id: po.id,
  type: "reject",
});
    try {
      // TODO: replace with actual reject endpoint when available
      await   purchaseOrderService.updateStatus(po.id, {
  status: "CANCELLED",
});
      setActionedIds((prev) => ({ ...prev, [po.id]: "rejected" }));
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
    setActioning({
  id: null,
  type: null,
});
    }
  };

  const isActionable = (po) => {
    if (actionedIds[po.id]) return false;
    return po.status === "SENT_TO_SUPPLIER" || po.status === "PENDING_SUPPLIER_ACTION";
  };

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Purchase Orders</h2>
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
              orders.map((po) => {
                const actionable = isActionable(po);
                return (
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

                        {actionable && (
                          <>
                            <button
  className="approve-btn"
  onClick={() => handleAccept(po)}
  disabled={actioning.id === po.id}
>
  {actioning.id === po.id && actioning.type === "accept"
    ? "..."
    : "Accept"}
</button>
                            <button
  className="reject-btn"
  onClick={() => handleReject(po)}
  disabled={actioning.id === po.id}
>
  {actioning.id === po.id && actioning.type === "reject"
    ? "..."
    : "Reject"}
</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
};