import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Course.css";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const courses = JSON.parse(localStorage.getItem("courses") || "[]");

  const course = courses.find((item) => String(item.id) === id);

  const [formData, setFormData] = useState(() => ({
    courseName: course?.courseName || "",
    duration: course?.duration || "",
    category: course?.category || "",
    courseType: course?.courseType || "",
    courseFee: course?.courseFee || "",
  }));

  if (!course) {
    return (
      <div className="course-management-layout">
        <Sidebar />
        <main className="course-management-main">
          <h2>Course not found</h2>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </main>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const updatedCourses = courses.map((item) =>
      String(item.id) === id ? { ...item, ...formData } : item,
    );

    localStorage.setItem("courses", JSON.stringify(updatedCourses));

    alert("Course updated successfully!");

    navigate("/courses");
  };

  return (
    <div className="course-management-layout">
      <Sidebar />

      <main className="course-management-main">
        <header className="course-top-header">
          <div>
            <h2>Course Management</h2>
            <p>Dashboard / Course Management / Edit Course</p>
          </div>

          <div className="course-admin-profile">
            <div className="course-admin-avatar">P</div>
            <div>
              <h4>Priyesh</h4>
              <span>Super Admin</span>
            </div>
          </div>
        </header>

        <section className="course-management-content">
          <div className="course-detail-heading">
            <h2>{course.courseName}</h2>

            <button
              className="course-back-btn"
              onClick={() => navigate("/courses")}
            >
              Back
            </button>
          </div>
            <p className="dtails">Course Details</p>
          <form onSubmit={handleSave}>
            <div className="course-form-grid">
              <div className="course-form-group">
                <label>Course Code</label>
                <input
                  type="text"
                   name="courseCode"
                   value={course.courseCode || ""}
                  readOnly
                 
                />
              </div>

              <div className="course-form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="course-form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="course-form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Programming">Programming</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>

              <div className="course-form-group">
                <label>Course Type</label>
                <select
                  name="courseType"
                  value={formData.courseType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Course Type</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="course-form-group">
                <label>Course Fee</label>
                <input
                  type="number"
                  name="courseFee"
                  min="0"
                  value={formData.courseFee}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="course-form-buttons">
              <button
                type="button"
                className="course-cancel-btn"
                onClick={() => navigate("/courses")}
              >
                Cancel
              </button>

              <button type="submit" className="course-create-btn">
                Save Changes
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default EditCourse;
