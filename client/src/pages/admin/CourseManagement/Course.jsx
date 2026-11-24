
import React, { useEffect, useState } from "react";
import {
  Search,
  FileDown,
  Upload,
  X,
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Course.css";

const CourseManagement = () => {
  const {
    takecourses,
    takecategories,
    createcourse,
    takecoursebyid,
    updatecourse,
    removecourse,
  } = AdminService();

  const [activeTab, setActiveTab] = useState("course");

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  // Modal state: view or edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Form state
  const initialForm = {
    courseName: "",
    durationValue: "",
    durationUnit: "Months",
    category: "",
    courseType: "",
    courseFee: "",
    description: "",
    syllabus: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [syllabusFile, setSyllabusFile] = useState(null);

  // ---------------- FETCH COURSES ----------------

  const fetchCourses = async () => {
    try {
      const response = await takecourses();

      const data = Array.isArray(response)
        ? response
        : response?.courses || [];

      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert(error.response?.data?.message || "Unable to fetch courses");
    }
  };

  // ---------------- FETCH CATEGORIES ----------------

  const fetchCategories = async () => {
    try {
      const response = await takecategories();

      const data = Array.isArray(response)
        ? response
        : response?.categories || [];

      setCategories(
        data.filter(
          (item) =>
            item.isActive !== false &&
            item.isDeleted !== true
        )
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // ---------------- LOAD DATA ----------------

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchCourses(),
        fetchCategories(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ---------------- INPUT CHANGE ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------- CLEAR FORM ----------------

  const clearForm = () => {
    setFormData(initialForm);
    setSyllabusFile(null);
  };

  // ---------------- OPEN NEW COURSE ----------------

  const openNewCourse = () => {
    clearForm();
    setSelectedCourse(null);
    setModalOpen(false);
    setActiveTab("newCourse");
  };

  // ---------------- CREATE COURSE ----------------

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (
      !formData.courseName.trim() ||
      !formData.durationValue.trim() ||
      !formData.category ||
      !formData.courseType ||
      formData.courseFee === "" ||
      !formData.description.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);

      const newCourse = {
        courseName: formData.courseName.trim(),
        duration: `${formData.durationValue} ${formData.durationUnit}`,
        category: formData.category,
        courseType: formData.courseType,
        courseFee: Number(formData.courseFee),
        description: formData.description.trim(),
        syllabus: syllabusFile
          ? syllabusFile.name
          : formData.syllabus,
      };

      await createcourse(newCourse);

      alert("Course created successfully!");

      clearForm();
      await fetchCourses();
      setActiveTab("course");
    } catch (error) {
      console.error("Create course error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to create course"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- FILTER COURSES ----------------

  const filteredCourses = courses.filter((course) => {
    const categoryId =
      typeof course.category === "object"
        ? course.category?._id
        : course.category;

    const categoryName =
      typeof course.category === "object"
        ? course.category?.categoryName
        : course.category;

    const matchesSearch =
      `${course.courseName || ""} ${categoryName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "all" ||
      categoryId === filterCategory;

    const matchesType =
      filterType === "all" ||
      course.courseType === filterType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // ---------------- EXPORT CSV ----------------

  const handleExport = () => {
    if (!filteredCourses.length) {
      alert("No courses available to export");
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

    const rows = filteredCourses.map((course) => {
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

  // ---------------- OPEN VIEW / EDIT MODAL ----------------

  const openCourseModal = async (id, mode) => {
    try {
      setModalOpen(true);
      setModalMode(mode);
      setModalLoading(true);
      setSelectedCourse(null);

      const response = await takecoursebyid(id);
      const data = response?.course || response;

      setSelectedCourse(data);

      const durationParts = String(data.duration || "")
        .trim()
        .match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

      setFormData({
        courseName: data.courseName || "",
        durationValue: durationParts?.[1] || "",
        durationUnit: durationParts?.[2] || "Months",
        category:
          typeof data.category === "object"
            ? data.category?._id || ""
            : data.category || "",
        courseType: data.courseType || "",
        courseFee: data.courseFee ?? "",
        description: data.description || "",
        syllabus: data.syllabus || "",
      });

      setSyllabusFile(null);
    } catch (error) {
      console.error("Error fetching course details:", error);
      alert("Unable to load course details");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------- UPDATE COURSE ----------------

  const handleUpdateCourse = async (e) => {
    e.preventDefault();

    if (!selectedCourse) return;

    try {
      setSaving(true);

      const updatedData = {
        courseName: formData.courseName.trim(),
        duration: `${formData.durationValue} ${formData.durationUnit}`,
        category: formData.category,
        courseType: formData.courseType,
        courseFee: Number(formData.courseFee),
        description: formData.description.trim(),
        syllabus: syllabusFile
          ? syllabusFile.name
          : formData.syllabus,
      };

      await updatecourse(selectedCourse._id, updatedData);

      alert("Course updated successfully!");

      setModalOpen(false);
      setSelectedCourse(null);
      clearForm();

      await fetchCourses();
    } catch (error) {
      console.error("Update course error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to update course"
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE COURSE ----------------

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
      console.error("Delete course error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete course"
      );
    }
  };

  // ---------------- CLOSE MODAL ----------------

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
    setSyllabusFile(null);
    clearForm();
  };

  // ---------------- CATEGORY NAME ----------------

  const getCategoryName = (course) => {
    if (typeof course.category === "object") {
      return course.category?.categoryName || "—";
    }

    const category = categories.find(
      (item) => item._id === course.category
    );

    return category?.categoryName || "—";
  };

  // ---------------- RENDER FORM ----------------

  const renderCourseForm = (isView = false) => (
    <form
      onSubmit={
        isView
          ? (e) => e.preventDefault()
          : modalOpen
            ? handleUpdateCourse
            : handleCreateCourse
      }
    >
      <div className="course-form-grid">

        <div className="course-form-group">
          <label>Course Name <span>*</span></label>
          <input
            type="text"
            name="courseName"
            placeholder="Enter Course Name"
            value={formData.courseName}
            onChange={handleChange}
            readOnly={isView}
            required
          />
        </div>

        <div className="course-form-group">
          <label>Duration <span>*</span></label>

          <div className="course-duration-fields">
            <input
              type="number"
              name="durationValue"
              min="1"
              placeholder="e.g. 3"
              value={formData.durationValue}
              onChange={handleChange}
              readOnly={isView}
              required
            />

            <select
              name="durationUnit"
              value={formData.durationUnit}
              onChange={handleChange}
              disabled={isView}
            >
              <option value="Months">Months</option>
              <option value="Years">Years</option>
            </select>
          </div>
        </div>

        <div className="course-form-group">
          <label>Category Name <span>*</span></label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={isView}
            required
          >
            <option value="">Choose Category</option>

            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="course-form-group">
          <label>Course Type <span>*</span></label>

          <select
            name="courseType"
            value={formData.courseType}
            onChange={handleChange}
            disabled={isView}
            required
          >
            <option value="">Choose Course Type</option>
            <option value="Regular">Regular</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="course-form-group">
          <label>Course Fee <span>*</span></label>

          <input
            type="number"
            name="courseFee"
            min="0"
            placeholder="Enter Course Fee"
            value={formData.courseFee}
            onChange={handleChange}
            readOnly={isView}
            required
          />
        </div>

        <div className="course-form-group course-syllabus-group">
          <label>Course Syllabus <small>(PDF only, Max 10MB)</small></label>

          {isView ? (
            <div className="course-syllabus-view">
              {formData.syllabus || "No syllabus uploaded"}
            </div>
          ) : (
            <>
              <label
                htmlFor={modalOpen ? "edit-syllabus" : "new-syllabus"}
                className="course-upload-label"
              >
                <Upload size={16} />
                <span>
                  {syllabusFile?.name ||
                    formData.syllabus ||
                    "Upload PDF Syllabus"}
                </span>
              </label>

              <input
                id={modalOpen ? "edit-syllabus" : "new-syllabus"}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  if (file.type !== "application/pdf") {
                    alert("Please select a PDF file");
                    e.target.value = "";
                    return;
                  }

                  if (file.size > 10 * 1024 * 1024) {
                    alert("File size must be less than 10MB");
                    e.target.value = "";
                    return;
                  }

                  setSyllabusFile(file);
                }}
              />
            </>
          )}
        </div>

        <div className="course-form-group course-description-group">
          <label>Description <span>*</span></label>

          <textarea
            name="description"
            placeholder="Enter Course Description"
            value={formData.description}
            onChange={handleChange}
            readOnly={isView}
            required
          />
        </div>
      </div>

      {!isView && (
        <div className="course-form-buttons">
          <button
            type="button"
            className="course-cancel-btn"
            onClick={() => {
              if (modalOpen) {
                closeModal();
              } else {
                setActiveTab("course");
                clearForm();
              }
            }}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="course-create-btn"
            disabled={saving}
          >
            {saving
              ? modalOpen
                ? "Saving..."
                : "Creating..."
              : modalOpen
                ? "Save Changes"
                : "Create Course"}
          </button>
        </div>
      )}
    </form>
  );

  return (
    <div className="course-management-page">

      
      

      {/* TABS */}
      <div className="course-tabs">
        <button
          className={activeTab === "course" ? "active" : ""}
          onClick={() => setActiveTab("course")}
        >
          Courses
        </button>

        <button
          className={activeTab === "newCourse" ? "active" : ""}
          onClick={openNewCourse}
        >
          New Course
        </button>
      </div>

      {/* COURSE LIST */}
      {activeTab === "course" && (
        <section className="course-list-card">

          <div className="course-list-toolbar">

            <div className="course-search-box">
              <Search size={17} />
              <input
                type="text"
                placeholder="Search Courses"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="course-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.categoryName}
                </option>
              ))}
            </select>

            <select
              className="course-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Regular">Regular</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>

            <button
              className="course-export-btn"
              onClick={handleExport}
            >
              <FileDown size={15} />
              Export
            </button>
          </div>

          <div className="course-table-scroll">
            <table className="course-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Course Name</th>
                  <th>Duration</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Fee</th>
                  <th>Syllabus</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="course-empty-message">
                      Loading courses...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="course-empty-message">
                      No courses found. Please add a course.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course, index) => (
                    <tr key={course._id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="course-name-cell">
                          <span className="course-avatar">
                            {course.courseName?.charAt(0)?.toUpperCase() || "C"}
                          </span>
                          <strong>{course.courseName}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="course-duration-badge">
                          {course.duration}
                        </span>
                      </td>

                      <td>{getCategoryName(course)}</td>

                      <td>
                        <span className="course-type-badge">
                          {course.courseType}
                        </span>
                      </td>

                      <td>₹{Number(course.courseFee || 0).toLocaleString("en-IN")}</td>

                      <td>
                        <span className="course-syllabus-badge">
                          {course.syllabus ? "Uploaded" : "No Syllabus"}
                        </span>
                      </td>

                      <td>
                        <div className="course-actions">
                          <button
                            className="course-view-btn"
                            onClick={() => openCourseModal(course._id, "view")}
                          >
                            View
                          </button>

                          <button
                            className="course-edit-btn"
                            onClick={() => openCourseModal(course._id, "edit")}
                          >
                            Edit
                          </button>

                          <button
                            className="course-delete-btn"
                            onClick={() => handleDelete(course._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* CREATE COURSE */}
      {activeTab === "newCourse" && (
        <section className="new-course-section">
          <h3>Create New Course</h3>
          <p className="course-section-subtitle">Course Details</p>

          {renderCourseForm(false)}
        </section>
      )}

      {/* FULL PAGE VIEW / EDIT MODAL */}
      {modalOpen && (
        <div className="course-modal-overlay">
          <div className="course-modal">

            <div className="course-modal-header">
              <div>
                <h2>
                  {modalMode === "view"
                    ? "View Course"
                    : "Edit Course"}
                </h2>

                <p>
                  Course Management &gt; Courses &gt;{" "}
                  {modalMode === "view" ? "View" : "Edit"}
                </p>
              </div>

              <button
                className="course-modal-close"
                onClick={closeModal}
                type="button"
              >
                <X size={22} />
              </button>
            </div>

            <div className="course-modal-tabs">
              <button type="button" className="active">
                {modalMode === "view" ? "Course Details" : "Edit Course"}
              </button>
            </div>

            <div className="course-modal-body">
              {modalLoading ? (
                <div className="course-empty-message">
                  Loading course details...
                </div>
              ) : selectedCourse ? (
                <>
                  <h3>
                    {modalMode === "view"
                      ? selectedCourse.courseName
                      : "Update Course Details"}
                  </h3>

                  {renderCourseForm(modalMode === "view")}

                  {modalMode === "view" && (
                    <div className="course-form-buttons">
                      <button
                        type="button"
                        className="course-cancel-btn"
                        onClick={closeModal}
                      >
                        Back to Courses
                      </button>

                      <button
                        type="button"
                        className="course-create-btn"
                        onClick={() => setModalMode("edit")}
                      >
                        <Pencil size={15} />
                        Edit Course
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="course-empty-message">
                  Course not found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CourseManagement;
