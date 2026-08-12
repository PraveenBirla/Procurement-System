import { useEffect, useState, useRef } from "react";
import productService from "../../services/productService";
import "./ProductSection.css";

export const ProductSection = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

 
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const firstProductInputRef = useRef(null);
  const firstCategoryInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    categoryId: "",
    unit: "",
    standardPrice: "",
    description: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});

  const [categoryForm, setCategoryForm] = useState({
    categoryName: "",
    description: "",
  });
  const [categoryErrors, setCategoryErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  // Lock body scroll + close on Escape while any modal is open
  useEffect(() => {
    const anyModalOpen = showProductModal || showCategoryModal;

    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowProductModal(false);
        setShowCategoryModal(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showProductModal, showCategoryModal]);

  // Autofocus first field when a modal opens
  useEffect(() => {
    if (showProductModal) {
      setTimeout(() => firstProductInputRef.current?.focus(), 50);
    }
  }, [showProductModal]);

  useEffect(() => {
    if (showCategoryModal) {
      setTimeout(() => firstCategoryInputRef.current?.focus(), 50);
    }
  }, [showCategoryModal]);

  const loadData = async () => {
    setLoading(true);
    try {
      const cats = await productService.getCategories();
      const prods = await productService.getProducts();
      setCategories(cats);
      setProducts(prods);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: "" });
  };

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({ ...categoryForm, [name]: value });
    if (categoryErrors[name]) setCategoryErrors({ ...categoryErrors, [name]: "" });
  };

  const validateProduct = () => {
    const errs = {};
    if (!formData.sku.trim()) errs.sku = "SKU is required";
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.categoryId) errs.categoryId = "Select a category";
    if (!formData.standardPrice || Number(formData.standardPrice) <= 0)
      errs.standardPrice = "Enter a valid price";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateCategory = () => {
    const errs = {};
    if (!categoryForm.categoryName.trim()) errs.categoryName = "Category name is required";
    setCategoryErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetProductForm = () => {
    setFormData({
      sku: "",
      name: "",
      categoryId: "",
      unit: "",
      standardPrice: "",
      description: "",
      isActive: true,
    });
    setFormErrors({});
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!validateProduct()) return;

    setSavingProduct(true);
    try {
      await productService.createProduct(formData);
      resetProductForm();
      setShowProductModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!validateCategory()) return;

    setSavingCategory(true);
    try {
      await productService.createCategories(categoryForm);
      setCategoryForm({ categoryName: "", description: "" });
      setCategoryErrors({});
      setShowCategoryModal(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await productService.deleteProduct(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Products using it may be affected.")) return;
    setDeletingId(id);
    try {
      await productService.deleteCategories(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const closeProductModal = () => {
    if (savingProduct) return;
    resetProductForm();
    setShowProductModal(false);
  };

  const closeCategoryModal = () => {
    if (savingCategory) return;
    setCategoryForm({ categoryName: "", description: "" });
    setCategoryErrors({});
    setShowCategoryModal(false);
  };

  const handleOverlayClick = (e, closeFn) => {
    if (e.target === e.currentTarget) closeFn();
  };

  return (
    <div className="products-section">
      <h2 className="section-title">Manage Products & Categories</h2>

      {error && (
        <div className="error-box">
          <span>{error}</span>
          <button className="error-dismiss" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="actions">
        <button className="btn-primary" onClick={() => setShowCategoryModal(true)}>
          + Add Category
        </button>
        <button className="btn-primary" onClick={() => setShowProductModal(true)}>
          + Add Product
        </button>
      </div>

      {/* Product Table */}
      <h3 className="section-subtitle">Products List</h3>
      {loading ? (
        <div className="empty-state">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products yet. Click "+ Add Product" to create one.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.categoryName}</td>
                <td>{p.standardPrice}</td>
                <td>{p.unit}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Category List */}
      <h3 className="section-subtitle">Categories List</h3>
      {loading ? (
        <div className="empty-state">Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">No categories yet. Click "+ Add Category" to create one.</div>
      ) : (
        <ul className="list">
          {categories.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.categoryName}</strong>
                {c.description ? ` — ${c.description}` : ""}
              </span>
              
            </li>
          ))}
        </ul>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, closeProductModal)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
            <div className="modal-header">
              <h3 className="form-title" id="add-product-title">Add Product</h3>
              <button className="modal-close" onClick={closeProductModal} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleAddProduct} noValidate>
              <div className="field">
                <input
                  ref={firstProductInputRef}
                  type="text"
                  name="sku"
                  placeholder="SKU"
                  value={formData.sku}
                  onChange={handleProductChange}
                  className={formErrors.sku ? "input-error" : ""}
                />
                {formErrors.sku && <span className="field-error">{formErrors.sku}</span>}
              </div>

              <div className="field">
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={formData.name}
                  onChange={handleProductChange}
                  className={formErrors.name ? "input-error" : ""}
                />
                {formErrors.name && <span className="field-error">{formErrors.name}</span>}
              </div>

              <div className="field">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleProductChange}
                  className={formErrors.categoryId ? "input-error" : ""}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && <span className="field-error">{formErrors.categoryId}</span>}
              </div>

              <div className="field">
                <input
                  type="text"
                  name="unit"
                  placeholder="Unit (pcs, box, litre)"
                  value={formData.unit}
                  onChange={handleProductChange}
                />
              </div>

              <div className="field">
                <input
                  type="number"
                  name="standardPrice"
                  placeholder="Price"
                  value={formData.standardPrice}
                  onChange={handleProductChange}
                  min="0"
                  step="0.01"
                  className={formErrors.standardPrice ? "input-error" : ""}
                />
                {formErrors.standardPrice && (
                  <span className="field-error">{formErrors.standardPrice}</span>
                )}
              </div>

              <div className="field">
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleProductChange}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={savingProduct}>
                  {savingProduct ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeProductModal}
                  disabled={savingProduct}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showCategoryModal && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, closeCategoryModal)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="add-category-title">
            <div className="modal-header">
              <h3 className="form-title" id="add-category-title">Add Category</h3>
              <button className="modal-close" onClick={closeCategoryModal} aria-label="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleAddCategory} noValidate>
              <div className="field">
                <input
                  ref={firstCategoryInputRef}
                  type="text"
                  name="categoryName"
                  placeholder="Category Name"
                  value={categoryForm.categoryName}
                  onChange={handleCategoryChange}
                  className={categoryErrors.categoryName ? "input-error" : ""}
                />
                {categoryErrors.categoryName && (
                  <span className="field-error">{categoryErrors.categoryName}</span>
                )}
              </div>

              <div className="field">
                <textarea
                  name="description"
                  placeholder="Description"
                  value={categoryForm.description}
                  onChange={handleCategoryChange}
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={savingCategory}>
                  {savingCategory ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeCategoryModal}
                  disabled={savingCategory}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};