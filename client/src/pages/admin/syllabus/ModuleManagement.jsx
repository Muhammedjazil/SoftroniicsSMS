import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './ModuleManagement.css';
import { LuUser, LuX, LuSearch } from 'react-icons/lu';
import { HiOutlineArrowDownTray, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminService from '../../../services/admin-api-services/AdminService'; // Adjust path if needed

const SyllabusManagement = () => {
  const {
    takemodules,
    takecoursesformodules,
    createmodule,
    updatemodule,
    removemodule,
  } = AdminService();

  const [activeTab, setActiveTab] = useState('modules'); // 'modules' | 'new-module' | 'edit-module'
  const [viewingModule, setViewingModule] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('All Courses');

  // Form states (Add & Edit)
  const [formName, setFormName] = useState('');
  const [formSelectedCourses, setFormSelectedCourses] = useState([]); // Array of { _id, courseName }
  const [formFileName, setFormFileName] = useState('');
  const [formTopics, setFormTopics] = useState([]); // Array of { _id, topicName }

  const [modules, setModules] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  // Normalize module document from API
  const normalizeModule = useCallback((m) => {
    const normalizedCourses = Array.isArray(m.course)
      ? m.course.map((c) =>
          typeof c === 'object' && c !== null
            ? { _id: c._id, courseName: c.courseName || 'Untitled Course' }
            : { _id: c, courseName: 'Course' }
        )
      : [];

    const normalizedTopics = Array.isArray(m.topics)
      ? m.topics
          .filter((t) => t && !t.isDeleted)
          .map((t) =>
            typeof t === 'object' && t !== null
              ? { _id: t._id, topicName: t.topicName || 'Topic' }
              : { _id: t, topicName: 'Topic' }
          )
      : [];

    const createdDate = m.createdAt
      ? new Date(m.createdAt).toLocaleDateString('en-US')
      : '';

    return {
      id: m._id,
      code: m._id ? m._id.slice(-6) : '',
      name: m.moduleName || '',
      courses: normalizedCourses,
      addedTopics: normalizedTopics.length || m.totalTopics || 0,
      document: m.moduleImage || '',
      createdAt: createdDate,
      topicsList: normalizedTopics,
    };
  }, []);

  // Load modules & courses on mount
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [modulesRes, coursesRes] = await Promise.all([
        takemodules(),
        takecoursesformodules(),
      ]);

      const rawModules = Array.isArray(modulesRes) ? modulesRes : modulesRes?.data || [];
      const rawCourses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];

      setModules(rawModules.map(normalizeModule));
      setAvailableCourses(rawCourses);
    } catch (error) {
      console.error('Failed to load modules data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeModule]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch = mod.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesCourse =
        courseFilter === 'All Courses' ||
        mod.courses.some((c) => c._id === courseFilter);
      return matchesSearch && matchesCourse;
    });
  }, [modules, searchQuery, courseFilter]);

  const resetForm = () => {
    setFormName('');
    setFormSelectedCourses([]);
    setFormFileName('');
    setFormTopics([]);
    setEditingModuleId(null);
  };

  const handleOpenNewModule = () => {
    resetForm();
    setViewingModule(null);
    setActiveTab('new-module');
  };

  const handleOpenEditModule = (moduleItem) => {
    setViewingModule(null);
    setEditingModuleId(moduleItem.id);
    setFormName(moduleItem.name);
    setFormSelectedCourses([...moduleItem.courses]);
    setFormFileName(moduleItem.document || '');
    setFormTopics([...(moduleItem.topicsList || [])]);
    setActiveTab('edit-module');
  };

  const handleViewModule = (moduleItem) => {
    setViewingModule(moduleItem);
  };

  const handleBackToModules = () => {
    resetForm();
    setViewingModule(null);
    setActiveTab('modules');
  };

  const handleAddCourseToForm = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const alreadySelected = formSelectedCourses.some((c) => c._id === selectedId);
    if (alreadySelected) return;

    const courseObj = availableCourses.find((c) => c._id === selectedId);
    if (courseObj) {
      setFormSelectedCourses((prev) => [
        ...prev,
        { _id: courseObj._id, courseName: courseObj.courseName },
      ]);
    }
  };

  const handleRemoveCourseFromForm = (courseIdToRemove) => {
    setFormSelectedCourses((prev) => prev.filter((c) => c._id !== courseIdToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormFileName(e.target.files[0].name);
    }
  };

  const handleRemoveTopic = (topicIdToRemove) => {
    setFormTopics((prev) => prev.filter((t) => t._id !== topicIdToRemove));
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!formName.trim() || formSelectedCourses.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        moduleName: formName.trim().toUpperCase(),
        course: formSelectedCourses.map((c) => c._id),
        moduleImage: formFileName || '',
      };

      const res = await createmodule(payload);
      const created = res?.data || res;

      setModules((prev) => [normalizeModule(created), ...prev]);
      resetForm();
      setActiveTab('modules');
    } catch (error) {
      console.error('Error creating module:', error);
      alert(error?.response?.data?.message || 'Failed to create module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditedModule = async (e) => {
    e.preventDefault();
    if (!formName.trim() || formSelectedCourses.length === 0 || !editingModuleId || submitting)
      return;

    setSubmitting(true);
    try {
      const payload = {
        moduleName: formName.trim().toUpperCase(),
        course: formSelectedCourses.map((c) => c._id),
        moduleImage: formFileName || '',
        topics: formTopics.map((t) => t._id),
      };

      const res = await updatemodule(editingModuleId, payload);
      const updated = res?.data || res;

      setModules((prev) =>
        prev.map((m) => (m.id === editingModuleId ? normalizeModule(updated) : m))
      );
      resetForm();
      setActiveTab('modules');
    } catch (error) {
      console.error('Error updating module:', error);
      alert(error?.response?.data?.message || 'Failed to update module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (id) => {
    try {
      await removemodule(id);
      setModules((prev) => prev.filter((m) => m.id !== id));
      if (viewingModule && viewingModule.id === id) {
        setViewingModule(null);
      }
    } catch (error) {
      console.error('Error deleting module:', error);
      alert(error?.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleExportCSV = () => {
    const headers = ['#', 'Module Name', 'Courses', 'Total Topics', 'Document', 'Created'];
    const rows = filteredModules.map((m, idx) => [
      idx + 1,
      m.name,
      m.courses.map((c) => c.courseName).join('; '),
      m.addedTopics,
      m.document || 'No File',
      m.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'modules_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="syl-mgmt-container">
      

      {/* Outer Toolbar */}
      <div className="syl-mgmt-toolbar">
        <div className="syl-mgmt-tab-group">
          <button
            type="button"
            className={`syl-mgmt-tab-btn ${activeTab === 'modules' ? 'syl-mgmt-tab-btn--active' : ''}`}
            onClick={handleBackToModules}
          >
            Modules List
          </button>
          <button
            type="button"
            className={`syl-mgmt-tab-btn ${
              activeTab === 'new-module' || activeTab === 'edit-module'
                ? 'syl-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenNewModule}
          >
            {activeTab === 'edit-module' ? 'Edit Module' : 'New Module'}
          </button>
        </div>

        <button
          type="button"
          className="syl-mgmt-export-btn"
          onClick={handleExportCSV}
        >
          <HiOutlineArrowDownTray className="syl-mgmt-export-icon" />
          <span>Export</span>
        </button>
      </div>

      {/* Main White Card Container */}
      <main className="syl-mgmt-panel">
        {/* MODULES LIST VIEW */}
        {activeTab === 'modules' && (
          <>
            <div className="syl-mgmt-filter-bar">
              <div className="syl-mgmt-search-wrapper">
                <LuSearch className="syl-mgmt-search-icon" />
                <input
                  type="text"
                  className="syl-mgmt-search-input"
                  placeholder="Search Modules"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="syl-mgmt-filter-select-wrapper">
                <select
                  className="syl-mgmt-filter-select"
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="All Courses">All Courses</option>
                  {availableCourses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="syl-mgmt-select-arrow" />
              </div>
            </div>

            {loading ? (
              <div className="syl-mgmt-content-area">
                <p className="syl-mgmt-empty-message">Loading modules...</p>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="syl-mgmt-content-area">
                <p className="syl-mgmt-empty-message">
                  No modules found. Please add a module or adjust your search filters.
                </p>
              </div>
            ) : (
              <div className="syl-mgmt-table-wrapper">
                <div className="syl-mgmt-table-header-row">
                  <div className="syl-mgmt-th">#</div>
                  <div className="syl-mgmt-th">MODULE NAME</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">COURSE</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">TOTAL TOPICS</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">DOCUMENT</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">CREATED</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="syl-mgmt-table-body">
                  {filteredModules.map((item, idx) => (
                    <div key={item.id} className="syl-mgmt-table-row">
                      <div className="syl-mgmt-td" data-label="#">
                        {idx + 1}
                      </div>

                      <div className="syl-mgmt-td" data-label="Module Name">
                        <div className="syl-mgmt-module-cell">
                          <span className="syl-mgmt-module-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="syl-mgmt-module-name-text">{item.name}</span>
                        </div>
                      </div>

                      <div className="syl-mgmt-td syl-mgmt-td-center" data-label="Course">
                        <div className="syl-mgmt-course-badges">
                          {item.courses.map((courseObj) => (
                            <span key={courseObj._id} className="syl-mgmt-course-pill">
                              {courseObj.courseName}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="syl-mgmt-td syl-mgmt-td-center" data-label="Total Topics">
                        <span className="syl-mgmt-topic-badge">{item.addedTopics}</span>
                      </div>

                      <div className="syl-mgmt-td syl-mgmt-td-center" data-label="Document">
                        <span
                          className={`syl-mgmt-doc-badge ${
                            item.document ? 'syl-mgmt-doc-badge--has-file' : ''
                          }`}
                          title={item.document || 'No File'}
                        >
                          {item.document || 'No File'}
                        </span>
                      </div>

                      <div className="syl-mgmt-td syl-mgmt-td-center" data-label="Created">
                        <span className="syl-mgmt-date-text">{item.createdAt}</span>
                      </div>

                      <div className="syl-mgmt-td syl-mgmt-col-actions" data-label="Actions">
                        <button
                          type="button"
                          className="syl-mgmt-text-action syl-mgmt-text-action--view"
                          onClick={() => handleViewModule(item)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="syl-mgmt-text-action syl-mgmt-text-action--edit"
                          onClick={() => handleOpenEditModule(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="syl-mgmt-text-action syl-mgmt-text-action--delete"
                          onClick={() => handleDeleteModule(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="syl-mgmt-pagination-bar">
                  <span className="syl-mgmt-pagination-text">1 of 1</span>
                  <div className="syl-mgmt-pagination-controls">
                    <button type="button" className="syl-mgmt-page-btn" disabled>
                      <FiChevronLeft />
                    </button>
                    <button type="button" className="syl-mgmt-page-btn" disabled>
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW MODULE & EDIT MODULE FORM */}
        {(activeTab === 'new-module' || activeTab === 'edit-module') && (
          <form
            className="syl-mgmt-form-layout"
            onSubmit={activeTab === 'new-module' ? handleCreateModule : handleSaveEditedModule}
          >
            <div className="syl-mgmt-form-body">
              <h2 className="syl-mgmt-section-heading">Module Details</h2>

              <div className="syl-mgmt-form-row">
                <div className="syl-mgmt-input-group">
                  <label className="syl-mgmt-label">
                    Module Name<span className="syl-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="syl-mgmt-text-input"
                    placeholder="Enter Module Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="syl-mgmt-input-group">
                  <label className="syl-mgmt-label">Total Topics</label>
                  <input
                    type="text"
                    className="syl-mgmt-text-input syl-mgmt-text-input--readonly"
                    value={activeTab === 'edit-module' ? formTopics.length : 0}
                    readOnly
                  />
                </div>

                <div className="syl-mgmt-input-group">
                  <label className="syl-mgmt-label">
                    Select Courses<span className="syl-mgmt-required-star">*</span>
                  </label>
                  <div className="syl-mgmt-select-wrapper">
                    <select
                      className="syl-mgmt-select-input"
                      value=""
                      onChange={handleAddCourseToForm}
                    >
                      <option value="">-- Add a Course --</option>
                      {availableCourses.map((course) => (
                        <option
                          key={course._id}
                          value={course._id}
                          disabled={formSelectedCourses.some((sc) => sc._id === course._id)}
                        >
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="syl-mgmt-select-arrow" />
                  </div>
                </div>
              </div>

              {/* Full-width Selected Courses Row */}
              <div className="syl-mgmt-form-full-row">
                <div className="syl-mgmt-input-group">
                  <label className="syl-mgmt-label">
                    Selected Courses<span className="syl-mgmt-required-star">*</span>
                  </label>
                  <div className="syl-mgmt-selected-courses-box">
                    {formSelectedCourses.length === 0 ? (
                      <span className="syl-mgmt-placeholder-italic">No courses selected yet.</span>
                    ) : (
                      formSelectedCourses.map((course) => (
                        <span key={course._id} className="syl-mgmt-course-pill">
                          {course.courseName}
                          <button
                            type="button"
                            className="syl-mgmt-pill-remove"
                            onClick={() => handleRemoveCourseFromForm(course._id)}
                            title="Remove course"
                          >
                            <LuX />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Module Image/PDF Upload */}
              <div className="syl-mgmt-form-full-row">
                <div className="syl-mgmt-input-group">
                  <label className="syl-mgmt-label">
                    Module Image/PDF{' '}
                    <span className="syl-mgmt-label-hint">
                      (Optional - JPG/PNG/PDF only, Max 10MB)
                    </span>
                  </label>
                  <label className="syl-mgmt-file-dropzone">
                    <span
                      className={`syl-mgmt-file-placeholder ${
                        formFileName ? 'syl-mgmt-file-placeholder--active' : ''
                      }`}
                    >
                      {formFileName || 'Upload Module Image/PDF'}
                    </span>
                    <HiOutlineArrowUpTray className="syl-mgmt-file-icon" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      className="syl-mgmt-hidden-file-input"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Added Topics List (Shown in Edit Mode if topics exist) */}
              {activeTab === 'edit-module' && formTopics.length > 0 && (
                <div className="syl-mgmt-form-full-row">
                  <div className="syl-mgmt-input-group">
                    <label className="syl-mgmt-label">Added Topics</label>
                    <div className="syl-mgmt-topics-grid">
                      {formTopics.map((topic) => (
                        <div key={topic._id} className="syl-mgmt-topic-chip">
                          <span>{topic.topicName}</span>
                          <button
                            type="button"
                            className="syl-mgmt-topic-remove-btn"
                            onClick={() => handleRemoveTopic(topic._id)}
                          >
                            <LuX />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="syl-mgmt-form-footer">
              <button
                type="button"
                className="syl-mgmt-cancel-btn"
                onClick={handleBackToModules}
              >
                Cancel
              </button>
              <button type="submit" className="syl-mgmt-submit-btn" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : activeTab === 'new-module'
                  ? 'Create Module'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* VIEW MODULE MODAL */}
      {viewingModule && (
        <div
          className="syl-mgmt-modal-backdrop"
          onClick={() => setViewingModule(null)}
        >
          <div
            className="syl-mgmt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="syl-mgmt-modal-header">
              <h2 className="syl-mgmt-modal-title">{viewingModule.name}</h2>
              <button
                type="button"
                className="syl-mgmt-modal-close-top"
                onClick={() => setViewingModule(null)}
              >
                <span>&lt; Close</span>
              </button>
            </div>

            <div className="syl-mgmt-modal-details-grid">
              <div className="syl-mgmt-modal-detail-item">
                <span className="syl-mgmt-modal-detail-label">Module Name:</span>
                <span>{viewingModule.name}</span>
              </div>

              <div className="syl-mgmt-modal-detail-item">
                <span className="syl-mgmt-modal-detail-label">Total Topics:</span>
                <span>{viewingModule.addedTopics}</span>
              </div>

              <div className="syl-mgmt-modal-detail-item">
                <span className="syl-mgmt-modal-detail-label">Courses:</span>
                <span>{viewingModule.courses.map((c) => c.courseName).join(', ')}</span>
              </div>

              <div className="syl-mgmt-modal-detail-item">
                <span className="syl-mgmt-modal-detail-label">Created:</span>
                <span>{viewingModule.createdAt}</span>
              </div>

              <div className="syl-mgmt-modal-detail-item">
                <span className="syl-mgmt-modal-detail-label">ID:</span>
                <span>{viewingModule.code}</span>
              </div>
            </div>

            <div className="syl-mgmt-modal-subcard">
              <h3 className="syl-mgmt-modal-subcard-title">Module Document &amp; Topics</h3>
              <p className="syl-mgmt-modal-subcard-text">
                {viewingModule.document
                  ? `Uploaded Document: ${viewingModule.document}`
                  : 'No document uploaded for this module.'}
              </p>

              {viewingModule.topicsList && viewingModule.topicsList.length > 0 && (
                <div className="syl-mgmt-modal-topics-list">
                  {viewingModule.topicsList.map((topic) => (
                    <span key={topic._id} className="syl-mgmt-modal-topic-tag">
                      {topic.topicName}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="syl-mgmt-modal-footer">
              <button
                type="button"
                className="syl-mgmt-modal-close-btn"
                onClick={() => setViewingModule(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="syl-mgmt-modal-edit-btn"
                onClick={() => handleOpenEditModule(viewingModule)}
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

export default SyllabusManagement;