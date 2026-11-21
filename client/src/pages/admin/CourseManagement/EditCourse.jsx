
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Course.css";

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    takecoursebyid,
    updatecourse,
    takecategories,
  } = AdminService();

  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    courseName: "",
    duration: "",
    category: "",
    courseType: "",
    courseFee: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FETCH COURSE AND CATEGORIES
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [courseResponse, categoryResponse] =
          await Promise.all([
            takecoursebyid(id),
            takecategories(),
          ]);

        const courseData =
          courseResponse.course || courseResponse;

        const categoryData = Array.isArray(categoryResponse)
          ? categoryResponse
          : categoryResponse.categories || [];

        setCourse(courseData);

        setCategories(
          categoryData.filter(
            (category) =>
              category.isActive !== false &&
              category.isDeleted !== true
          )
        );

        setFormData({
          courseName: courseData.courseName || "",
          duration: courseData.duration || "",
          category:
            courseData.category?._id ||
            courseData.category ||
            "",
          courseType: courseData.courseType || "",
          courseFee: courseData.courseFee ?? "",
          description: courseData.description || "",
        });

      } catch (error) {
        console.error("Error fetching course:", error);
        setCourse(null);
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

  // SAVE COURSE
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.category) {
      alert("Please select a category");
      return;
    }

    try {
      setSaving(true);

      const updatedData = {
        courseName: formData.courseName.trim(),
        duration: formData.duration,
        category: formData.category,
        courseType: formData.courseType,
        courseFee: Number(formData.courseFee),
        description: formData.description.trim(),
      };

      await updatecourse(id, updatedData);

      alert("Course updated successfully!");

      navigate("/courses");

    } catch (error) {
      console.error("Error updating course:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update course"
      );
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="course-management-layout">

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
              type="button"
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
                  value={course.courseCode || "N/A"}
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

                  {categories.map((category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.categoryName}
                    </option>
                  ))}
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

              <div className="course-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
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
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="course-create-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

export default EditCourse;
