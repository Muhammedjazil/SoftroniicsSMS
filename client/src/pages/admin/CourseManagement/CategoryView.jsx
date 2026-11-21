
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserRound,
  ArrowLeft,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./CategoryDetails.css";

const CategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { takecategorybyid, removecategory } = AdminService();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH CATEGORY DETAILS
  const fetchCategory = async () => {
    try {
      setLoading(true);

      const response = await takecategorybyid(id);

      // Adjust this line if your controller returns { category: ... }
      setCategory(response.category || response);
    } catch (error) {
      console.error("Error fetching category:", error);
      setCategory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // DELETE CATEGORY
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await removecategory(id);
      alert("Category deleted successfully");
      navigate("/categories");
    } catch (error) {
      console.error("Error deleting category:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete category"
      );
    }
  };

  if (loading) {
    return <div>Loading category details...</div>;
  }

  if (!category) {
    return <div>Category not found</div>;
  }

  // BRANCH NAMES
  const branchNames = category.branch
    ?.map((branch) => branch.branchName)
    .join(", ") || "No branch assigned";

  // COURSES
  const addedCourses = category.courses || [];

  return (
    <div className="course-management-layout">

      <main className="course-management-main">

        {/* HEADER */}
        <header className="course-top-header">
          <div>
            <h2>Category</h2>
            <p>Course management &gt; View Category</p>
          </div>

          <div className="admin-profile">
            <UserRound size={17} />
            <div>
              <h4>Priyesh</h4>
              <p>Super Admin</p>
            </div>
          </div>
        </header>

        {/* CATEGORY DETAILS */}
        <section className="category-details-container">

          <div className="category-details-heading">
            <h3>{category.categoryName}</h3>

            <button
              className="category-back-btn"
              onClick={() => navigate("/categories")}
            >
              <ArrowLeft size={13} />
              Back
            </button>
          </div>

          <h4 className="category-section-title">
            Category Details
          </h4>

          {/* DETAILS */}
          <div className="category-details-grid">

            <div className="category-detail-group">
              <label>Category Name</label>
              <input
                value={category.categoryName || ""}
                disabled
                readOnly
              />
            </div>

            <div className="category-detail-group">
              <label>Total Courses</label>
              <input
                value={category.totalCourses ?? addedCourses.length}
                disabled
                readOnly
              />
            </div>

            <div className="category-detail-group">
              <label>Branch</label>
              <input
                value={branchNames}
                disabled
                readOnly
              />
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
                  <span>{course.courseName}</span>
                </div>
              ))
            ) : (
              <p className="category-no-course">
                No courses added.
              </p>
            )}

          </div>

          {/* ACTION BUTTONS */}
          <div className="category-view-actions">

            <button
              className="category-delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>

            <button
              className="category-edit-btn"
              onClick={() =>
                navigate(`/categories/edit/${category._id}`)
              }
            >
              Edit Category
            </button>

          </div>

        </section>
      </main>
    </div>
  );
};

export default CategoryView;
