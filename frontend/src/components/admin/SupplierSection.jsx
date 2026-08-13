import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import supplierService from "../../services/suppliersService";

export const SupplierSection = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actioning, setActioning] = useState({
    id: null,
    action: null,
  });

  const [docsSupplier, setDocsSupplier] = useState(null);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [remarks, setRemarks] = useState("");

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
      if (e.key === "Escape") {
        closeDocsModal();
      }
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
      setSuppliers(Array.isArray(res) ? res: []);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
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


  const openDocuments = (supplier) => {
    setDocsSupplier(supplier);
    setRejectingDoc(null);
    setRemarks("");
    setError("");
  };

  const closeDocsModal = () => {
    setDocsSupplier(null);
    setRejectingDoc(null);
    setRemarks("");

    setTimeout(() => {
      loadSuppliers();
    }, 100);
  };

  const handleViewDocument = (doc) => {
    if (!doc?.fileUrl) {
      setError("Document URL is not available.");
      return;
    }

    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleVerifyDocument = async (doc) => {
    setActioning({
      id: doc.id,
      action: "process-document",
    });

    try {
      await supplierService.verifySupplierDocument(
        doc.id,
        "VERIFIED",
        "Document verified successfully"
      );

      const updatedSuppliers = await supplierService.getAllSuppliers();

      // console.log("After verification - Updated suppliers:", updatedSuppliers);

      setSuppliers(updatedSuppliers || []);

      const updatedSupplier = updatedSuppliers.find(
        (supplier) => supplier.id === docsSupplier?.id
      );

      if (updatedSupplier) {
        // console.log("Modal supplier status after verify:", updatedSupplier.status);
        setDocsSupplier(updatedSupplier);
      }

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioning({
        id: null,
        action: null,
      });
    }
  };


  const startRejectDocument = (doc) => {
    setRejectingDoc(doc);
    setRemarks("");
    setError("");
  };

  const cancelRejectDocument = () => {
    setRejectingDoc(null);
    setRemarks("");
  };

  const handleRejectDocument = async () => {
    if (!rejectingDoc) {
      return;
    }

    if (!remarks.trim()) {
      setError("Please provide remarks before rejecting the document.");
      return;
    }

    setActioning({
      id: rejectingDoc.id,
      action: "process-document",
    });

    try {
      await supplierService.verifySupplierDocument(
        rejectingDoc.id,
        "REJECTED",
        remarks.trim()
      );

      const updatedSuppliers = await supplierService.getAllSuppliers();

      // console.log("After rejection - Updated suppliers:", updatedSuppliers);

      setSuppliers(updatedSuppliers || []);

      const updatedSupplier = updatedSuppliers.find(
        (supplier) => supplier.id === docsSupplier?.id
      );

      if (updatedSupplier) {

        // console.log("Modal supplier status after reject:", updatedSupplier.status);
        setDocsSupplier(updatedSupplier);
      }

      setRejectingDoc(null);
      setRemarks("");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActioning({
        id: null,
        action: null,
      });
    }
  };

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
              <th>Verification Status</th>
              <th>Active</th>
              {/* <th>Documents</th> */}
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
                const isActivating = actioning.id === supplier.id && actioning.action === "active";
                
                const supplierStatus = supplier.status || supplier.verificationStatus;

                return (
                  <tr key={supplier.id}>
                    <td data-label="Company">
                      <div>
                        <strong>{supplier.companyName}</strong>
                      </div>

                      <div style={{fontSize: "0.85em", opacity: 0.7,}}>
                        {supplier.name}
                      </div>
                    </td>


                    <td data-label="Contact">
                      <div>{supplier.email}</div>

                      <div style={{fontSize: "0.85em", opacity: 0.7,}}>
                        {supplier.phone}
                      </div>
                    </td>


                    <td data-label="Category">
                      {supplier.categoryName || "-"}
                    </td>


                    <td data-label="Rating">
                      {supplier.rating ?? "-"}
                    </td>


                    <td data-label="Verification Status">
                      <span className={`status-badge ${
                          supplierStatus === "VERIFIED"?
                             "approved": supplierStatus === "REJECTED"? "rejected": "pending"
                        }`}
                      >
                        {supplierStatus || "PENDING"}
                      </span>
                    </td>


                    <td data-label="Active">
                      <span className={`status-badge 
                      ${supplier.isActive ? "approved" : "rejected"}`}>
                        {supplier.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* DOCUMENTS */}

                    {/* <td data-label="Documents">
                      <button
                        className="view-btn"
                        onClick={() => openDocuments(supplier)}
                      >
                        View (
                        {supplier.supplierDocumentList?.length || 0})
                      </button>
                    </td> */}

                    <td data-label="Action">
                      <div className="action-group">

                        <button className="approve-btn" onClick={() => openDocuments(supplier)}>
                          View and Verify ({supplier.supplierDocumentList?.length || 0})
                        </button>

                        <button className={supplier.isActive? "reject-btn": "approve-btn"}
                          onClick={() => handleToggleActive(supplier)}
                          disabled={isActivating}
                        >
                          {isActivating? "...": supplier.isActive? "Deactivate": "Activate"}
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

      {docsSupplier &&
        createPortal(
          <div className="modal-overlay" onClick={closeDocsModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

              <div className="modal-header">
                <div>
                  <h2>Verify Supplier Documents</h2>

                  <p>{docsSupplier.companyName}</p>

                  <span
                    className={`status-badge ${
                      docsSupplier.status === "VERIFIED"? "approved": docsSupplier.status === "REJECTED"? "rejected": "pending"
                    }`}
                  >
                    Supplier Status: {docsSupplier.status || "PENDING"}
                  </span>
                </div>

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
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {docsSupplier.supplierDocumentList.map((doc) => {
                        const processing = actioning.id === doc.id && actioning.action === "process-document";

                        return (
                          <tr key={doc.id}>

                            <td data-label="Document Type">
                              {doc.documentType?.replaceAll("_", " ")}
                            </td>

                            <td data-label="File Name">
                              {doc.fileName || "-"}
                            </td>

                            <td data-label="Uploaded At">
                              {doc.uploadedAt? new Date(doc.uploadedAt).toLocaleString(): "-"}
                            </td>

                            <td data-label="Status">
                              <span
                                className={`status-badge ${
                                  doc.status === "VERIFIED"? "approved": doc.status ===
                                      "REJECTED"? "rejected": "pending"
                                }`}
                              >
                                {doc.status || "PENDING"}
                              </span>
                            </td>

                            <td data-label="Remarks">
                              {doc.remarks || "-"}
                            </td>

                            <td data-label="Action">
                              <div className="action-group">

                                <button className="view-btn" onClick={() => handleViewDocument(doc)}>
                                  View
                                </button>

                                <button className="approve-btn" disabled={processing ||
                                  doc.verificationStatus ===
                                      "VERIFIED"
                                  }
                                  onClick={() => handleVerifyDocument(doc)}
                                >
                                  {processing? "..." : doc.verificationStatus === "VERIFIED"? "Verified": "Verify"}
                                </button>

                                <button className="reject-btn" disabled={processing ||
                                    doc.verificationStatus === "REJECTED"
                                  }
                                  onClick={() =>startRejectDocument(doc)}
                                >
                                  {doc.verificationStatus === "REJECTED"? "Rejected": "Reject"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No documents uploaded.</p>
              )}


              {rejectingDoc && (
                <div className="remarks-box">
                  <h3>Reject Document</h3>

                  <p>
                    Please provide a reason for rejecting:
                    <strong> {rejectingDoc.fileName}</strong>
                  </p>

                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter rejection remarks..."
                    rows="4"
                  />

                  <div className="modal-actions">
                    <button className="close-btn" onClick={cancelRejectDocument}>
                      Cancel
                    </button>

                    <button
                      className="reject-btn"
                      disabled={
                        !remarks.trim() ||
                        actioning.action === "process-document"
                      }
                      onClick={handleRejectDocument}
                    >
                      {actioning.action === "process-document"? "Rejecting..." : "Reject Document"}
                    </button>
                  </div>
                </div>
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
