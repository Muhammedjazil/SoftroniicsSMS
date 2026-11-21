
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Categories.css";

const Categories = () => {
  const navigate = useNavigate();

  const {
    createcategory,
    takecategories,
    removecategory,
    takebranch,
  } = AdminService();

  const [activeTab, setActiveTab] = useState("category");

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    categoryName: "",
    branch: "",
  });

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const data = await takecategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  // FETCH BRANCHES
  const fetchBranches = async () => {
    try {
      const data = await takebranch();

      const activeBranches = data.filter(
        (branch) => branch.isActive && !branch.isDeleted
      );

      setBranches(activeBranches);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBranches();
  }, []);

  // OPEN NEW CATEGORY
  const openNewCategory = () => {
    setFormData({
      categoryName: "",
      branch: "",
    });

    setActiveTab("newCategory");
  };

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // CREATE CATEGORY
  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    if (!formData.branch) {
      alert("Please select a branch");
      return;
    }

    try {
      const categoryData = {
        categoryName: formData.categoryName.trim(),
        branch: [formData.branch],
      };

      await createcategory(categoryData);

      alert("Category created successfully");

      setFormData({
        categoryName: "",
        branch: "",
      });

      await fetchCategories();

      setActiveTab("category");
    } catch (error) {
      console.error("Error creating category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to create category"
      );
    }
  };

  // CANCEL
  const handleCancel = () => {
    setFormData({
      categoryName: "",
      branch: "",
    });

    setActiveTab("category");
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
      console.error("Error deleting category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete category"
      );
    }
  };

  // GET BRANCH NAMES
  const getBranchNames = (branchList) => {
    if (!branchList || branchList.length === 0) {
      return "No Branch";
    }

    return branchList
      .map((branch) =>
        typeof branch === "object"
          ? branch.branchName
          : ""
      )
      .filter(Boolean)
      .join(", ");
  };

  // EXPORT CSV
  const handleExport = () => {
    if (!categories.length) {
      alert("No categories available to export");
      return;
    }

    const rows = [
      ["Cat Code", "Category Name", "Added Courses", "Branch"],

      ...categories.map((category, index) => [
        `C${String(index + 1).padStart(2, "0")}`,
        category.categoryName,
        category.totalCourses ?? category.courses?.length ?? 0,
        getBranchNames(category.branch),
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((value) =>
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

  return (
    <div className="categories-page">

      {/* HEADER */}
      <div className="categories-header">
        <div>
          <h2>Category</h2>

          <p>
            Course management &gt;{" "}
            {activeTab === "newCategory"
              ? "Add Category"
              : "Category"}
          </p>
        </div>

        <div className="admin-profile">
          <UserRound size={17} />

          <div>
            <h4>Priyesh</h4>
            <p>Super Admin</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="categories-container">

        {/* TABS */}
        <div className="category-topbar">

          <div className="category-tabs">

            <button
              className={
                activeTab === "category" ? "active" : ""
              }
              onClick={() => {
                setActiveTab("category");
                fetchCategories();
              }}
            >
              Category
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
              Export <Plus size={12} />
            </button>
          )}

        </div>

        {/* CATEGORY TABLE */}
        {activeTab === "category" && (
          <div className="category-list">

            {loading ? (
              <div className="category-empty">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="category-empty">
                No data available. Please add Category to view them here
              </div>
            ) : (

              <table className="category-table">

                <thead>
                  <tr>
                    <th>Cat Code</th>
                    <th>Category Name</th>
                    <th>Added Course</th>
                    <th>Branch</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category, index) => (

                    <tr key={category._id}>

                      <td>
                        C{String(index + 1).padStart(2, "0")}
                      </td>

                      <td>{category.categoryName}</td>

                      <td>
                        {category.totalCourses ??
                          category.courses?.length ??
                          0}
                      </td>

                      <td>
                        {getBranchNames(category.branch)}
                      </td>

                      <td>
                        <div className="category-actions">

                          <button
                            title="View"
                            onClick={() =>
                              navigate(
                                `/categories/view/${category._id}`
                              )
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() =>
                              navigate(
                                `/categories/edit/${category._id}`
                              )
                            }
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            title="Delete"
                            className="delete-action"
                            onClick={() =>
                              handleDelete(category._id)
                            }
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        )}

        {/* NEW CATEGORY FORM */}
        {activeTab === "newCategory" && (

          <form
            className="new-category-form"
            onSubmit={handleCreateCategory}
          >

            <h4>Category Details</h4>

            <div className="category-form-row">

              {/* CATEGORY NAME */}
              <div className="category-form-group">

                <label>Category Name</label>

                <input
                  type="text"
                  name="categoryName"
                  placeholder="Enter Category Name"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                />

              </div>

              {/* TOTAL COURSES */}
              <div className="category-form-group">

                <label>Total Courses</label>

                <input
                  type="text"
                  value="0"
                  disabled
                />

              </div>

              {/* BRANCH */}
              <div className="category-form-group">

                <label>Branch</label>

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Branch
                  </option>

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

            </div>

            {/* ADDED COURSES */}
            <div className="added-courses-section">

              <h4>Added Courses</h4>

              <p className="no-courses-message">
                Courses can be assigned to this category
                when creating or editing a course in Course Management.
              </p>

            </div>

            {/* BUTTONS */}
            <div className="category-form-actions">

              <button
                type="button"
                className="category-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-create-btn"
              >
                Create Category
              </button>

            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default Categories;
