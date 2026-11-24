
import React, { useEffect, useState } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Download,
  Search,
  X,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Categories.css";

const Categories = () => {
  const {
    createcategory,
    takecategories,
    removecategory,
    takebranch,
    takecategorybyid,
    updatecategory,
  } = AdminService();

  const [activeTab, setActiveTab] = useState("category");

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  const [formData, setFormData] = useState({
    categoryName: "",
    branch: [],
  });

  const [branchDropdown, setBranchDropdown] = useState(false);

  // VIEW / EDIT MODAL
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await takecategories();

      const data = Array.isArray(response)
        ? response
        : response.categories || [];

      setCategories(data);
    } catch (error) {
      console.error("Fetch categories:", error);
      alert("Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  // FETCH BRANCHES
  const fetchBranches = async () => {
    try {
      const response = await takebranch();

      const data = Array.isArray(response)
        ? response
        : response.branches || [];

      setBranches(
        data.filter(
          (branch) =>
            branch.isActive !== false &&
            branch.isDeleted !== true
        )
      );
    } catch (error) {
      console.error("Fetch branches:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBranches();
  }, []);

  // RESET FORM
  const resetForm = () => {
    setFormData({
      categoryName: "",
      branch: [],
    });

    setBranchDropdown(false);
  };

  // OPEN NEW CATEGORY
  const openNewCategory = () => {
    resetForm();
    setActiveTab("newCategory");
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // GET BRANCH IDS
  const getBranchIds = (branchList) => {
    if (!Array.isArray(branchList)) return [];

    return branchList
      .map((branch) =>
        typeof branch === "object"
          ? branch?._id
          : branch
      )
      .filter(Boolean)
      .map(String);
  };

  // MULTIPLE BRANCH SELECTION
  const handleBranchChange = (branchId) => {
    setFormData((prev) => ({
      ...prev,
      branch: prev.branch.includes(branchId)
        ? prev.branch.filter((id) => id !== branchId)
        : [...prev.branch, branchId],
    }));
  };

  // GET BRANCH NAMES
  const getBranchNames = (branchList) => {
    if (!Array.isArray(branchList) || !branchList.length) {
      return "No Branch";
    }

    return branchList
      .map((branch) => {
        if (typeof branch === "object") {
          return branch.branchName;
        }

        const found = branches.find(
          (item) => String(item._id) === String(branch)
        );

        return found?.branchName || "";
      })
      .filter(Boolean)
      .join(", ");
  };

  // CREATE CATEGORY
  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    if (formData.branch.length === 0) {
      alert("Please select at least one branch");
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        categoryName: formData.categoryName.trim(),
        branch: formData.branch,
      };

      await createcategory(categoryData);

      alert("Category created successfully");

      resetForm();

      await fetchCategories();

      setActiveTab("category");
    } catch (error) {
      console.error("Create category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to create category"
      );
    } finally {
      setSaving(false);
    }
  };

  // CANCEL CREATE
  const handleCancel = () => {
    resetForm();
    setActiveTab("category");
  };

  // OPEN VIEW / EDIT
  const openCategoryModal = async (id, mode) => {
    try {
      setModalLoading(true);
      setShowModal(true);
      setModalMode(mode);
      setSelectedCategory(null);

      const response = await takecategorybyid(id);

      const data = response.category || response;

      setSelectedCategory(data);

      setFormData({
        categoryName: data.categoryName || "",
        branch: getBranchIds(data.branch),
      });
    } catch (error) {
      console.error("Category details:", error);

      alert("Unable to load category details");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // CLOSE MODAL
  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    resetForm();
  };

  // UPDATE CATEGORY
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    if (formData.branch.length === 0) {
      alert("Please select at least one branch");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        categoryName: formData.categoryName.trim(),
        branch: formData.branch,

        courses: (selectedCategory.courses || []).map(
          (course) =>
            typeof course === "object"
              ? course._id
              : course
        ),
      };

      await updatecategory(
        selectedCategory._id,
        updatedData
      );

      alert("Category updated successfully");

      closeModal();

      await fetchCategories();
    } catch (error) {
      console.error("Update category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE CATEGORY
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await removecategory(id);

      alert("Category deleted successfully");

      await fetchCategories();
    } catch (error) {
      console.error("Delete category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete category"
      );
    }
  };

  // COURSE COUNT
  const getCourseCount = (category) => {
    return (
      category.totalCourses ??
      category.courses?.length ??
      0
    );
  };

  // FILTER
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.categoryName
      ?.toLowerCase()
      .includes(searchValue.toLowerCase());

    const branchIds = getBranchIds(category.branch);

    const matchesBranch =
      !filterBranch || branchIds.includes(filterBranch);

    return matchesSearch && matchesBranch;
  });

  // EXPORT CSV
  const handleExport = () => {
    if (!filteredCategories.length) {
      alert("No categories available to export");
      return;
    }

    const rows = [
      ["Category Name", "Total Courses", "Branches"],
      ...filteredCategories.map((category) => [
        category.categoryName,
        getCourseCount(category),
        getBranchNames(category.branch),
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "categories.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // BRANCH SELECTOR
  const renderBranchSelector = () => (
    <div className="category-branch-selector">

      <button
        type="button"
        className="branch-selector-button"
        onClick={() =>
          setBranchDropdown((prev) => !prev)
        }
      >
        <span>
          {formData.branch.length === 0
            ? "Select Branches"
            : `${formData.branch.length} Branches Selected`}
        </span>

        <ChevronDown size={17} />
      </button>

      {branchDropdown && (
        <div className="branch-dropdown-menu">

          {branches.length > 0 ? (
            branches.map((branch) => (
              <label
                key={branch._id}
                className="branch-option"
              >
                <input
                  type="checkbox"
                  checked={formData.branch.includes(
                    branch._id
                  )}
                  onChange={() =>
                    handleBranchChange(branch._id)
                  }
                />

                <span>{branch.branchName}</span>
              </label>
            ))
          ) : (
            <p>No branches available</p>
          )}

        </div>
      )}

    </div>
  );

  // COURSES DISPLAY
  const renderCourses = (courseList) => {
    const courses = courseList || [];

    if (!courses.length) {
      return (
        <div className="no-courses-message">
          <Plus size={15} />
          No courses added yet
        </div>
      );
    }

    return (
      <div className="added-course-list">
        {courses.map((course, index) => (
          <span
            className="added-course-chip"
            key={
              typeof course === "object"
                ? course._id
                : course || index
            }
          >
            {typeof course === "object"
              ? course.courseName || course.name
              : course}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="categories-page">

      
      {/* TABS */}
      <div className="category-topbar">

        <div className="category-tabs">

          <button
            className={
              activeTab === "category" ? "active" : ""
            }
            onClick={() => {
              setActiveTab("category");
              resetForm();
              fetchCategories();
            }}
          >
            Category List
          </button>

          <button
            className={
              activeTab === "newCategory" ? "active" : ""
            }
            onClick={openNewCategory}
          >
            New Category
          </button>

        </div>

        {activeTab === "category" && (
          <button
            className="category-export-btn"
            onClick={handleExport}
          >
            <Download size={15} />
            Export
          </button>
        )}

      </div>

      {/* CATEGORY LIST */}
      {activeTab === "category" && (
        <div className="category-list-card">

          {/* SEARCH AND BRANCH FILTER */}
          <div className="category-search-row">

            <div className="category-search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search Categories"
                value={searchValue}
                onChange={(e) =>
                  setSearchValue(e.target.value)
                }
              />
            </div>

            <select
              value={filterBranch}
              onChange={(e) =>
                setFilterBranch(e.target.value)
              }
            >
              <option value="">All Branches</option>

              {branches.map((branch) => (
                <option
                  key={branch._id}
                  value={branch._id}
                >
                  {branch.branchName}
                </option>
              ))}
            </select>

          </div>

          {/* TABLE */}
          <div className="category-table-wrapper">

            {loading ? (
              <div className="category-empty">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="category-empty">
                No categories found.
              </div>
            ) : (

              <table className="category-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Category Name</th>
                    <th>Branch</th>
                    <th>Total Courses</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map(
                    (category, index) => (

                      <tr key={category._id}>

                        <td>{index + 1}</td>

                        <td>
                          <div className="category-name-cell">

                            <span className="category-letter">
                              {category.categoryName
                                ?.charAt(0)
                                .toUpperCase()}
                            </span>

                            <strong>
                              {category.categoryName}
                            </strong>

                          </div>
                        </td>

                        <td>
                          <div className="category-branch-tags">
                            {getBranchNames(category.branch)
                              .split(", ")
                              .map((name) => (
                                <span key={name}>
                                  {name}
                                </span>
                              ))}
                          </div>
                        </td>

                        <td>
                          <span className="course-count">
                            {getCourseCount(category)}
                          </span>
                        </td>

                        <td>
                          {category.createdAt
                            ? new Date(
                                category.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>
                          <div className="category-actions">

                            <button
                              className="view-action"
                              onClick={() =>
                                openCategoryModal(
                                  category._id,
                                  "view"
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              className="edit-action"
                              onClick={() =>
                                openCategoryModal(
                                  category._id,
                                  "edit"
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-action"
                              onClick={() =>
                                handleDelete(category._id)
                              }
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>
            )}

          </div>
        </div>
      )}

      {/* NEW CATEGORY */}
      {activeTab === "newCategory" && (
        <form
          className="new-category-form"
          onSubmit={handleCreateCategory}
        >

          <h3>Create New Category</h3>

          <h4>Category Details</h4>

          <div className="category-form-row">

            <div className="category-form-group">
              <label>
                Category Name <span>*</span>
              </label>

              <input
                type="text"
                name="categoryName"
                placeholder="Enter Category Name"
                value={formData.categoryName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="category-form-group">
              <label>Total Courses</label>

              <input
                type="text"
                value="0"
                disabled
              />
            </div>

            <div className="category-form-group">
              <label>Branches</label>

              {renderBranchSelector()}
            </div>

          </div>

          {/* ADDED COURSES */}
          <div className="added-courses-section">

            <h4>Added Courses</h4>

            <div className="added-courses-box">
              {renderCourses([])}
            </div>

          </div>

          {/* BUTTONS */}
          <div className="category-form-actions">

            <button
              type="button"
              className="category-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="category-create-btn"
              disabled={saving}
            >
              {saving ? "Creating..." : "Create Category"}
            </button>

          </div>

        </form>
      )}

      {/* FULL PAGE VIEW / EDIT */}
      {showModal && (
        <div className="category-modal-overlay">

          <div className="category-modal">

            {/* MODAL HEADER */}
            <div className="category-modal-header">

              <div>
                <h3>
                  {modalMode === "edit"
                    ? "Edit Category"
                    : "Category Details"}
                </h3>

                <p>
                  Category Management &gt;{" "}
                  {modalMode === "edit"
                    ? "edit-category"
                    : "view-category"}
                </p>
              </div>

              <button
                type="button"
                className="category-modal-close"
                onClick={closeModal}
              >
                <X size={21} />
              </button>

            </div>

            {/* MODAL BODY */}
            {modalLoading ? (
              <div className="category-empty">
                Loading category details...
              </div>
            ) : selectedCategory && (

              <form
                className="category-modal-content"
                onSubmit={handleUpdateCategory}
              >

                <div className="category-modal-title">
                  <h3>
                    {modalMode === "edit"
                      ? "Edit Category Details"
                      : "Category Details"}
                  </h3>

                  <button
                    type="button"
                    className="category-back-btn"
                    onClick={closeModal}
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                </div>

                <h4>Category Information</h4>

                <div className="category-form-row">

                  <div className="category-form-group">
                    <label>Category Name</label>

                    <input
                      type="text"
                      name="categoryName"
                      value={formData.categoryName}
                      onChange={handleChange}
                      disabled={modalMode === "view"}
                      required
                    />
                  </div>

                  <div className="category-form-group">
                    <label>Total Courses</label>

                    <input
                      type="text"
                      value={getCourseCount(selectedCategory)}
                      disabled
                    />
                  </div>

                  <div className="category-form-group">
                    <label>Branches</label>

                    {modalMode === "edit" ? (
                      renderBranchSelector()
                    ) : (
                      <div className="category-readonly-branches">
                        {getBranchNames(
                          selectedCategory.branch
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* ADDED COURSES */}
                <div className="added-courses-section">

                  <h4>Added Courses</h4>

                  <div className="added-courses-box">
                    {renderCourses(
                      selectedCategory.courses
                    )}
                  </div>

                  <p className="category-help-text">
                    Courses can be assigned or changed through
                    Course Management.
                  </p>

                </div>

                {/* BUTTONS */}
                <div className="category-form-actions">

                  <button
                    type="button"
                    className="category-cancel-btn"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    {modalMode === "edit"
                      ? "Cancel"
                      : "Close"}
                  </button>

                  {modalMode === "edit" && (
                    <button
                      type="submit"
                      className="category-create-btn"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  )}

                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
