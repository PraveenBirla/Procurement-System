import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import supplierService from "../../services/suppliersService";

export const  SupplierSection = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actioning, setActioning] = useState({
  id: null,
  action: null,
});

  const [docsSupplier, setDocsSupplier] = useState(null);

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    document.body.style.overflow = docsSupplier ? "hidden" : "";

    const handleKey = (e) => {
      if (e.key === "Escape") setDocsSupplier(null);
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [docsSupplier]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getAllSuppliers();
      setSuppliers(res);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerify = async (supplier) => {
   setActioning({
  id: supplier.id,
  action: "verify",
});
    try {
      if (supplier.isVerified) {
        await supplierService.unverifySupplier(supplier.id);
      } else {
        await supplierService.verifySupplier(supplier.id);
      }
      await loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
     setActioning({
  id: null,
  action: null,
});
    }
  };

  const handleToggleActive = async (supplier) => {
   setActioning({
  id: supplier.id,
  action: "active",
});
    try {
      if (supplier.isActive) {
        await supplierService.deactivateSupplier(supplier.id);
      } else {
        await supplierService.activateSupplier(supplier.id);
      }
      await loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
     setActioning({
  id: null,
  action: null,
});
    }
  };

  const handleViewDocument = (doc) => {
    if (!doc?.fileUrl) return;
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const closeDocsModal = () => setDocsSupplier(null);

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Suppliers</h2>
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
              <th>Company</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Verified</th>
              <th>Active</th>
              <th>Documents</th>
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
            ) : suppliers.length > 0 ? (
              suppliers.map((supplier) => {
                const isVerifying =
  actioning.id === supplier.id && actioning.action === "verify";

const isActivating =
  actioning.id === supplier.id && actioning.action === "active";
                return (
                  <tr key={supplier.id}>
                    <td data-label="Company">
                      <div>{supplier.companyName}</div>
                      <div style={{ fontSize: "0.85em", opacity: 0.7 }}>{supplier.name}</div>
                    </td>
                    <td data-label="Contact">
                      <div>{supplier.email}</div>
                      <div style={{ fontSize: "0.85em", opacity: 0.7 }}>{supplier.phone}</div>
                    </td>
                    <td data-label="Category">{supplier.categoryName || "-"}</td>
                    <td data-label="Rating">{supplier.rating ?? "-"}</td>
                    <td data-label="Verified">
                      <span className={`status-badge ${supplier.isVerified ? "approved" : "rejected"}`}>
                        {supplier.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td data-label="Active">
                      <span className={`status-badge ${supplier.isActive ? "approved" : "rejected"}`}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td data-label="Documents">
                      <button className="view-btn" onClick={() => setDocsSupplier(supplier)}>
                        View ({supplier.supplierDocumentList?.length || 0})
                      </button>
                    </td>
                    <td data-label="Action">
                      <div className="action-group">
                        <button
                          className={supplier.isVerified ? "reject-btn" : "approve-btn"}
                          onClick={() => handleToggleVerify(supplier)}
                         disabled={isVerifying}
                        >
                          {isVerifying
  ? "..."
  : supplier.isVerified
  ? "Mark Unverified"
  : "Mark Verified"}
                        </button>
                        <button
                          className={supplier.isActive ? "reject-btn" : "approve-btn"}
                          onClick={() => handleToggleActive(supplier)}
                          disabled={isActivating}
                        >
                         {isActivating
  ? "..."
  : supplier.isActive
  ? "Deactivate"
  : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No Suppliers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Documents Modal */}
      {docsSupplier &&
        createPortal(
          <div className="modal-overlay" onClick={closeDocsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Documents — {docsSupplier.companyName}</h2>
                <button className="modal-close" onClick={closeDocsModal} aria-label="Close">
                  ×
                </button>
              </div>

              {docsSupplier.supplierDocumentList && docsSupplier.supplierDocumentList.length > 0 ? (
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Document Type</th>
                        <th>File Name</th>
                        <th>Uploaded At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docsSupplier.supplierDocumentList.map((doc) => (
                        <tr key={doc.id}>
                          <td data-label="Document Type">{doc.documentType.replaceAll("_", " ")}</td>
                          <td data-label="File Name">{doc.fileName}</td>
                          <td data-label="Uploaded At">
                            {new Date(doc.uploadedAt).toLocaleString()}
                          </td>
                          <td data-label="Action">
                            <button className="view-btn" onClick={() => handleViewDocument(doc)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No documents uploaded.</p>
              )}

              <div className="modal-actions">
                <button className="close-btn" onClick={closeDocsModal}>
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