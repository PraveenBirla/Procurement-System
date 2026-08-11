import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Edit, Power, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import userService from "../../services/userService";
import api from "../../services/api";
import { ROLES, ROLE_COLORS } from "../../constants/roles";
import "./UserManagementSection.css";

export const UserManagementSection = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);

  // Confirm Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        userService.getUsersExceptAdmin(),
        api.get('/depts').then(res => res.data?.data)
      ]);
      setUsers(usersData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      toast.error("Failed to load users data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser({ ...user, departmentId: user.department?.id || "" });
    setShowEditModal(true);
  };

  const handleToggleStatus = (user) => {
    setUserToToggle(user);
    setShowConfirmModal(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    const action = userToToggle.isActive ? 'deactivate' : 'activate';
    
    try {
      const payload = {
        ...userToToggle,
        department: departments.find(d => d.id === userToToggle.department?.id),
        isActive: !userToToggle.isActive
      };
      await userService.updateUser(userToToggle.id, payload);
      toast.success(`User ${action}d successfully`);
      loadData();
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    } finally {
      setShowConfirmModal(false);
      setUserToToggle(null);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      // Find the selected department object
      const selectedDept = departments.find(d => d.id === parseInt(editingUser.departmentId));
      
      const payload = {
        ...editingUser,
        department: selectedDept
      };
      
      await userService.updateUser(editingUser.id, payload);
      toast.success("User updated successfully");
      setShowEditModal(false);
      loadData();
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = users.filter((user) => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div className="user-management-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{user.fullName}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department?.departmentName || "-"}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon btn-edit" onClick={() => handleEditClick(user)} title="Edit Role/Status">
                        <Edit size={16} />
                      </button>
                      <button 
                        className={`btn-icon ${user.isActive ? 'btn-deactivate' : 'btn-activate'}`} 
                        onClick={() => handleToggleStatus(user)} 
                        title={user.isActive ? "Deactivate User" : "Activate User"}
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

      {/* Edit User Modal */}
      {showEditModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={editingUser.fullName}
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={editingUser.email}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  className="form-select"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  required
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select 
                  className="form-select"
                  value={editingUser.departmentId}
                  onChange={(e) => setEditingUser({...editingUser, departmentId: e.target.value})}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Account Status</label>
                <select 
                  className="form-select"
                  value={editingUser.isActive}
                  onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingUser}>
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '2rem', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to <strong>{userToToggle?.isActive ? 'deactivate' : 'activate'}</strong> the account for <strong style={{ color: '#0f172a' }}>{userToToggle?.fullName}</strong>?
              {userToToggle?.isActive && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ef4444' }}><AlertCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}/> The user will immediately lose access to the system.</p>}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button 
                type="button" 
                className={userToToggle?.isActive ? "btn-primary" : "btn-primary"} 
                style={userToToggle?.isActive ? { backgroundColor: '#ef4444' } : { backgroundColor: '#10b981' }}
                onClick={confirmToggleStatus}
              >
                Yes, {userToToggle?.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
