import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Course.css";

const ViewCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const courses = JSON.parse(localStorage.getItem("courses") || "[]");

  const course = courses.find((item) => String(item.id) === id);

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

  return (
    <div className="course-management-layout">
      

      <main className="course-management-main">
        

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
          <div className="course-detail-list">
            <div>
              <label>Course Code</label>
              <input type="text" value={course.courseCode || ""} readOnly />
            </div>

            <div>
              <label>Course Name</label>
              <input type="text" value={course.courseName || ""} readOnly />
            </div>

            <div>
              <label>Duration</label>
              <input type="text" value={course.duration || ""} readOnly />
            </div>

            <div>
              <label>Category</label>
              <input type="text" value={course.category || ""} readOnly />
            </div>

            <div>
              <label>Course Type</label>
              <input type="text" value={course.courseType || ""} readOnly />
            </div>

            <div>
              <label>Course Fee</label>
              <input
                type="text"
                value={`₹${course.courseFee || ""}`}
                readOnly
              />
            </div>

            <div>
              <label>Course Syllabus</label>
              <input
                type="text"
                value={course.syllabus || "No file uploaded"}
                readOnly
              />
            </div>
          </div>
          <div className="course-detail-actions">
            <button
              className="course-edit-page-btn"
              onClick={() => navigate(`/courses/${course.id}/edit`)}
            >
              Edit Course
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ViewCourse;
