 
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { NotificationBell } from "../ui/NotificationBell";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import requisitionService from "../../services/requisitionService";
import productService from "../../services/productService";
import "./RequisitionSection.css";
import { Clock3, Eye } from "lucide-react";

const emptyItem = {
  productId: "",
  quantity: 1,
  unitPrice: "",
};

const ALL_STATUSES = [
  "PENDING_MANAGER",
  "MANAGER_REJECTED",
  "PENDING_FINANCE",
  "FINANCE_REJECTED",
  "PENDING_ADMIN",
  "PENDING_PROCUREMENT",
  "PROCUREMENT_REJECTED",
  "ADMIN_REJECTED",
  "APPROVED",
  "PO_GENERATED",
  "CANCELLED",
  "SENT_TO_SUPPLIER",
  "COMPLETED"
];

const STATUS_COLORS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#dc2626",
  "#8b5cf6",
  "#06b6d4",
  "#b91c1c",
  "#991b1b",
  "#22c55e",
  "#3b82f6",
  "var(--color-text-muted)",
  "#14b8a6",
];

export const RequisitionSection = ({ setActiveSection: setDashboardSection }) => {
  const [requisitions, setRequisitions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedRequisition, setSelectedRequisition] =
    useState(null);

  const [showTrackModal, setShowTrackModal] =
    useState(false);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [trackingId, setTrackingId] = useState(null);
  const [trackedReq, setTrackedReq] = useState(null);

  // Create requisition modal
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] = useState(false);

  const [reqForm, setReqForm] = useState({
    title: "",
    description: "",
    priority: "NORMAL",
    categoryId: "",
    items: [{ ...emptyItem }],
  });

  const [formErrors, setFormErrors] = useState({});

  // Dashboard filters
  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [showDuplicatesOnly, setShowDuplicatesOnly] =
    useState(false);

  /* =====================================================
     ERROR MESSAGE
  ===================================================== */

  const getErrorMessage = (err) => {
    return (
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong"
    );
  };

  /* =====================================================
     LOAD DATA
  ===================================================== */

  useEffect(() => {
    loadRequisitions();
    loadCategories();
  }, []);

  /* =====================================================
     BODY SCROLL / ESCAPE
  ===================================================== */

  useEffect(() => {
    const anyOpen =
      !!selectedRequisition ||
      showTrackModal ||
      showCreateModal;

    document.body.style.overflow = anyOpen ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedRequisition(null);
        closeTrackModal();
        closeCreateModal();
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
    showTrackModal,
    showCreateModal,
  ]);

  const loadRequisitions = async () => {
    setLoading(true);

    try {
      const res =
        await requisitionService.getEmployeeRequisitions();

      const data = Array.isArray(res) ? [...res] : [];

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

  const loadCategories = async () => {
    try {
      const res =
        await productService.getCategories();

      setCategories(
        Array.isArray(res) ? res : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  /* =====================================================
     VIEW / TRACK
  ===================================================== */

  const handleView = (req) => {
    setSelectedRequisition(req);
  };

  const handleTrack = async (req) => {
    setTrackingId(req.id);
    setTrackedReq(req);
    setShowTrackModal(true);
    setLoadingHistory(true);
    setHistory([]);

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
      setShowTrackModal(false);
    } finally {
      setLoadingHistory(false);
      setTrackingId(null);
    }
  };

  const closeTrackModal = () => {
    setShowTrackModal(false);
    setHistory([]);
    setTrackedReq(null);
  };

  /* =====================================================
     CREATE REQUISITION
  ===================================================== */

  const openCreateModal = () => {
    setReqForm({
      title: "",
      description: "",
      priority: "NORMAL",
      categoryId: "",
      items: [{ ...emptyItem }],
    });

    setProducts([]);
    setFormErrors({});
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (creating) return;

    setShowCreateModal(false);
  };

  const handleReqFieldChange = (e) => {
    const { name, value } = e.target;

    setReqForm({
      ...reqForm,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setReqForm({
      ...reqForm,
      categoryId,
      items: [{ ...emptyItem }],
    });

    setProducts([]);

    if (formErrors.categoryId) {
      setFormErrors({
        ...formErrors,
        categoryId: "",
      });
    }

    if (!categoryId) return;

    setLoadingProducts(true);

    try {
      const res =
        await productService.getProductsBycategories(
          categoryId
        );

      setProducts(
        Array.isArray(res) ? res : []
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const items = [...reqForm.items];

    items[index] = {
      ...items[index],
      [field]: value,
    };

    // Auto-fill unit price
    if (field === "productId") {
      const product = products.find(
        (p) =>
          String(p.id) === String(value)
      );

      if (
        product &&
        !items[index].unitPrice
      ) {
        items[index].unitPrice =
          product.standardPrice ?? "";
      }
    }

    setReqForm({
      ...reqForm,
      items,
    });

    const itemErrKey = `item_${index}`;

    if (formErrors[itemErrKey]) {
      const newErrs = {
        ...formErrors,
      };

      delete newErrs[itemErrKey];

      setFormErrors(newErrs);
    }
  };

  const addItemRow = () => {
    if (!reqForm.categoryId) return;

    if (reqForm.items.length >= products.length) return;

    setReqForm({
      ...reqForm,
      items: [
        ...reqForm.items,
        { ...emptyItem },
      ],
    });
  };

  const removeItemRow = (index) => {
    if (reqForm.items.length === 1) {
      return;
    }

    const items = reqForm.items.filter(
      (_, i) => i !== index
    );

    setReqForm({
      ...reqForm,
      items,
    });
  };

  const validateReqForm = () => {
    const errs = {};

    if (!reqForm.title.trim()) {
      errs.title = "Title is required";
    }

    if (!reqForm.categoryId) {
      errs.categoryId =
        "Category is required";
    }

    reqForm.items.forEach(
      (item, index) => {
        if (
          !item.productId ||
          !item.quantity ||
          Number(item.quantity) <= 0 ||
          !item.unitPrice ||
          Number(item.unitPrice) <= 0
        ) {
          errs[`item_${index}`] =
            "Select product and enter valid quantity/price";
        }
      }
    );

    setFormErrors(errs);

    return Object.keys(errs).length === 0;
  };

  const estimatedTotal =
    reqForm.items.reduce(
      (sum, item) => {
        const qty =
          Number(item.quantity) || 0;

        const price =
          Number(item.unitPrice) || 0;

        return sum + qty * price;
      },
      0
    );

  const handleCreateRequisition = async (
    e
  ) => {
    e.preventDefault();

    if (!validateReqForm()) {
      return;
    }

    const payload = {
      title: reqForm.title.trim(),

      description:
        reqForm.description.trim(),

      categoryId:
        Number(reqForm.categoryId),

      priority: reqForm.priority,

      items: reqForm.items.map(
        (item) => ({
          productId:
            Number(item.productId),

          quantity:
            Number(item.quantity),

          unitPrice:
            Number(item.unitPrice),
        })
      ),
    };

    setCreating(true);

    try {
      await requisitionService.createRequisition(
        payload
      );

      setShowCreateModal(false);

      await loadRequisitions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  /* =====================================================
     FILTERED REQUISITIONS
  ===================================================== */

  const filteredRequisitions = useMemo(() => {
    return requisitions.filter((req) => {
      if (
        selectedStatus === "DUPLICATE"
      ) {
        return req.isDuplicate === true;
      }

      const statusMatch =
        selectedStatus === "ALL" ||
        req.status === selectedStatus;

      const duplicateMatch =
        !showDuplicatesOnly ||
        req.isDuplicate === true;

      return (
        statusMatch &&
        duplicateMatch
      );
    });
  }, [
    requisitions,
    selectedStatus,
    showDuplicatesOnly,
  ]);

  /* =====================================================
     STATUS CHART
  ===================================================== */

  const statusChartData = useMemo(() => {
    return ALL_STATUSES
      .map((status) => ({
        name: status.replaceAll(
          "_",
          " "
        ),

        value: requisitions.filter(
          (req) =>
            req.status === status
        ).length,

        status,
      }))
      .filter(
        (item) => item.value > 0
      );
  }, [requisitions]);

  /* =====================================================
     AMOUNT BY STATUS
  ===================================================== */

  const amountByStatus = useMemo(() => {
    return ALL_STATUSES
      .map((status) => {
        const amount =
          requisitions
            .filter(
              (req) =>
                req.status === status
            )
            .reduce(
              (sum, req) =>
                sum +
                Number(
                  req.totalEstimatedAmount ||
                    0
                ),
              0
            );

        return {
          status: status.replaceAll(
            "_",
            " "
          ),

          amount,

          originalStatus: status,
        };
      })
      .filter(
        (item) => item.amount > 0
      );
  }, [requisitions]);

  /* =====================================================
     DUPLICATE CHART
  ===================================================== */

  const duplicateChartData = useMemo(() => {
    const duplicateCount =
      requisitions.filter(
        (req) =>
          req.isDuplicate === true
      ).length;

    const normalCount =
      requisitions.length -
      duplicateCount;

    return [
      {
        name: "Normal",
        value: normalCount,
      },

      {
        name: "Duplicate",
        value: duplicateCount,
      },
    ];
  }, [requisitions]);

  /* =====================================================
     METRICS
  ===================================================== */

  const totalRequisitions =
    requisitions.length;

  const pendingCount =
    requisitions.filter((req) =>
      req.status?.startsWith(
        "PENDING_"
      )
    ).length;

  const approvedCount =
    requisitions.filter(
      (req) =>
        req.status === "APPROVED"
    ).length;

  const rejectedCount =
    requisitions.filter((req) =>
      req.status?.includes(
        "REJECTED"
      )
    ).length;

  const duplicateCount =
    requisitions.filter(
      (req) =>
        req.isDuplicate === true
    ).length;

  const totalEstimatedAmount =
    requisitions.reduce(
      (sum, req) =>
        sum +
        Number(
          req.totalEstimatedAmount ||
            0
        ),
      0
    );

  return (
    <>
      <div className="requisition-section">

        <div className="section-header">

          <h2 className="section-title">
            My Requisitions
          </h2>

          <div className="header-actions">
            <NotificationBell setActiveSection={setDashboardSection} />
            <button
              className="refresh-btn"
              onClick={
                loadRequisitions
              }
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              className="btn-primary"
              onClick={
                openCreateModal
              }
            >
              + Create Requisition
            </button>

          </div>

        </div>

        {error && (
          <div className="error-box">

            <span>{error}</span>

            <button
              className="error-dismiss"
              onClick={() =>
                setError("")
              }
              aria-label="Dismiss error"
            >
              ×
            </button>

          </div>
        )}

        {!loading && (
          <div className="metrics-grid">

            <div className="metric-card">

              <div className="metric-icon purple">
                📋
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Total Requisitions
                </div>

                <div className="metric-value">
                  {totalRequisitions}
                </div>

              </div>

            </div>

            <div className="metric-card">

              <div className="metric-icon amber">
                ⏳
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Pending
                </div>

                <div className="metric-value">
                  {pendingCount}
                </div>

              </div>

            </div>

            <div className="metric-card">

              <div className="metric-icon green">
                ✓
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Approved
                </div>

                <div className="metric-value">
                  {approvedCount}
                </div>

              </div>

            </div>

            <div className="metric-card">

              <div className="metric-icon red">
                !
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Rejected
                </div>

                <div className="metric-value">
                  {rejectedCount}
                </div>

              </div>

            </div>

            <div className="metric-card">

              <div className="metric-icon blue">
                ₹
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Estimated Amount
                </div>

                <div className="metric-value">

                  ₹
                  {totalEstimatedAmount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}

                </div>

              </div>

            </div>

            <div className="metric-card">

              <div className="metric-icon red">
                ⚠
              </div>

              <div className="metric-content">

                <div className="metric-label">
                  Duplicates
                </div>

                <div className="metric-value">
                  {duplicateCount}
                </div>

              </div>

            </div>

          </div>
        )}

        {!loading &&
          requisitions.length > 0 && (
            <div className="charts-grid">

              <div className="chart-card">

                <div className="chart-header">

                  <div>

                    <h3>
                      Requisition Status
                    </h3>

                    <p>
                      Your requisitions by workflow status
                    </p>

                  </div>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={360}
                  >

                    <PieChart>

                      <Pie
                        data={
                          statusChartData
                        }
                        cx="50%"
                        cy="45%"
                        innerRadius={70}
                        outerRadius={115}
                        paddingAngle={2}
                        dataKey="value"
                      >

                        {statusChartData.map(
                          (
                            entry,
                            index
                          ) => (
                            <Cell
                              key={`status-${index}`}
                              fill={
                                STATUS_COLORS[
                                  index %
                                    STATUS_COLORS.length
                                ]
                              }
                            />
                          )
                        )}

                      </Pie>

                      <Tooltip />

                      <Legend
                        wrapperStyle={{
                          fontSize:
                            "11px",
                        }}
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

              <div className="chart-card duplicate-chart">

                <div className="chart-header">

                  <div>

                    <h3>
                      Duplicate Requisitions
                    </h3>

                    <p>
                      Duplicate vs normal requisitions
                    </p>

                  </div>

                </div>

                <div className="chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={300}
                  >

                    <PieChart>

                      <Pie
                        data={
                          duplicateChartData
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={4}
                        dataKey="value"
                      >

                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />

                      </Pie>

                      <Tooltip />

                      <Legend />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                <button
                  className={
                    showDuplicatesOnly
                      ? "duplicate-filter active"
                      : "duplicate-filter"
                  }
                  onClick={() =>
                    setShowDuplicatesOnly(
                      (prev) =>
                        !prev
                    )
                  }
                >
                  {showDuplicatesOnly
                    ? "Show All Requisitions"
                    : "Show Duplicate Requisitions"}
                </button>

              </div>

            </div>
          )}

        {!loading &&
          requisitions.length > 0 && (
            <div className="status-filter-wrapper">

              <button
                className={
                  selectedStatus ===
                  "ALL"
                    ? "status-filter active"
                    : "status-filter"
                }
                onClick={() =>
                  setSelectedStatus(
                    "ALL"
                  )
                }
              >
                All
              </button>

              {ALL_STATUSES.map(
                (status) => (
                  <button
                    key={status}
                    className={
                      selectedStatus ===
                      status
                        ? "status-filter active"
                        : "status-filter"
                    }
                    onClick={() =>
                      setSelectedStatus(
                        status
                      )
                    }
                  >
                    {status.replaceAll(
                      "_",
                      " "
                    )}
                  </button>
                )
              )}

              <button
                className={
                  selectedStatus ===
                  "DUPLICATE"
                    ? "status-filter duplicate-status active"
                    : "status-filter duplicate-status"
                }
                onClick={() => {
                  setSelectedStatus(
                    "DUPLICATE"
                  );

                  setShowDuplicatesOnly(
                    false
                  );
                }}
              >
                DUPLICATE
              </button>

            </div>
          )}

        <div className="table-wrapper">

          <table className="table">

            <thead>

              <tr>
                <th>
                  Requisition No
                </th>

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
                    Loading requisitions…
                  </td>

                </tr>

              ) : filteredRequisitions.length >
                0 ? (

                filteredRequisitions.map(
                  (req) => (

                    <tr key={req.id}>

                      <td data-label="Requisition No">

                        <div className="req-number-cell">

                          {req.requisitionNo}

                          {req.isDuplicate && (
                            <span
                              className="duplicate-badge"
                              title="Potential duplicate requisition detected"
                            >
                              Duplicate
                            </span>
                          )}

                        </div>

                      </td>

                      <td data-label="Title">
                        {req.title}
                      </td>

                      <td data-label="Department">
                        {req.departmentName}
                      </td>

                      <td data-label="Status">

                        <span
                          className={`status-badge ${
                            req.status
                              ? req.status.toLowerCase()
                              : ""
                          }`}
                        >
                          {req.status
                            ? req.status.replaceAll(
                                "_",
                                " "
                              )
                            : "-"}
                        </span>

                      </td>

                      <td data-label="Amount">

                        ₹
                        {Number(
                          req.totalEstimatedAmount ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>

                      <td data-label="Created">

                        {req.createdAt
                          ? new Date(
                              req.createdAt
                            ).toLocaleDateString()
                          : "-"}

                      </td>

                      <td data-label="Action">

                        <div className="action-group">

                          <button
                            className="view-btn"
                            onClick={() =>
                              handleView(
                                req
                              )
                            }
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            className="track-btn"
                            disabled={
                              trackingId ===
                              req.id
                            }
                            onClick={() =>
                              handleTrack(
                                req
                              )
                            }
                          >
                            <Clock3 size={14} />
                            {trackingId ===
                            req.id
                              ? "…"
                              : "Track"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="no-data"
                  >
                    No Requisitions Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

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
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              <p>
                <strong>
                  Title:
                </strong>{" "}
                {
                  selectedRequisition.title
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
                    selectedRequisition.status
                      ? selectedRequisition.status.toLowerCase()
                      : ""
                  }`}
                >
                  {
                    selectedRequisition.status
                      ? selectedRequisition.status.replaceAll(
                          "_",
                          " "
                        )
                      : "-"
                  }
                </span>

              </p>

              <p>
                <strong>
                  Duplicate:
                </strong>{" "}

                {selectedRequisition.isDuplicate ? (
                  <span className="duplicate-badge">
                    Duplicate
                  </span>
                ) : (
                  <span className="normal-badge">
                    Normal
                  </span>
                )}

              </p>

              <h3>
                Products
              </h3>

              <div className="table-wrapper">

                <table className="table">

                  <thead>

                    <tr>
                      <th>
                        Product
                      </th>

                      <th>
                        Qty
                      </th>

                      <th>
                        Unit Price
                      </th>
                    </tr>

                  </thead>

                  <tbody>

                    {selectedRequisition.items &&
                    selectedRequisition
                      .items.length > 0 ? (

                      selectedRequisition.items.map(
                        (item) => (

                          <tr key={item.id}>

                            <td data-label="Product">
                              {item.productName}
                            </td>

                            <td data-label="Qty">
                              {item.quantity}
                            </td>

                            <td data-label="Unit Price">
                              ₹
                              {Number(
                                item.unitPrice ||
                                  0
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
                          No item details available
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

      {showTrackModal &&
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
                  Track Requisition{" "}
                  {trackedReq
                    ? `- ${trackedReq.requisitionNo}`
                    : ""}
                </h2>

                <button
                  className="modal-close"
                  onClick={
                    closeTrackModal
                  }
                  aria-label="Close"
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
                    (
                      item,
                      index
                    ) => (

                      <div
                        className="timeline-item"
                        key={index}
                      >

                        <div className="timeline-dot"></div>

                        <div className="timeline-content">

                          <h4>
                            {item.newStatus
                              ? item.newStatus.replaceAll(
                                  "_",
                                  " "
                                )
                              : "-"}
                          </h4>

                          <p>
                            <b>
                              Previous:
                            </b>{" "}
                            {item.oldStatus
                              ? item.oldStatus.replaceAll(
                                  "_",
                                  " "
                                )
                              : "-"}
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

      {showCreateModal &&
        createPortal(

          <div
            className="modal-overlay"
            onClick={
              closeCreateModal
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
                  Create Requisition
                </h2>

                <button
                  className="modal-close"
                  onClick={
                    closeCreateModal
                  }
                  aria-label="Close"
                  disabled={
                    creating
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={
                  handleCreateRequisition
                }
                noValidate
              >

                <div className="field">

                  <label>
                    Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. Office IT Equipment Purchase"
                    value={
                      reqForm.title
                    }
                    onChange={
                      handleReqFieldChange
                    }
                    className={
                      formErrors.title
                        ? "input-error"
                        : ""
                    }
                  />

                  {formErrors.title && (
                    <span className="field-error">
                      {
                        formErrors.title
                      }
                    </span>
                  )}

                </div>

                <div className="field">
                  <label>Priority</label>
                  <select name="priority" value={reqForm.priority} onChange={handleReqFieldChange}>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="field">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    placeholder="e.g. Purchase laptops, monitors and printer for new employees"
                    value={
                      reqForm.description
                    }
                    onChange={
                      handleReqFieldChange
                    }
                    rows={2}
                  />

                </div>

                <div className="field">

                  <label>
                    Category
                  </label>

                  <select
                    name="categoryId"
                    value={
                      reqForm.categoryId
                    }
                    onChange={
                      handleCategoryChange
                    }
                    className={
                      formErrors.categoryId
                        ? "input-error"
                        : ""
                    }
                  >

                    <option value="">
                      Select Category
                    </option>

                    {categories.map(
                      (c) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {
                            c.categoryName
                          }
                        </option>
                      )
                    )}

                  </select>

                  {formErrors.categoryId && (
                    <span className="field-error">
                      {
                        formErrors.categoryId
                      }
                    </span>
                  )}

                </div>

                <div className="items-header">

                  <h3>
                    Items
                  </h3>

                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={
                      addItemRow
                    }
                    disabled={
                      !reqForm.categoryId
                    }
                  >
                    + Add Item
                  </button>

                </div>

                <div className="items-list">

                  {reqForm.items.map(
                    (
                      item,
                      index
                    ) => (

                      <div
                        className="item-row"
                        key={index}
                      >

                        <div className="item-field product-field">

                          <select
                            value={
                              item.productId
                            }
                            onChange={(
                              e
                            ) =>
                              handleItemChange(
                                index,
                                "productId",
                                e.target.value
                              )
                            }
                            disabled={
                              !reqForm.categoryId ||
                              loadingProducts
                            }
                          >

                            <option value="">

                              {!reqForm.categoryId
                                ? "Select category first"
                                : loadingProducts
                                ? "Loading products…"
                                : "Select Product"}

                            </option>

                            {products.map(
                              (p) => {

                                const isSelectedElsewhere = reqForm.items.some(
                                  (item, itemIndex) => 
                                    itemIndex !== index && String(item.productId) === String(p.id)
                                );

                                return (
                                  <option 
                                    key={p.id} 
                                    value={p.id} 
                                    disabled={isSelectedElsewhere}
                                  >
                                    {p.name} {isSelectedElsewhere ? "(Already Selected)" : ""}
                                  </option>
                                );
                              }
                            )}

                          </select>

                        </div>

                        <div className="item-field qty-field">

                          <input
                            type="number"
                            placeholder="Qty"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              handleItemChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <div className="item-field price-field">

                          <input
                            type="number"
                            placeholder="Unit Price"
                            min="0"
                            step="0.01"
                            value={
                              item.unitPrice
                            }
                            onChange={(
                              e
                            ) =>
                              handleItemChange(
                                index,
                                "unitPrice",
                                e.target.value
                              )
                            }
                          />

                        </div>

                        <button
                          type="button"
                          className="remove-item-btn"
                          onClick={() =>
                            removeItemRow(
                              index
                            )
                          }
                          disabled={
                            reqForm.items
                              .length ===
                            1
                          }
                          aria-label="Remove item"
                        >
                          ×
                        </button>

                        {formErrors[
                          `item_${index}`
                        ] && (
                          <span className="field-error item-error">
                            {
                              formErrors[
                                `item_${index}`
                              ]
                            }
                          </span>
                        )}

                      </div>

                    )
                  )}

                </div>

                <div className="total-row">

                  <span>
                    Estimated Total:
                  </span>

                  <strong>
                    ₹
                    {estimatedTotal.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div className="modal-actions">

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={
                      creating
                    }
                  >
                    {creating
                      ? "Submitting…"
                      : "Submit Requisition"}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={
                      closeCreateModal
                    }
                    disabled={
                      creating
                    }
                  >
                    Cancel
                  </button>

                </div>

              </form>

            </div>

          </div>,

          document.body
        )}
    </>
  );
}; 
