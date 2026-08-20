import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Eye, Power, X, AlertCircle, Star } from "lucide-react";
import toast from "react-hot-toast";
import suppliersService from "../../services/suppliersService";
import "./SupplierManagementSection.css";

export const SupplierManagementSection = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [supplierToToggle, setSupplierToToggle] = useState(null);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await suppliersService.getAllSuppliers();
      setSuppliers(data || []);
    } catch (error) {
      toast.error("Failed to load suppliers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = (supplier) => {
    setSupplierToToggle(supplier);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!supplierToToggle) return;
    const action = supplierToToggle.isActive ? 'deactivate' : 'activate';
    
    try {
      if (supplierToToggle.isActive) {
        await suppliersService.deactivateSupplier(supplierToToggle.id);
      } else {
        await suppliersService.activateSupplier(supplierToToggle.id);
      }
      toast.success(`Supplier ${action}d successfully`);
      loadData();
    } catch (error) {
      toast.error(`Failed to ${action} supplier`);
    } finally {
      setShowConfirmModal(false);
      setSupplierToToggle(null);
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const filteredSuppliers = suppliers.filter((supplier) => 
    supplier.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-state">Loading suppliers...</div>;
  }

  return (
    <div className="supplier-management-section">
      <div className="section-header">
        <h2>Supplier Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        {filteredSuppliers.length === 0 ? (
          <div className="empty-state">No suppliers found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td>
                    <span className="supplier-name">{supplier.companyName || "N/A"}</span>
                  </td>
                  <td>
                    <div className="supplier-info">
                      <span className="supplier-name">{supplier.name || "N/A"}</span>
                      <span className="supplier-email">{supplier.email || "N/A"}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge category-badge">
                      {supplier.categoryName || "Uncategorized"}
                    </span>
                  </td>
                  <td>
                    <div className="rating-badge">
                      <span>{supplier.rating?.toFixed(1) || "0.0"}</span>
                      <Star size={12} fill="currentColor" stroke="none" />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${supplier.isActive ? 'status-active' : 'status-inactive'}`}>
                      {supplier.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-view" onClick={() => handleViewDetails(supplier)} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button 
                        className={`btn-icon ${supplier.isActive ? 'btn-deactivate' : 'btn-activate'}`} 
                        onClick={() => handleToggleStatus(supplier)} 
                        title={supplier.isActive ? "Deactivate Supplier" : "Activate Supplier"}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSupplier && createPortal(
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Supplier Details</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Company Name</span>
                <span className="detail-value">{selectedSupplier.companyName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Contact Person</span>
                <span className="detail-value">{selectedSupplier.name} ({selectedSupplier.email})</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone Number</span>
                <span className="detail-value">{selectedSupplier.phone || "Not provided"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Physical Address</span>
                <span className="detail-value" style={{ whiteSpace: 'pre-line' }}>{selectedSupplier.address || "Not provided"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{selectedSupplier.categoryName || "Uncategorized"}</span>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-primary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to <strong>{supplierToToggle?.isActive ? 'deactivate' : 'activate'}</strong> the supplier account for <strong style={{ color: 'var(--color-text-primary)' }}>{supplierToToggle?.companyName}</strong>?
              {supplierToToggle?.isActive && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}><AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> This supplier will no longer be able to submit bids or access the portal.</p>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button 
                type="button" 
                className={supplierToToggle?.isActive ? "btn-primary" : "btn-primary"} 
                style={supplierToToggle?.isActive ? { backgroundColor: '#ef4444' } : { backgroundColor: '#10b981' }}
                onClick={confirmToggleStatus}
              >
                Yes, {supplierToToggle?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
