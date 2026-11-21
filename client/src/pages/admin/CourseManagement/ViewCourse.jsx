
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Course.css";

const ViewCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { takecoursebyid } = AdminService();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH COURSE DETAILS
  const fetchCourse = async () => {
    try {
      setLoading(true);

      const response = await takecoursebyid(id);

      setCourse(response.course || response);
    } catch (error) {
      console.error("Error fetching course:", error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="course-management-layout">
        <main className="course-management-main">
          <h2>Loading course details...</h2>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-management-layout">
        <main className="course-management-main">
          <h2>Course not found</h2>

          <button onClick={() => navigate("/courses")}>
            Back to Courses
          </button>
        </main>
      </div>
    );
  }

  // CATEGORY NAME
  const categoryName =
    typeof course.category === "object"
      ? course.category?.categoryName
      : course.category || "";

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
              <input
                type="text"
                value={course.courseCode || "N/A"}
                readOnly
              />
            </div>

            <div>
              <label>Course Name</label>
              <input
                type="text"
                value={course.courseName || ""}
                readOnly
              />
            </div>

            <div>
              <label>Duration</label>
              <input
                type="text"
                value={course.duration || ""}
                readOnly
              />
            </div>

            <div>
              <label>Category</label>
              <input
                type="text"
                value={categoryName}
                readOnly
              />
            </div>

            <div>
              <label>Course Type</label>
              <input
                type="text"
                value={course.courseType || ""}
                readOnly
              />
            </div>

            <div>
              <label>Course Fee</label>
              <input
                type="text"
                value={`₹${course.courseFee ?? ""}`}
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

            <div>
              <label>Description</label>
              <input
                type="text"
                value={course.description || ""}
                readOnly
              />
            </div>

          </div>

          <div className="course-detail-actions">
            <button
              className="course-edit-page-btn"
              onClick={() =>
                navigate(`/courses/${course._id}/edit`)
              }
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
