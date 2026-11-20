
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserRound,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import Sidebar from "../../Sidebar";
import "./CategoryDetails.css";

const CategoryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const categories = JSON.parse(
    localStorage.getItem("categories") || "[]"
  );

  const courses = JSON.parse(
    localStorage.getItem("courses") || "[]"
  );

  const category = categories.find(
    (item) => String(item.id) === id
  );

  if (!category) {
    return <div>Category not found</div>;
  }

  const addedCourses = courses.filter((course) =>
    category.courseIds?.some(
      (courseId) => String(courseId) === String(course.id)
    )
  );

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    const updatedCategories = categories.filter(
      (item) => String(item.id) !== id
    );

    localStorage.setItem(
      "categories",
      JSON.stringify(updatedCategories)
    );

    navigate("/categories");
  };

  return (
    <div className="course-management-layout">
      <Sidebar />

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
                value={category.categoryName}
                disabled
                readOnly
              />
            </div>

            <div className="category-detail-group">
              <label>Total Courses</label>
              <input
                value={addedCourses.length}
                disabled
                readOnly
              />
            </div>

            <div className="category-detail-group">
              <label>Branch</label>
              <input
                value={category.branch}
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
                  key={course.id}
                >
                  <span>{course.courseName}</span>
                  <X size={12} />
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
                navigate(`/categories/edit/${category.id}`)
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
