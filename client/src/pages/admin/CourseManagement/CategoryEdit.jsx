
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  UserRound,
  ArrowLeft,
  X,
} from "lucide-react";

import "./CategoryDetails.css";

const CategoryEdit = () => {
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

  const [formData, setFormData] = useState({
    categoryName: category?.categoryName || "",
    branch: category?.branch || "All",
    courseIds: category?.courseIds || [],
  });

  const branches = [
    "All",
    "Calicut",
    "Kochi",
    "Malappuram",
    "Trivandrum",
  ];

  const [selectedCourse, setSelectedCourse] = useState("");

  if (!category) {
    return <div>Category not found</div>;
  }

  const addedCourses = courses.filter((course) =>
    formData.courseIds.some(
      (courseId) => String(courseId) === String(course.id)
    )
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ADD COURSE
  const handleAddCourse = () => {
    if (!selectedCourse) return;

    const courseId = String(selectedCourse);

    if (
      formData.courseIds.some(
        (id) => String(id) === courseId
      )
    ) {
      alert("Course already added");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      courseIds: [...prev.courseIds, courseId],
    }));

    setSelectedCourse("");
  };

  // REMOVE COURSE
  const handleRemoveCourse = (courseId) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.filter(
        (id) => String(id) !== String(courseId)
      ),
    }));
  };

  // SAVE CATEGORY
  const handleSave = (e) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    const updatedCategories = categories.map((item) =>
      String(item.id) === id
        ? {
            ...item,
            categoryName: formData.categoryName.trim(),
            branch: formData.branch,
            courseIds: formData.courseIds,
            totalCourses: formData.courseIds.length,
          }
        : item
    );

    localStorage.setItem(
      "categories",
      JSON.stringify(updatedCategories)
    );

    alert("Category updated successfully!");

    navigate("/categories");
  };

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
                  value={addedCourses.length}
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
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* ADDED COURSES */}
            <h4 className="category-section-title added-course-title">
              Added Courses
            </h4>

            {/* COURSE DROPDOWN */}
            <div className="category-add-course">

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
                      (courseId) =>
                        String(courseId) === String(course.id)
                    )}
                  >
                    {course.courseName} ({course.courseCode})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddCourse}
                className="category-add-btn"
              >
                Add
              </button>

            </div>

            {/* SELECTED COURSE CHIPS */}
            <div className="category-view-course-list">

              {addedCourses.map((course) => (
                <div
                  className="category-course-chip"
                  key={course.id}
                >
                  <span>{course.courseName}</span>

                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(course.id)}
                    title="Remove course"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {addedCourses.length === 0 && (
                <p className="category-no-course">
                  No courses added.
                </p>
              )}

            </div>

            {/* BOTTOM BUTTONS */}
            <div className="category-edit-actions">

              <button
                type="button"
                className="category-cancel-btn"
                onClick={() => navigate("/categories")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="category-save-btn"
              >
                Save
              </button>

            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

export default CategoryEdit;
