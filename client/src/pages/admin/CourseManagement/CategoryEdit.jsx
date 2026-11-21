
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserRound,
  ArrowLeft,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./CategoryDetails.css";

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    takecategorybyid,
    updatecategory,
    takebranch,
  } = AdminService();

  const [category, setCategory] = useState(null);
  const [branches, setBranches] = useState([]);

  const [formData, setFormData] = useState({
    categoryName: "",
    branch: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FETCH CATEGORY AND BRANCHES
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoryResponse, branchResponse] =
          await Promise.all([
            takecategorybyid(id),
            takebranch(),
          ]);

        const categoryData =
          categoryResponse.category || categoryResponse;

        const branchData =
          Array.isArray(branchResponse)
            ? branchResponse
            : branchResponse.branches || [];

        setCategory(categoryData);

        setBranches(
          branchData.filter(
            (branch) =>
              branch.isActive !== false &&
              branch.isDeleted !== true
          )
        );

        // Get the first assigned branch ID
        const assignedBranch =
          categoryData.branch?.[0]?._id ||
          categoryData.branch?.[0] ||
          "";

        setFormData({
          categoryName: categoryData.categoryName || "",
          branch: String(assignedBranch),
        });

      } catch (error) {
        console.error("Error fetching category:", error);
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SAVE CATEGORY
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        categoryName: formData.categoryName.trim(),

        // Backend expects an array of Branch IDs
        branch: formData.branch
          ? [formData.branch]
          : [],

        // Preserve the courses already assigned
        courses: (category.courses || []).map(
          (course) => course._id || course
        ),
      };

      await updatecategory(id, updatedData);

      alert("Category updated successfully!");

      navigate("/categories");

    } catch (error) {
      console.error("Error updating category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading category details...</div>;
  }

  if (!category) {
    return <div>Category not found</div>;
  }

  // COURSES ALREADY ASSIGNED
  const addedCourses = category.courses || [];

  return (
    <div className="course-management-layout">

      <main className="course-management-main">

        {/* HEADER */}
        <header className="course-top-header">
          <div>
            <h2>Category</h2>
            <p>Course management &gt; Edit Category</p>
          </div>

          <div className="admin-profile">
            <UserRound size={17} />

            <div>
              <h4>Priyesh</h4>
              <p>Super Admin</p>
            </div>
          </div>
        </header>

        {/* EDIT FORM */}
        <section className="category-details-container">

          <div className="category-details-heading">
            <h3>{category.categoryName}</h3>

            <button
              type="button"
              className="category-back-btn"
              onClick={() => navigate("/categories")}
            >
              <ArrowLeft size={13} />
              Back
            </button>
          </div>

          <form onSubmit={handleSave}>

            <h4 className="category-section-title">
              Category Details
            </h4>

            {/* FORM FIELDS */}
            <div className="category-details-grid">

              <div className="category-detail-group">
                <label>Category Name</label>

                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="category-detail-group">
                <label>Total Courses</label>

                <input
                  value={
                    category.totalCourses ??
                    addedCourses.length
                  }
                  disabled
                  readOnly
                />
              </div>

              <div className="category-detail-group">
                <label>Branch</label>

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  <option value="">Select Branch</option>

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
            <h4 className="category-section-title added-course-title">
              Added Courses
            </h4>

            <div className="category-view-course-list">

              {addedCourses.length > 0 ? (
                addedCourses.map((course) => (
                  <div
                    className="category-course-chip"
                    key={course._id}
                  >
                    <span>
                      {course.courseName}
                    </span>
                  </div>
                ))
              ) : (
                <p className="category-no-course">
                  No courses added.
                </p>
              )}

            </div>

            <p>
              Courses can be assigned or changed through
              Course Management.
            </p>

            {/* BOTTOM BUTTONS */}
            <div className="category-edit-actions">

              <button
                type="button"
                className="category-cancel-btn"
                onClick={() => navigate("/categories")}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>

            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

export default CategoryEdit;
