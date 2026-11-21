
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import "./Categories.css";

const Categories = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("category");

  // Load saved categories
  const [categories, setCategories] = useState(() => {
    return JSON.parse(localStorage.getItem("categories") || "[]");
  });

  // Load courses created in Course Management
  const [courses, setCourses] = useState(() => {
    return JSON.parse(localStorage.getItem("courses") || "[]");
  });

  const [formData, setFormData] = useState({
    categoryName: "",
    branch: "All",
    courseIds: [],
  });

  const [selectedCourse, setSelectedCourse] = useState("");

  const branches = [
    "All",
    "Calicut",
    "Kochi",
    "Malappuram",
    "Trivandrum",
  ];

  // Save categories whenever they change
  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  // Refresh course data when opening New Category
  const openNewCategory = () => {
    setCourses(
      JSON.parse(localStorage.getItem("courses") || "[]")
    );
    setActiveTab("newCategory");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add selected course
  const handleAddCourse = () => {
    if (!selectedCourse) return;

    const courseId = String(selectedCourse);

    if (formData.courseIds.some((id) => String(id) === courseId)) {
      alert("Course already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      courseIds: [...prev.courseIds, courseId],
    }));

    setSelectedCourse("");
  };

  // Remove selected course
  const handleRemoveCourse = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.filter(
        (id) => String(id) !== String(courseId)
      ),
    }));
  };

  // Create category
  const handleCreateCategory = (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    const nextCode = `C${String(categories.length + 1).padStart(2, "0")}`;

    const newCategory = {
      id: Date.now(),
      catCode: nextCode,
      categoryName: formData.categoryName.trim(),
      branch: formData.branch,
      courseIds: formData.courseIds,
      totalCourses: formData.courseIds.length,
    };

    setCategories((prev) => [...prev, newCategory]);

    setFormData({
      categoryName: "",
      branch: "All",
      courseIds: [],
    });

    setActiveTab("category");
  };

  const handleCancel = () => {
    setFormData({
      categoryName: "",
      branch: "All",
      courseIds: [],
    });

    setSelectedCourse("");
    setActiveTab("category");
  };

  // Delete category
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    setCategories((prev) =>
      prev.filter((category) => category.id !== id)
    );
  };

  // Export CSV
  const handleExport = () => {
    if (!categories.length) {
      alert("No categories available to export");
      return;
    }

    const rows = [
      ["Cat Code", "Category Name", "Added Courses", "Branch"],
      ...categories.map((category) => [
        category.catCode,
        category.categoryName,
        category.totalCourses,
        category.branch,
      ]),
    ];

    const csvContent = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
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

  // Get selected course details
  const getCourse = (courseId) => {
    return courses.find(
      (course) => String(course.id) === String(courseId)
    );
  };

  return (
    <div className="categories-page">

     

      {/* MAIN CONTAINER */}
      <div className="categories-container">

        {/* TABS */}
        <div className="category-topbar">
          <div className="category-tabs">
            <button
              className={activeTab === "category" ? "active" : ""}
              onClick={() => setActiveTab("category")}
            >
              Category
            </button>

            <button
              className={activeTab === "newCategory" ? "active" : ""}
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

            {categories.length === 0 ? (
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
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.catCode}</td>

                      <td>{category.categoryName}</td>

                      <td>{category.courseIds?.length || 0}</td>

                      <td>{category.branch}</td>

                      <td>
                        <div className="category-actions">
                          <button
                            title="View"
                            onClick={() =>
                              navigate(`/categories/view/${category.id}`)
                            }
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            title="Edit"
                            onClick={() =>
                              navigate(`/categories/edit/${category.id}`)
                            }
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            title="Delete"
                            className="delete-action"
                            onClick={() => handleDelete(category.id)}
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

              <div className="category-form-group">
                <label>Total Courses</label>

                <input
                  type="text"
                  value={formData.courseIds.length}
                  disabled
                />
              </div>

              <div className="category-form-group">
                <label>Branch</label>

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* ADDED COURSES */}
            <div className="added-courses-section">
              <h4>Added Courses</h4>

              <div className="add-course-controls">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  <option value="">Select Course</option>

                  {courses.map((course) => (
                    <option
                      key={course.id}
                      value={course.id}
                      disabled={formData.courseIds.some(
                        (id) => String(id) === String(course.id)
                      )}
                    >
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="add-course-btn"
                  onClick={handleAddCourse}
                >
                  Add
                </button>
              </div>

              <div className="selected-course-list">
                {formData.courseIds.map((courseId) => {
                  const course = getCourse(courseId);

                  if (!course) return null;

                  return (
                    <div
                      className="selected-course-chip"
                      key={courseId}
                    >
                      <span>
                        {course.courseName}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(courseId)}
                        title="Remove course"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {courses.length === 0 && (
                <p className="no-courses-message">
                  No courses available. Please add courses in Course Management first.
                </p>
              )}
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
