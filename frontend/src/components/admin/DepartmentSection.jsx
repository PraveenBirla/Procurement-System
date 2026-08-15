import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import productService from "../../services/productService";
import "./DepartmentSection.css";

export const DepartmentSection = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

 

  const loadDepartments = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await productService.getDepartments();

      setDepartments(
        Array.isArray(response) ? response : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  /* ============================
     OPEN MODAL
  ============================ */

  const openModal = () => {
    setDepartmentName("");
    setFormError("");
    setShowModal(true);
  };

 

  const closeModal = () => {
    if (adding) return;

    setShowModal(false);
    setDepartmentName("");
    setFormError("");
  };

   

  const handleAddDepartment = async (e) => {
    e.preventDefault();

    const name = departmentName.trim();

    if (!name) {
      setFormError("Department name is required");
      return;
    }

    const duplicate = departments.some(
      (department) =>
        department.departmentName?.trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (duplicate) {
      setFormError("Department already exists");
      return;
    }

    setAdding(true);
    setFormError("");
    setError("");
    setSuccess("");

    try {
      await  productService.addDepartments({
        departmentName: name,
      });

      setShowModal(false);
      setDepartmentName("");

      setSuccess(
        `${name} department added successfully`
      );

      await loadDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  /* ============================
     ESCAPE
  ============================ */

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [adding]);

  return (
    <div className="department-section">

      {/* HEADER */}

      <div className="department-header">

        <div>
          <h2>Departments</h2>

          <p>
            View and add departments for the
            procurement system.
          </p>
        </div>

        <div className="department-actions">

          <button
            className="department-refresh"
            onClick={loadDepartments}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "department-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <button
            className="department-add"
            onClick={openModal}
          >
            <Plus size={17} />
            Add Department
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="department-alert error">

          <span>{error}</span>

          <button
            onClick={() => setError("")}
          >
            ×
          </button>

        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="department-alert success">

          <span>{success}</span>

          <button
            onClick={() => setSuccess("")}
          >
            ×
          </button>

        </div>
      )}

      {/* SUMMARY */}

      <div className="department-summary">

        <div className="department-summary-icon">
          <Building2 size={23} />
        </div>

        <div>
          <span>Total Departments</span>

          <strong>
            {departments.length}
          </strong>
        </div>

      </div>

      {/* TABLE */}

      <div className="department-card">

        <div className="department-card-header">
          <div>
            <h3>All Departments</h3>

            <p>
              Departments currently available
              in the system.
            </p>
          </div>
        </div>

        <div className="department-table-wrapper">

          <table className="department-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Department Name</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="3"
                    className="department-no-data"
                  >
                    Loading departments...
                  </td>
                </tr>

              ) : departments.length > 0 ? (

                departments.map(
                  (department, index) => (

                    <tr key={department.id}>

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <div className="department-name">

                          <span className="department-row-icon">
                            <Building2
                              size={15}
                            />
                          </span>

                          <span>
                            {
                              department.departmentName
                            }
                          </span>

                        </div>
                      </td>

                      <td>
                        {department.createdAt
                          ? new Date(
                              department.createdAt
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>
                  <td
                    colSpan="3"
                    className="department-no-data"
                  >
                    No departments found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* ADD MODAL */}

      {showModal && (
        <div
          className="department-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="department-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="department-modal-header">

              <div>
                <h2>Add Department</h2>

                <p>
                  Add a new department to the
                  system.
                </p>
              </div>

              <button
                className="department-close"
                onClick={closeModal}
                disabled={adding}
              >
                <X size={19} />
              </button>

            </div>

            <form
              onSubmit={handleAddDepartment}
            >

              <div className="department-field">

                <label>
                  Department Name
                </label>

                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => {
                    setDepartmentName(
                      e.target.value
                    );

                    if (formError) {
                      setFormError("");
                    }
                  }}
                  placeholder="Enter department name"
                  autoFocus
                  disabled={adding}
                />

                {formError && (
                  <span className="department-field-error">
                    {formError}
                  </span>
                )}

              </div>

              <div className="department-modal-actions">

                <button
                  type="button"
                  className="department-cancel"
                  onClick={closeModal}
                  disabled={adding}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="department-save"
                  disabled={adding}
                >
                  {adding
                    ? "Adding..."
                    : "Add Department"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};