import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Power,
  X,
  AlertCircle,
  RefreshCw,
  Users,
  Filter,
} from "lucide-react";
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
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);
  const [processingUser, setProcessingUser] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [usersData, deptsData] = await Promise.all([
        userService.getUsersExceptAdmin(),
        api.get("/depts").then((res) => res.data?.data),
      ]);

      setUsers(usersData || []);
      setDepartments(deptsData || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users data");
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const handleToggleStatus = (user) => {
    setUserToToggle(user);
    setShowConfirmModal(true);
  };

  // Activate / Deactivate user
  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    const action = userToToggle.isActive ? "deactivate" : "activate";

    try {
      setProcessingUser(true);

      const payload = {
        ...userToToggle,
        department: departments.find(
          (d) => d.id === userToToggle.department?.id
        ),
        isActive: !userToToggle.isActive,
      };

      await userService.updateUser(userToToggle.id, payload);

      toast.success(`User ${action}d successfully`);

      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setProcessingUser(false);
      setShowConfirmModal(false);
      setUserToToggle(null);
    }
  };

  // Filtering
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search);

    const matchesRole =
      roleFilter === "ALL" || user.role === roleFilter;

    const matchesDepartment =
      departmentFilter === "ALL" ||
      user.department?.id?.toString() === departmentFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && user.isActive) ||
      (statusFilter === "INACTIVE" && !user.isActive);

    return (
      matchesSearch &&
      matchesRole &&
      matchesDepartment &&
      matchesStatus
    );
  });

  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.filter((user) => !user.isActive).length;

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setDepartmentFilter("ALL");
    setStatusFilter("ALL");
  };

  if (loading) {
    return (
      <div className="loading-state">
        <RefreshCw size={20} className="loading-spinner" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="user-management-section">

      {/* Header */}
      <div className="section-header">
        <div>
          <h2>User Management</h2>
          <p>View and manage user account access</p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadData}
          title="Refresh users"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="user-stats">

        <div className="user-stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>

          <div>
            <span className="stat-label">Total Users</span>
            <strong>{users.length}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon active-icon">
            <Power size={20} />
          </div>

          <div>
            <span className="stat-label">Active</span>
            <strong>{activeUsers}</strong>
          </div>
        </div>

        <div className="user-stat-card">
          <div className="stat-icon inactive-icon">
            <Power size={20} />
          </div>

          <div>
            <span className="stat-label">Inactive</span>
            <strong>{inactiveUsers}</strong>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="filters-container">

        <div className="search-box">
          <Search className="search-icon" size={18} />

          <input
            type="text"
            placeholder="Search by name or email..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-group">
          <Filter size={16} />

          {/* Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Roles</option>

            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {/* Department */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Departments</option>

            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.departmentName}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {(searchTerm ||
            roleFilter !== "ALL" ||
            departmentFilter !== "ALL" ||
            statusFilter !== "ALL") && (
            <button
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="results-info">
        Showing <strong>{filteredUsers.length}</strong> of{" "}
        <strong>{users.length}</strong> users
      </div>

      {/* Table */}
      <div className="table-container">

        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <Users size={35} />
            <h3>No users found</h3>
            <p>Try changing your search or filters.</p>

            <button
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
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

                  {/* User */}
                  <td>
                    <div className="user-info">

                      <div className="user-avatar">
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <span className="user-name">
                          {user.fullName}
                        </span>

                        <span className="user-email">
                          {user.email}
                        </span>
                      </div>

                    </div>
                  </td>

                  {/* Role */}
                  <td>
                    <span
                      className={`badge ${
                        ROLE_COLORS[user.role] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td>
                    <span className="department-text">
                      {user.department?.departmentName || "Not Assigned"}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`badge ${
                        user.isActive
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      <span
                        className={`status-dot ${
                          user.isActive
                            ? "dot-active"
                            : "dot-inactive"
                        }`}
                      />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <button
                      className={`status-action-btn ${
                        user.isActive
                          ? "deactivate-btn"
                          : "activate-btn"
                      }`}
                      onClick={() => handleToggleStatus(user)}
                      title={
                        user.isActive
                          ? "Deactivate User"
                          : "Activate User"
                      }
                    >
                      <Power size={15} />

                      {user.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal &&
        createPortal(
          <div
            className="modal-overlay"
            onClick={() => {
              if (!processingUser) {
                setShowConfirmModal(false);
              }
            }}
          >
            <div
              className="modal-content confirmation-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="modal-header">

                <div>
                  <h3>
                    {userToToggle?.isActive
                      ? "Deactivate User"
                      : "Activate User"}
                  </h3>
                </div>

                <button
                  className="close-btn"
                  disabled={processingUser}
                  onClick={() => setShowConfirmModal(false)}
                >
                  <X size={20} />
                </button>

              </div>

              <div className="confirmation-body">

                <div className="confirmation-icon">
                  <AlertCircle size={28} />
                </div>

                <p>
                  Are you sure you want to{" "}
                  <strong>
                    {userToToggle?.isActive
                      ? "deactivate"
                      : "activate"}
                  </strong>{" "}
                  the account for{" "}
                  <strong>
                    {userToToggle?.fullName}
                  </strong>
                  ?
                </p>

                {userToToggle?.isActive && (
                  <div className="warning-message">
                    <AlertCircle size={15} />

                    <span>
                      The user will immediately lose
                      access to the system.
                    </span>
                  </div>
                )}

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="btn-secondary"
                  disabled={processingUser}
                  onClick={() =>
                    setShowConfirmModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    userToToggle?.isActive
                      ? "btn-danger"
                      : "btn-success"
                  }
                  disabled={processingUser}
                  onClick={confirmToggleStatus}
                >
                  {processingUser
                    ? "Processing..."
                    : userToToggle?.isActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
                </button>

              </div>

            </div>
          </div>,
          document.body
        )}

    </div>
  );
};