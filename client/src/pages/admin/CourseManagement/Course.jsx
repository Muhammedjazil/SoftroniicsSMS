
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Course.css";

import {
  Eye,
  Pencil,
  Trash2,
  UserRound,
  FileDown,
  Upload,
  Search,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";

const CourseManagement = () => {
  const navigate = useNavigate();

  const {
    takecourses,
    takecategories,
    createcourse,
    removecourse,
  } = AdminService();

  const [activeTab, setActiveTab] = useState("course");

  // DATA
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // FORM DATA
  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseFee, setCourseFee] = useState("");
  const [description, setDescription] = useState("");
  const [syllabus, setSyllabus] = useState(null);

  const [search, setSearch] = useState("");

  // FETCH COURSES
  const fetchCourses = async () => {
    try {
      const response = await takecourses();

      const courseData = Array.isArray(response)
        ? response
        : response.courses || [];

      setCourses(courseData);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Unable to fetch courses");
    }
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const response = await takecategories();

      const categoryData = Array.isArray(response)
        ? response
        : response.categories || [];

      setCategories(
        categoryData.filter(
          (item) =>
            item.isActive !== false &&
            item.isDeleted !== true
        )
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        await Promise.all([
          fetchCourses(),
          fetchCategories(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // CREATE COURSE
  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (
      !courseName.trim() ||
      !duration.trim() ||
      !category ||
      !courseType ||
      !courseFee ||
      !description.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const newCourse = {
        courseName: courseName.trim(),
        duration: duration.trim(),
        category,
        courseType,
        courseFee: Number(courseFee),
        description: description.trim(),

        // Current backend accepts syllabus as a string.
        syllabus: syllabus ? syllabus.name : "",
      };

      await createcourse(newCourse);

      alert("Course created successfully!");

      // CLEAR FORM
      setCourseName("");
      setDuration("");
      setCategory("");
      setCourseType("");
      setCourseFee("");
      setDescription("");
      setSyllabus(null);

      e.target.reset();

      // REFRESH COURSE LIST
      await fetchCourses();

      setActiveTab("course");

    } catch (error) {
      console.error("Error creating course:", error);

      alert(
        error.response?.data?.message ||
        "Unable to create course"
      );
    } finally {
      setSaving(false);
    }
  };

  // SEARCH COURSE
  const filteredCourses = courses.filter((course) => {
    const categoryName =
      typeof course.category === "object"
        ? course.category?.categoryName
        : course.category;

    return `${course.courseName} ${categoryName || ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  // EXPORT COURSES
  const handleExport = () => {
    if (courses.length === 0) {
      alert("No courses available to export.");
      return;
    }

    const headings = [
      "Course Name",
      "Duration",
      "Category",
      "Course Type",
      "Course Fee",
      "Syllabus",
    ];

    const rows = courses.map((course) => {
      const categoryName =
        typeof course.category === "object"
          ? course.category?.categoryName
          : course.category;

      return [
        course.courseName,
        course.duration,
        categoryName || "",
        course.courseType,
        course.courseFee,
        course.syllabus || "",
      ];
    });

    const csvContent = [headings, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
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
    link.download = "courses.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // VIEW COURSE
  const handleView = (course) => {
    navigate(`/courses/${course._id}`);
  };

  // EDIT COURSE
  const handleEdit = (course) => {
    navigate(`/courses/${course._id}/edit`);
  };

  // DELETE COURSE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) return;

    try {
      await removecourse(id);

      alert("Course deleted successfully!");

      await fetchCourses();

    } catch (error) {
      console.error("Error deleting course:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete course"
      );
    }
  };

  return (
    <div className="course-management-layout">

      <main className="course-management-main">
       

        {/* PAGE CONTENT */}
        <section className="course-management-content">

          {/* TABS AND ACTIONS */}
          <div className="course-list-heading">

            <div className="course-tabs">

              <button
                className={activeTab === "course" ? "active" : ""}
                onClick={() => setActiveTab("course")}
              >
                Course
              </button>

              <button
                className={activeTab === "newCourse" ? "active" : ""}
                onClick={() => setActiveTab("newCourse")}
              >
                + New Course
              </button>

            </div>

            {/* SEARCH AND EXPORT */}
            {activeTab === "course" && (
              <div className="course-left-actions">

                <div className="course-search-box">
                  <Search size={14} color="#777" />

                  <input
                    type="text"
                    placeholder="Search Courses"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <button
                  className="course-export-btn"
                  onClick={handleExport}
                >
                  Export
                  <FileDown size={12} strokeWidth={1.8} />
                </button>

              </div>
            )}

          </div>

          {/* COURSE TABLE */}
          {activeTab === "course" && (
            <div className="course-table-wrapper">

              {loading ? (
                <div className="no-course-data">
                  Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <div className="no-course-data">
                  No data available, please add course to view them here
                </div>
              ) : (
                <table className="course-table">

                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Duration</th>
                      <th>Category</th>
                      <th>Course Type</th>
                      <th>Course Fee</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => {

                        const categoryName =
                          typeof course.category === "object"
                            ? course.category?.categoryName
                            : course.category;

                        return (
                          <tr key={course._id}>

                            <td>
                              {course.courseCode || "—"}
                            </td>

                            <td>{course.courseName}</td>

                            <td>{course.duration}</td>

                            <td>{categoryName || "—"}</td>

                            <td>{course.courseType}</td>

                            <td>₹{course.courseFee}</td>

                            <td>
                              <div className="course-actions">

                                <button
                                  className="course-action-btn course-view-btn"
                                  title="View"
                                  onClick={() => handleView(course)}
                                >
                                  <Eye size={15} strokeWidth={1.8} />
                                </button>

                                <button
                                  className="course-action-btn course-edit-btn"
                                  title="Edit"
                                  onClick={() => handleEdit(course)}
                                >
                                  <Pencil size={15} strokeWidth={1.8} />
                                </button>

                                <button
                                  className="course-action-btn course-delete-btn"
                                  title="Delete"
                                  onClick={() => handleDelete(course._id)}
                                >
                                  <Trash2 size={15} strokeWidth={1.8} />
                                </button>

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="course-empty-message">
                          No matching courses found.
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              )}

            </div>
          )}

          {/* NEW COURSE FORM */}
          {activeTab === "newCourse" && (
            <div className="new-course-section">

              <h3>Create New Course</h3>

              <form onSubmit={handleCreateCourse}>

                <div className="course-form-grid">

                  {/* COURSE NAME */}
                  <div className="course-form-group">
                    <label>Course Name</label>

                    <input
                      type="text"
                      placeholder="Enter Course Name"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      required
                    />
                  </div>

                  {/* DURATION */}
                  <div className="course-form-group">
                    <label>Duration</label>

                    <input
                      type="text"
                      placeholder="Enter Duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>

                  {/* CATEGORY */}
                  <div className="course-form-group">
                    <label>Category</label>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select Category</option>

                      {categories.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.categoryName}
                        </option>
                      ))}

                    </select>
                  </div>

                  {/* COURSE TYPE */}
                  <div className="course-form-group">
                    <label>Course Type</label>

                    <select
                      value={courseType}
                      onChange={(e) => setCourseType(e.target.value)}
                      required
                    >
                      <option value="">Select Course Type</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {/* COURSE FEE */}
                  <div className="course-form-group">
                    <label>Course Fee</label>

                    <input
                      type="number"
                      placeholder="Enter Course Fee"
                      min="0"
                      value={courseFee}
                      onChange={(e) => setCourseFee(e.target.value)}
                      required
                    />
                  </div>

                  {/* SYLLABUS */}
                  <div className="course-form-group">
                    <label>Course Syllabus</label>

                    <div className="course-file-upload">

                      <label
                        htmlFor="syllabus-upload"
                        className="course-upload-label"
                      >
                        <Upload size={12} />

                        <span>
                          {syllabus
                            ? syllabus.name
                            : "Upload Syllabus"}
                        </span>
                      </label>

                      <input
                        id="syllabus-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) =>
                          setSyllabus(e.target.files[0] || null)
                        }
                      />

                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="course-form-group">
                    <label>Course Description</label>

                    <textarea
                      placeholder="Enter Course Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                  </div>

                </div>

                {/* FORM BUTTONS */}
                <div className="course-form-buttons">

                  <button
                    type="button"
                    className="course-cancel-btn"
                    onClick={() => setActiveTab("course")}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="course-create-btn"
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create Course"}
                  </button>

                </div>

              </form>
            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default CourseManagement;
