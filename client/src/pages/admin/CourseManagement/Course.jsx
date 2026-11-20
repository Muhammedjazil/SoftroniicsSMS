import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Course.css";
import { Eye, Pencil, Trash2, UserRound, FileDown,Upload,Search } from "lucide-react";

const CourseManagement = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("course");

  // LOAD COURSES FROM LOCAL STORAGE
  const [courses, setCourses] = useState(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");

    return savedCourses.map((course, index) => ({
      ...course,
      courseCode:
        course.courseCode || `CRS${String(index + 1).padStart(3, "0")}`,
    }));
  });

  // FORM DATA
  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseFee, setCourseFee] = useState("");
  const [syllabus, setSyllabus] = useState(null);

  const [search, setSearch] = useState("");

  // SAVE COURSES
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  // CREATE COURSE
  const handleCreateCourse = (e) => {
    e.preventDefault();

    if (!courseName || !duration || !category || !courseType || !courseFee) {
      alert("Please fill all required fields");
      return;
    }

    const newCourse = {
      id: Date.now(),
      courseCode: `CRS${Date.now().toString().slice(-6)}`,
      courseName,
      duration,
      category,
      courseType,
      courseFee,
      syllabus: syllabus ? syllabus.name : "No file uploaded",
    };

    setCourses((prev) => [...prev, newCourse]);

    // CLEAR FORM
    setCourseName("");
    setDuration("");
    setCategory("");
    setCourseType("");
    setCourseFee("");
    setSyllabus(null);

    e.target.reset();

    setActiveTab("course");

    alert("Course created successfully!");
  };

  // SEARCH COURSE
  const filteredCourses = courses.filter((course) =>
    `${course.courseCode} ${course.courseName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // EXPORT COURSES
  const handleExport = () => {
    if (courses.length === 0) {
      alert("No courses available to export.");
      return;
    }

    const headings = [
      "Course Code",
      "Course Name",
      "Duration",
      "Category",
      "Course Type",
      "Course Fee",
      "Syllabus",
    ];

    const rows = courses.map((course) => [
      course.courseCode,
      course.courseName,
      course.duration,
      course.category,
      course.courseType,
      course.courseFee,
      course.syllabus,
    ]);

    const csvContent = [headings, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
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
    navigate(`/courses/${course.id}`);
  };

  // EDIT COURSE
  const handleEdit = (course) => {
    navigate(`/courses/${course.id}/edit`);
  };

  // DELETE COURSE
  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (confirmDelete) {
      setCourses((previousCourses) =>
        previousCourses.filter((course) => course.id !== id),
      );
    }
  };

  return (
    <div className="course-management-layout">
     

      <main className="course-management-main">
        {/* TOP HEADER */}
        <header className="course-top-header">
          <div>
            <h2>Course Management</h2>
            <p>Dashboard / Course Management</p>
          </div>

          <div className="admin-profile">
            <UserRound size={17} />

            <div>
              <h4>Priyesh</h4>
              <p>Super Admin</p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <section className="course-management-content">
          {/* TOP ACTION BAR - ALWAYS VISIBLE */}

          {/* RIGHT SIDE - TAB BUTTONS */}
          <div className="course-list-heading">
            {/* LEFT SIDE - TABS */}
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

            {/* LEFT SIDE - SEARCH AND EXPORT */}
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

                <button className="course-export-btn" onClick={handleExport}>Export
                  <FileDown size={12} strokeWidth={1.8} />
                </button>
              </div>
            )}
          </div>
          {/* COURSE TABLE */}
          {/* COURSE TABLE */}
          {activeTab === "course" && (
            <div className="course-table-wrapper">
              {courses.length === 0 ? (
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
                      filteredCourses.map((course) => (
                        <tr key={course.id}>
                          <td>{course.courseCode}</td>
                          <td>{course.courseName}</td>
                          <td>{course.duration}</td>
                          <td>{course.category}</td>
                          <td>{course.courseType}</td>
                          <td>{course.courseFee}</td>

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
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 size={15} strokeWidth={1.8} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
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
                      <option value="Development">Development</option>
                      <option value="Design">Design</option>
                      <option value="Programming">Programming</option>
                      <option value="Marketing">Marketing</option>
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
                          {syllabus ? syllabus.name : "Upload Syllabus"}
                        </span>
                      </label>

                      <input
                        id="syllabus-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setSyllabus(e.target.files[0] || null)}
                      />
                    </div>
                  </div>
                </div>

                {/* FORM BUTTONS */}
                <div className="course-form-buttons">
                  <button
                    type="button"
                    className="course-cancel-btn"
                    onClick={() => setActiveTab("course")}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="course-create-btn">
                    Create Course
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
