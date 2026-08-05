import { useEffect, useRef, useState } from "react";
import supplierService from "../../services/suppliersService";
import productService from "../../services/productService";

const emptyForm = {
  companyName: "",
  phone: "",
  address: "",
  categoryId: "",
};

const DOCUMENT_TYPES = [
  { type: "GST_CERTIFICATE", label: "GST Certificate" },
  { type: "PAN_CARD", label: "PAN Card" },
  { type: "BUSINESS_REGISTRATION", label: "Business Registration" },
  { type: "BANK_PROOF", label: "Bank Proof" },
  { type: "OTHER", label: "Other" },
];

export const SupplierProfileSection = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState([]);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Documents
  const [documents, setDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [uploadingType, setUploadingType] = useState(null);
  const fileInputRefs = useRef({});

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  useEffect(() => {
    loadProfile();
    loadCategories();
    loadDocuments();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await supplierService.getProfile();
      setProfile(res);
      setNotFound(false);
      setError("");
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
        setProfile(null);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await productService.getCategories();
      setCategories(res);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const loadDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const res = await supplierService.getAllDocumments();
      setDocuments(res);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingDocuments(false);
    }
  };

  const getDocumentFor = (type) => documents.find((d) => d.documentType === type) || null;

  const triggerFileSelect = (type) => {
    fileInputRefs.current[type]?.click();
  };

  const handleFileSelected = async (type, e) => {
  const file = e.target.files?.[0];
  e.target.value = "";

  if (!file) return;

  setUploadingType(type);
  setError("");

  try {
    const existingDoc = getDocumentFor(type);

    if (existingDoc) {
      
      await supplierService.updateDocument(existingDoc.id, file);
    } else {
       
      await supplierService.uploadDocument(type, file);
    }

    await loadDocuments();
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setUploadingType(null);
  }
};

  const handleViewDocument = (doc) => {
    if (!doc?.fileUrl) return;
    window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
  };

  // ─── Profile handlers ───
  const openCreateForm = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditing(true);
  };

  const openEditForm = () => {
    setForm({
      companyName: profile.companyName || "",
      phone: profile.phone || "",
      address: profile.address || "",
      categoryId: profile.categoryId || "",
    });
    setFormErrors({});
    setEditing(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setEditing(false);
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errs = {};
    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (!form.categoryId) errs.categoryId = "Category is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      companyName: form.companyName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      categoryId: Number(form.categoryId),
    };

    setSubmitting(true);
    try {
      if (notFound) {
        await supplierService.createProfile(payload);
      } else {
        await supplierService.updateProfile(payload);
      }
      setEditing(false);
      await loadProfile();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-requisition-section">
        <p className="no-data">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="admin-requisition-section">
      <div className="section-header">
        <h2 className="section-title">Supplier Profile</h2>
        {!notFound && !editing && (
          <button className="btn-primary" onClick={openEditForm}>
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="error-box">
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {/* No profile yet */}
      {notFound && !editing && (
        <div className="no-data">
          <p>You haven't created a supplier profile yet.</p>
          <button className="btn-primary" onClick={openCreateForm}>
            + Create Profile
          </button>
        </div>
      )}

      {/* View mode */}
      {!notFound && !editing && profile && (
        <div className="profile-view">
          <p><strong>Company Name:</strong> {profile.companyName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone || "-"}</p>
          <p><strong>Address:</strong> {profile.address || "-"}</p>
          <p><strong>Category:</strong> {profile.categoryName}</p>
          <p><strong>Rating:</strong> {profile.rating ?? "-"}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span className={`status-badge ${profile.isActive ? "approved" : "rejected"}`}>
              {profile.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
      )}

      {/* Create / Edit form */}
      {editing && (
        <form onSubmit={handleSubmit} noValidate className="profile-form">
          <div className="field">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              placeholder="e.g. Acme Supplies Pvt Ltd"
              value={form.companyName}
              onChange={handleFieldChange}
              className={formErrors.companyName ? "input-error" : ""}
            />
            {formErrors.companyName && <span className="field-error">{formErrors.companyName}</span>}
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field">
            <label>Address</label>
            <textarea
              name="address"
              placeholder="Company address"
              value={form.address}
              onChange={handleFieldChange}
              rows={2}
            />
          </div>

          <div className="field">
            <label>Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleFieldChange}
              className={formErrors.categoryId ? "input-error" : ""}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            {formErrors.categoryId && <span className="field-error">{formErrors.categoryId}</span>}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : notFound ? "Create Profile" : "Save Changes"}
            </button>
            <button type="button" className="btn-secondary" onClick={closeForm} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Documents */}
      {!notFound && (
        <div className="documents-section" style={{ marginTop: "2rem" }}>
          <h3>Documents</h3>

          {loadingDocuments ? (
            <p className="no-data">Loading documents…</p>
          ) : (
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
                  {DOCUMENT_TYPES.map(({ type, label }) => {
                    const doc = getDocumentFor(type);
                    const isUploading = uploadingType === type;

                    return (
                      <tr key={type}>
                        <td data-label="Document Type">{label}</td>
                        <td data-label="File Name">{doc?.fileName || "-"}</td>
                        <td data-label="Uploaded At">
                          {doc?.uploadedAt ? new Date(doc.uploadedAt).toLocaleString() : "-"}
                        </td>
                        <td data-label="Action">
                          <div className="action-group">
                            {doc ? (
                              <>
                                <button className="view-btn" onClick={() => handleViewDocument(doc)}>
                                  View
                                </button>
                                <button
                                  className="btn-secondary"
                                  onClick={() => triggerFileSelect(type)}
                                  disabled={isUploading}
                                >
                                  {isUploading ? "Uploading…" : "Replace"}
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn-primary"
                                onClick={() => triggerFileSelect(type)}
                                disabled={isUploading}
                              >
                                {isUploading ? "Uploading…" : "Upload"}
                              </button>
                            )}

                            <input
                              type="file"
                              ref={(el) => (fileInputRefs.current[type] = el)}
                              style={{ display: "none" }}
                              onChange={(e) => handleFileSelected(type, e)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};