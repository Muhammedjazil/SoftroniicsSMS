import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Course.css';
import { LuSearch, LuX } from 'react-icons/lu';
import { HiOutlineArrowDownTray, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminService from '../../../services/admin-api-services/AdminService';
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../components/common/Toast';

const CourseManagement = () => {
  const { showToast, ToastContainer } = useToast();
  const {
    takecourses,
    takecategories,
    createcourse,
    takecoursebyid,
    updatecourse,
    removecourse,
  } = AdminService();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'new-course' | 'edit-course'
  const [viewingCourse, setViewingCourse] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterType, setFilterType] = useState('All Types');

  // Form states
  const [formName, setFormName] = useState('');
  const [formDurationValue, setFormDurationValue] = useState('');
  const [formDurationUnit, setFormDurationUnit] = useState('Months');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState('Regular');
  const [formFee, setFormFee] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSyllabusFile, setFormSyllabusFile] = useState(null);
  const [formSyllabusName, setFormSyllabusName] = useState('');

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);

  // Normalize course document from API
  const normalizeCourse = useCallback((c, categoryLookup = []) => {
    let catId = '';
    let catName = '—';

    if (typeof c.category === 'object' && c.category !== null) {
      catId = c.category._id || '';
      catName = c.category.categoryName || '—';
    } else if (c.category) {
      catId = String(c.category);
      const found = categoryLookup.find((cat) => String(cat._id) === catId);
      catName = found?.categoryName || '—';
    }

    const createdDate = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('en-US')
      : '';

    return {
      id: c._id,
      code: c._id ? c._id.slice(-6) : '',
      name: c.courseName || '',
      duration: c.duration || '',
      categoryId: catId,
      categoryName: catName,
      courseType: c.courseType || 'Regular',
      courseFee: c.courseFee ?? 0,
      description: c.description || '',
      syllabus: c.syllabus || '',
      createdAt: createdDate,
    };
  }, []);

  // Load courses & categories on mount
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, categoriesRes] = await Promise.allSettled([
        takecourses(),
        takecategories(),
      ]);

      let loadedCategories = [];
      if (categoriesRes.status === 'fulfilled') {
        const rawCats = Array.isArray(categoriesRes.value)
          ? categoriesRes.value
          : categoriesRes.value?.categories || categoriesRes.value?.data || [];
        loadedCategories = rawCats.filter(
          (item) => item.isActive !== false && item.isDeleted !== true
        );
        setCategories(loadedCategories);
      }

      if (coursesRes.status === 'fulfilled') {
        const rawCourses = Array.isArray(coursesRes.value)
          ? coursesRes.value
          : coursesRes.value?.courses || coursesRes.value?.data || [];
        setCourses(
          rawCourses.map((c) => normalizeCourse(c, loadedCategories))
        );
      } else {
        console.error('Failed to load courses:', coursesRes.reason);
        showToast('Unable to load courses', 'error');
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeCourse, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchMatch =
        `${course.name} ${course.categoryName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());

      const categoryMatch =
        filterCategory === 'All Categories' ||
        course.categoryId === filterCategory;

      const typeMatch =
        filterType === 'All Types' || course.courseType === filterType;

      return searchMatch && categoryMatch && typeMatch;
    });
  }, [courses, searchQuery, filterCategory, filterType]);

  const resetForm = () => {
    setFormName('');
    setFormDurationValue('');
    setFormDurationUnit('Months');
    setFormCategory('');
    setFormType('Regular');
    setFormFee('');
    setFormDescription('');
    setFormSyllabusFile(null);
    setFormSyllabusName('');
    setEditingCourseId(null);
  };

  const handleOpenNewCourse = () => {
    resetForm();
    setViewingCourse(null);
    setActiveTab('new-course');
  };

  const handleOpenEditCourse = (courseItem) => {
    setViewingCourse(null);
    setEditingCourseId(courseItem.id);
    setFormName(courseItem.name);

    const durationParts = String(courseItem.duration || '')
      .trim()
      .match(/^(\d+(?:\.\d+)?)\s*(.*)$/);

    setFormDurationValue(durationParts?.[1] || '');
    setFormDurationUnit(durationParts?.[2] || 'Months');
    setFormCategory(courseItem.categoryId || '');
    setFormType(courseItem.courseType || 'Regular');
    setFormFee(courseItem.courseFee ?? '');
    setFormDescription(courseItem.description || '');
    setFormSyllabusName(courseItem.syllabus || '');
    setFormSyllabusFile(null);

    setActiveTab('edit-course');
  };

  const handleViewCourse = (courseItem) => {
    setViewingCourse(courseItem);
  };

  const handleBackToCourses = () => {
    resetForm();
    setViewingCourse(null);
    setActiveTab('courses');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showToast('Please select a PDF file for syllabus', 'warning');
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size must be less than 10MB', 'warning');
      e.target.value = '';
      return;
    }

    setFormSyllabusFile(file);
    setFormSyllabusName(file.name);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    if (
      !formName.trim() ||
      !formDurationValue.trim() ||
      !formCategory ||
      !formType ||
      formFee === '' ||
      !formDescription.trim()
    ) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseName: formName.trim().toUpperCase(),
        duration: `${formDurationValue.trim()} ${formDurationUnit}`,
        category: formCategory,
        courseType: formType,
        courseFee: Number(formFee),
        description: formDescription.trim(),
        syllabus: formSyllabusFile ? formSyllabusFile.name : formSyllabusName,
      };

      const res = await createcourse(payload);
      const created = res?.course || res?.data || res;

      setCourses((prev) => [normalizeCourse(created, categories), ...prev]);
      showToast('Course created successfully!', 'success');
      resetForm();
      setActiveTab('courses');
    } catch (error) {
      console.error('Error creating course:', error);
      showToast(
        error?.response?.data?.message || 'Failed to create course',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditedCourse = async (e) => {
    e.preventDefault();

    if (
      !formName.trim() ||
      !formDurationValue.trim() ||
      !formCategory ||
      !formType ||
      formFee === '' ||
      !formDescription.trim() ||
      !editingCourseId ||
      submitting
    ) {
      showToast('Please fill all required fields', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseName: formName.trim().toUpperCase(),
        duration: `${formDurationValue.trim()} ${formDurationUnit}`,
        category: formCategory,
        courseType: formType,
        courseFee: Number(formFee),
        description: formDescription.trim(),
        syllabus: formSyllabusFile ? formSyllabusFile.name : formSyllabusName,
      };

      const res = await updatecourse(editingCourseId, payload);
      const updated = res?.course || res?.data || res;

      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourseId
            ? normalizeCourse(updated, categories)
            : c
        )
      );
      showToast('Course updated successfully!', 'success');
      resetForm();
      setActiveTab('courses');
    } catch (error) {
      console.error('Error updating course:', error);
      showToast(
        error?.response?.data?.message || 'Failed to update course',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await removecourse(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
      if (viewingCourse && viewingCourse.id === id) {
        setViewingCourse(null);
      }
      showToast('Course deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting course:', error);
      showToast(
        error?.response?.data?.message || 'Failed to delete course',
        'error'
      );
    }
  };

  const handleExportCSV = () => {
    if (filteredCourses.length === 0) {
      showToast('No courses to export.', 'warning');
      return;
    }
    const headers = [
      '#',
      'Course Name',
      'Duration',
      'Category',
      'Type',
      'Fee (INR)',
      'Syllabus',
      'Created',
    ];

    const rows = filteredCourses.map((c, idx) => [
      idx + 1,
      c.name,
      c.duration,
      c.categoryName,
      c.courseType,
      c.courseFee,
      c.syllabus || 'No File',
      c.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'courses_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Courses exported to CSV.', 'success');
  };

  return (
    <div className="crs-mgmt-container">
      <ToastContainer />

      {/* Outer Toolbar */}
      <div className="crs-mgmt-toolbar">
        <div className="crs-mgmt-tab-group">
          <button
            type="button"
            className={`crs-mgmt-tab-btn ${
              activeTab === 'courses' ? 'crs-mgmt-tab-btn--active' : ''
            }`}
            onClick={handleBackToCourses}
          >
            Courses List
          </button>
          <button
            type="button"
            className={`crs-mgmt-tab-btn ${
              activeTab === 'new-course' || activeTab === 'edit-course'
                ? 'crs-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenNewCourse}
          >
            {activeTab === 'edit-course' ? 'Edit Course' : 'New Course'}
          </button>
        </div>

        <button
          type="button"
          className="crs-mgmt-export-btn"
          onClick={handleExportCSV}
          title="Export Courses to CSV"
        >
          <HiOutlineArrowDownTray className="crs-mgmt-export-icon" />
          <span>Export</span>
        </button>
      </div>

      {/* Main White Card Container */}
      <main className="crs-mgmt-panel">
        {/* COURSES LIST VIEW */}
        {activeTab === 'courses' && (
          <>
            <div className="crs-mgmt-filter-bar">
              <div className="crs-mgmt-search-wrapper">
                <LuSearch className="crs-mgmt-search-icon" />
                <input
                  type="text"
                  className="crs-mgmt-search-input"
                  placeholder="Search Courses"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="crs-mgmt-filter-select-wrapper">
                <select
                  className="crs-mgmt-filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="crs-mgmt-select-arrow" />
              </div>

              <div className="crs-mgmt-filter-select-wrapper crs-mgmt-filter-select-wrapper--small">
                <select
                  className="crs-mgmt-filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All Types">All Types</option>
                  <option value="Regular">Regular</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <FiChevronDown className="crs-mgmt-select-arrow" />
              </div>
            </div>

            {loading ? (
              <Loader message="Loading courses..." minHeight="320px" />
            ) : filteredCourses.length === 0 ? (
              <div className="crs-mgmt-content-area">
                <p className="crs-mgmt-empty-message">
                  No courses found. Please add a course or adjust your search filters.
                </p>
              </div>
            ) : (
              <div className="crs-mgmt-table-wrapper">
                <div className="crs-mgmt-table-header-row">
                  <div className="crs-mgmt-th">#</div>
                  <div className="crs-mgmt-th">COURSE NAME</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">DURATION</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">CATEGORY</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">TYPE</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">FEE</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">SYLLABUS</div>
                  <div className="crs-mgmt-th crs-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="crs-mgmt-table-body">
                  {filteredCourses.map((item, idx) => (
                    <div key={item.id} className="crs-mgmt-table-row">
                      <div className="crs-mgmt-td" data-label="#">
                        {idx + 1}
                      </div>

                      <div className="crs-mgmt-td" data-label="Course Name">
                        <div className="crs-mgmt-module-cell">
                          <span className="crs-mgmt-module-avatar">
                            {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                          </span>
                          <span className="crs-mgmt-module-name-text">{item.name}</span>
                        </div>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-td-center" data-label="Duration">
                        <span className="crs-mgmt-course-pill">
                          {item.duration || '—'}
                        </span>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-td-center" data-label="Category">
                        <span className="crs-mgmt-cat-pill">
                          {item.categoryName}
                        </span>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-td-center" data-label="Type">
                        <span className="crs-mgmt-type-badge">
                          {item.courseType}
                        </span>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-td-center" data-label="Fee">
                        <span className="crs-mgmt-fee-text">
                          ₹{Number(item.courseFee || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-td-center" data-label="Syllabus">
                        <span
                          className={`crs-mgmt-doc-badge ${
                            item.syllabus ? 'crs-mgmt-doc-badge--has-file' : ''
                          }`}
                          title={item.syllabus || 'No File'}
                        >
                          {item.syllabus ? 'Uploaded' : 'No File'}
                        </span>
                      </div>

                      <div className="crs-mgmt-td crs-mgmt-col-actions" data-label="Actions">
                        <button
                          type="button"
                          className="crs-mgmt-text-action crs-mgmt-text-action--view"
                          onClick={() => handleViewCourse(item)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="crs-mgmt-text-action crs-mgmt-text-action--edit"
                          onClick={() => handleOpenEditCourse(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="crs-mgmt-text-action crs-mgmt-text-action--delete"
                          onClick={() => handleDeleteCourse(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="crs-mgmt-pagination-bar">
                  <span className="crs-mgmt-pagination-text">1 of 1</span>
                  <div className="crs-mgmt-pagination-controls">
                    <button type="button" className="crs-mgmt-page-btn" disabled>
                      <FiChevronLeft />
                    </button>
                    <button type="button" className="crs-mgmt-page-btn" disabled>
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW COURSE & EDIT COURSE FORM */}
        {(activeTab === 'new-course' || activeTab === 'edit-course') && (
          <form
            className="crs-mgmt-form-layout"
            onSubmit={
              activeTab === 'new-course'
                ? handleCreateCourse
                : handleSaveEditedCourse
            }
          >
            <div className="crs-mgmt-form-body">
              <h2 className="crs-mgmt-section-heading">Course Details</h2>

              <div className="crs-mgmt-form-row">
                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Course Name<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="crs-mgmt-text-input"
                    placeholder="Enter Course Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Duration<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <div className="crs-mgmt-duration-group">
                    <input
                      type="number"
                      min="1"
                      className="crs-mgmt-text-input"
                      placeholder="e.g. 3"
                      value={formDurationValue}
                      onChange={(e) => setFormDurationValue(e.target.value)}
                      required
                    />
                    <div className="crs-mgmt-select-wrapper crs-mgmt-select-wrapper--unit">
                      <select
                        className="crs-mgmt-select-input"
                        value={formDurationUnit}
                        onChange={(e) => setFormDurationUnit(e.target.value)}
                      >
                        <option value="Months">Months</option>
                        <option value="Years">Years</option>
                        <option value="Weeks">Weeks</option>
                      </select>
                      <FiChevronDown className="crs-mgmt-select-arrow" />
                    </div>
                  </div>
                </div>

                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Category<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <div className="crs-mgmt-select-wrapper">
                    <select
                      className="crs-mgmt-select-input"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="crs-mgmt-select-arrow" />
                  </div>
                </div>
              </div>

              <div className="crs-mgmt-form-row">
                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Course Type<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <div className="crs-mgmt-select-wrapper">
                    <select
                      className="crs-mgmt-select-input"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      required
                    >
                      <option value="Regular">Regular</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    <FiChevronDown className="crs-mgmt-select-arrow" />
                  </div>
                </div>

                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Course Fee (INR)<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="crs-mgmt-text-input"
                    placeholder="Enter Course Fee"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    required
                  />
                </div>

                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Course Syllabus{' '}
                    <span className="crs-mgmt-label-hint">
                      (Optional - PDF only, Max 10MB)
                    </span>
                  </label>
                  <label className="crs-mgmt-file-dropzone">
                    <span
                      className={`crs-mgmt-file-placeholder ${
                        formSyllabusName ? 'crs-mgmt-file-placeholder--active' : ''
                      }`}
                    >
                      {formSyllabusName || 'Upload PDF Syllabus'}
                    </span>
                    <HiOutlineArrowUpTray className="crs-mgmt-file-icon" />
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="crs-mgmt-hidden-file-input"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Description Full-width Row */}
              <div className="crs-mgmt-form-full-row">
                <div className="crs-mgmt-input-group">
                  <label className="crs-mgmt-label">
                    Description<span className="crs-mgmt-required-star">*</span>
                  </label>
                  <textarea
                    rows={4}
                    className="crs-mgmt-textarea"
                    placeholder="Enter Course Description..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="crs-mgmt-form-footer">
              <button
                type="button"
                className="crs-mgmt-cancel-btn"
                onClick={handleBackToCourses}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="crs-mgmt-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : activeTab === 'new-course'
                  ? 'Create Course'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* VIEW COURSE MODAL */}
      {viewingCourse && (
        <div
          className="crs-mgmt-modal-backdrop"
          onClick={() => setViewingCourse(null)}
        >
          <div
            className="crs-mgmt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="crs-mgmt-modal-header">
              <h2 className="crs-mgmt-modal-title">{viewingCourse.name}</h2>
              <button
                type="button"
                className="crs-mgmt-modal-close-top"
                onClick={() => setViewingCourse(null)}
              >
                <span>&lt; Close</span>
              </button>
            </div>

            <div className="crs-mgmt-modal-details-grid">
              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Course Name:</span>
                <span>{viewingCourse.name}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Duration:</span>
                <span>{viewingCourse.duration}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Category:</span>
                <span>{viewingCourse.categoryName}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Course Type:</span>
                <span>{viewingCourse.courseType}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Course Fee:</span>
                <span>₹{Number(viewingCourse.courseFee || 0).toLocaleString('en-IN')}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">Created:</span>
                <span>{viewingCourse.createdAt || '-'}</span>
              </div>

              <div className="crs-mgmt-modal-detail-item">
                <span className="crs-mgmt-modal-detail-label">ID:</span>
                <span>{viewingCourse.code}</span>
              </div>
            </div>

            <div className="crs-mgmt-modal-subcard">
              <h3 className="crs-mgmt-modal-subcard-title">Course Description</h3>
              <p className="crs-mgmt-modal-subcard-text">
                {viewingCourse.description || 'No description provided.'}
              </p>

              {viewingCourse.syllabus && (
                <div className="crs-mgmt-modal-file-info">
                  <strong>Attached Syllabus:</strong> {viewingCourse.syllabus}
                </div>
              )}
            </div>

            <div className="crs-mgmt-modal-footer">
              <button
                type="button"
                className="crs-mgmt-modal-close-btn"
                onClick={() => setViewingCourse(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="crs-mgmt-modal-edit-btn"
                onClick={() => handleOpenEditCourse(viewingCourse)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
