import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './Categories.css';
import { LuX, LuSearch } from 'react-icons/lu';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminService from '../../../services/admin-api-services/AdminService';
import { useToast } from '../../../components/common/Toast';

const Categories = () => {
  const { showToast, ToastContainer } = useToast();
  const {
    createcategory,
    takecategories,
    removecategory,
    takebranch,
    takecategorybyid,
    updatecategory,
  } = AdminService();

  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'new-category' | 'edit-category'
  const [viewingCategory, setViewingCategory] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  // Form states (Add & Edit)
  const [formName, setFormName] = useState('');
  const [formSelectedBranches, setFormSelectedBranches] = useState([]); // Array of { _id, branchName }
  const [formCourses, setFormCourses] = useState([]); // Array of { _id, courseName }

  const [categories, setCategories] = useState([]);
  const [availableBranches, setAvailableBranches] = useState([]);

  // Normalize category document from API
  const normalizeCategory = useCallback((c, branchLookup = []) => {
    const normalizedBranches = Array.isArray(c.branch)
      ? c.branch
          .map((b) => {
            if (typeof b === 'object' && b !== null) {
              return { _id: b._id, branchName: b.branchName || 'Branch' };
            }
            const found = branchLookup.find(
              (item) => String(item._id) === String(b)
            );
            return found
              ? { _id: found._id, branchName: found.branchName }
              : { _id: b, branchName: 'Branch' };
          })
          .filter(Boolean)
      : [];

    const normalizedCourses = Array.isArray(c.courses)
      ? c.courses
          .filter((course) => course && !course.isDeleted)
          .map((course) =>
            typeof course === 'object' && course !== null
              ? { _id: course._id, courseName: course.courseName || 'Course' }
              : { _id: course, courseName: 'Course' }
          )
      : [];

    const createdDate = c.createdAt
      ? new Date(c.createdAt).toLocaleDateString('en-US')
      : '';

    return {
      id: c._id,
      code: c._id ? c._id.slice(-6) : '',
      name: c.categoryName || '',
      branches: normalizedBranches,
      totalCourses: c.totalCourses ?? normalizedCourses.length,
      createdAt: createdDate,
      courses: normalizedCourses,
    };
  }, []);

  // Load categories & branches on mount
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoriesRes, branchesRes] = await Promise.allSettled([
        takecategories(),
        takebranch(),
      ]);

      let activeBranches = [];
      if (branchesRes.status === 'fulfilled') {
        const rawBranches = Array.isArray(branchesRes.value)
          ? branchesRes.value
          : branchesRes.value?.branches || branchesRes.value?.data || [];
        activeBranches = rawBranches.filter(
          (b) => b.isActive !== false && b.isDeleted !== true
        );
        setAvailableBranches(activeBranches);
      }

      if (categoriesRes.status === 'fulfilled') {
        const rawCategories = Array.isArray(categoriesRes.value)
          ? categoriesRes.value
          : categoriesRes.value?.categories || categoriesRes.value?.data || [];
        setCategories(
          rawCategories.map((c) => normalizeCategory(c, activeBranches))
        );
      } else {
        console.error('Failed to load categories:', categoriesRes.reason);
        showToast('Unable to load categories', 'error');
      }
    } catch (error) {
      console.error('Failed to load categories data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeCategory, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesBranch =
        branchFilter === 'All Branches' ||
        cat.branches.some((b) => b._id === branchFilter);
      return matchesSearch && matchesBranch;
    });
  }, [categories, searchQuery, branchFilter]);

  const resetForm = () => {
    setFormName('');
    setFormSelectedBranches([]);
    setFormCourses([]);
    setEditingCategoryId(null);
  };

  const handleOpenNewCategory = () => {
    resetForm();
    setViewingCategory(null);
    setActiveTab('new-category');
  };

  const handleOpenEditCategory = async (categoryItem) => {
    setViewingCategory(null);
    setEditingCategoryId(categoryItem.id);
    setFormName(categoryItem.name);
    setFormSelectedBranches([...categoryItem.branches]);
    setFormCourses([...(categoryItem.courses || [])]);
    setActiveTab('edit-category');

    // Fetch latest details to ensure all populated fields
    try {
      const res = await takecategorybyid(categoryItem.id);
      const data = res?.category || res?.data || res;
      if (data) {
        const fullCat = normalizeCategory(data, availableBranches);
        setFormName(fullCat.name);
        setFormSelectedBranches(fullCat.branches);
        setFormCourses(fullCat.courses);
      }
    } catch (err) {
      console.error('Failed to fetch full category details:', err);
    }
  };

  const handleViewCategory = async (categoryItem) => {
    setViewingCategory(categoryItem);
    try {
      const res = await takecategorybyid(categoryItem.id);
      const data = res?.category || res?.data || res;
      if (data) {
        setViewingCategory(normalizeCategory(data, availableBranches));
      }
    } catch (err) {
      console.error('Failed to fetch category details:', err);
    }
  };

  const handleBackToCategories = () => {
    resetForm();
    setViewingCategory(null);
    setActiveTab('categories');
  };

  const handleAddBranchToForm = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const alreadySelected = formSelectedBranches.some((b) => b._id === selectedId);
    if (alreadySelected) return;

    const branchObj = availableBranches.find((b) => b._id === selectedId);
    if (branchObj) {
      setFormSelectedBranches((prev) => [
        ...prev,
        { _id: branchObj._id, branchName: branchObj.branchName },
      ]);
    }
    e.target.value = '';
  };

  const handleRemoveBranchFromForm = (branchId) => {
    setFormSelectedBranches((prev) => prev.filter((b) => b._id !== branchId));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Please enter category name', 'warning');
      return;
    }
    if (formSelectedBranches.length === 0) {
      showToast('Please select at least one branch', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        categoryName: formName.trim().toUpperCase(),
        branch: formSelectedBranches.map((b) => b._id),
      };

      const res = await createcategory(payload);
      const created = res?.data || res?.category || res;

      setCategories((prev) => [
        normalizeCategory(created, availableBranches),
        ...prev,
      ]);
      showToast('Category created successfully!', 'success');
      resetForm();
      setActiveTab('categories');
    } catch (error) {
      console.error('Error creating category:', error);
      showToast(
        error?.response?.data?.message || 'Failed to create category',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditedCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim() || formSelectedBranches.length === 0 || !editingCategoryId || submitting)
      return;

    setSubmitting(true);
    try {
      const payload = {
        categoryName: formName.trim().toUpperCase(),
        branch: formSelectedBranches.map((b) => b._id),
        courses: formCourses.map((c) => c._id),
      };

      const res = await updatecategory(editingCategoryId, payload);
      const updated = res?.data || res?.category || res;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategoryId
            ? normalizeCategory(updated, availableBranches)
            : c
        )
      );
      showToast('Category updated successfully!', 'success');
      resetForm();
      setActiveTab('categories');
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(
        error?.response?.data?.message || 'Failed to update category',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await removecategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (viewingCategory && viewingCategory.id === id) {
        setViewingCategory(null);
      }
      showToast('Category deleted successfully.', 'success');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(
        error?.response?.data?.message || 'Failed to delete category',
        'error'
      );
    }
  };

  const handleExportCSV = () => {
    if (filteredCategories.length === 0) {
      showToast('No categories to export.', 'warning');
      return;
    }
    const headers = ['#', 'Category Name', 'Branches', 'Total Courses', 'Created'];
    const rows = filteredCategories.map((c, idx) => [
      idx + 1,
      c.name,
      c.branches.map((b) => b.branchName).join('; '),
      c.totalCourses,
      c.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'categories_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Categories exported to CSV.', 'success');
  };

  return (
    <div className="cat-mgmt-container">
      <ToastContainer />

      {/* Outer Toolbar */}
      <div className="cat-mgmt-toolbar">
        <div className="cat-mgmt-tab-group">
          <button
            type="button"
            className={`cat-mgmt-tab-btn ${
              activeTab === 'categories' ? 'cat-mgmt-tab-btn--active' : ''
            }`}
            onClick={handleBackToCategories}
          >
            Categories List
          </button>
          <button
            type="button"
            className={`cat-mgmt-tab-btn ${
              activeTab === 'new-category' || activeTab === 'edit-category'
                ? 'cat-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenNewCategory}
          >
            {activeTab === 'edit-category' ? 'Edit Category' : 'New Category'}
          </button>
        </div>

        <button
          type="button"
          className="cat-mgmt-export-btn"
          onClick={handleExportCSV}
          title="Export Categories to CSV"
        >
          <HiOutlineArrowDownTray className="cat-mgmt-export-icon" />
          <span>Export</span>
        </button>
      </div>

      {/* Main White Card Container */}
      <main className="cat-mgmt-panel">
        {/* CATEGORIES LIST VIEW */}
        {activeTab === 'categories' && (
          <>
            <div className="cat-mgmt-filter-bar">
              <div className="cat-mgmt-search-wrapper">
                <LuSearch className="cat-mgmt-search-icon" />
                <input
                  type="text"
                  className="cat-mgmt-search-input"
                  placeholder="Search Categories"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="cat-mgmt-filter-select-wrapper">
                <select
                  className="cat-mgmt-filter-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="All Branches">All Branches</option>
                  {availableBranches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="cat-mgmt-select-arrow" />
              </div>
            </div>

            {loading ? (
              <div className="cat-mgmt-content-area">
                <p className="cat-mgmt-empty-message">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="cat-mgmt-content-area">
                <p className="cat-mgmt-empty-message">
                  No categories found. Please add a category or adjust your search filters.
                </p>
              </div>
            ) : (
              <div className="cat-mgmt-table-wrapper">
                <div className="cat-mgmt-table-header-row">
                  <div className="cat-mgmt-th">#</div>
                  <div className="cat-mgmt-th">CATEGORY NAME</div>
                  <div className="cat-mgmt-th cat-mgmt-th-center">BRANCH</div>
                  <div className="cat-mgmt-th cat-mgmt-th-center">TOTAL COURSES</div>
                  <div className="cat-mgmt-th cat-mgmt-th-center">CREATED</div>
                  <div className="cat-mgmt-th cat-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="cat-mgmt-table-body">
                  {filteredCategories.map((item, idx) => (
                    <div key={item.id} className="cat-mgmt-table-row">
                      <div className="cat-mgmt-td" data-label="#">
                        {idx + 1}
                      </div>

                      <div className="cat-mgmt-td" data-label="Category Name">
                        <div className="cat-mgmt-module-cell">
                          <span className="cat-mgmt-module-avatar">
                            {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                          </span>
                          <span className="cat-mgmt-module-name-text">{item.name}</span>
                        </div>
                      </div>

                      <div className="cat-mgmt-td cat-mgmt-td-center" data-label="Branch">
                        <div className="cat-mgmt-course-badges">
                          {item.branches.length > 0 ? (
                            item.branches.map((b) => (
                              <span key={b._id} className="cat-mgmt-course-pill">
                                {b.branchName}
                              </span>
                            ))
                          ) : (
                            <span className="cat-mgmt-placeholder-italic">No Branch</span>
                          )}
                        </div>
                      </div>

                      <div className="cat-mgmt-td cat-mgmt-td-center" data-label="Total Courses">
                        <span className="cat-mgmt-topic-badge">{item.totalCourses}</span>
                      </div>

                      <div className="cat-mgmt-td cat-mgmt-td-center" data-label="Created">
                        <span className="cat-mgmt-date-text">{item.createdAt || '-'}</span>
                      </div>

                      <div className="cat-mgmt-td cat-mgmt-col-actions" data-label="Actions">
                        <button
                          type="button"
                          className="cat-mgmt-text-action cat-mgmt-text-action--view"
                          onClick={() => handleViewCategory(item)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="cat-mgmt-text-action cat-mgmt-text-action--edit"
                          onClick={() => handleOpenEditCategory(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="cat-mgmt-text-action cat-mgmt-text-action--delete"
                          onClick={() => handleDeleteCategory(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cat-mgmt-pagination-bar">
                  <span className="cat-mgmt-pagination-text">1 of 1</span>
                  <div className="cat-mgmt-pagination-controls">
                    <button type="button" className="cat-mgmt-page-btn" disabled>
                      <FiChevronLeft />
                    </button>
                    <button type="button" className="cat-mgmt-page-btn" disabled>
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW CATEGORY & EDIT CATEGORY FORM */}
        {(activeTab === 'new-category' || activeTab === 'edit-category') && (
          <form
            className="cat-mgmt-form-layout"
            onSubmit={
              activeTab === 'new-category'
                ? handleCreateCategory
                : handleSaveEditedCategory
            }
          >
            <div className="cat-mgmt-form-body">
              <h2 className="cat-mgmt-section-heading">Category Details</h2>

              <div className="cat-mgmt-form-row">
                <div className="cat-mgmt-input-group">
                  <label className="cat-mgmt-label">
                    Category Name<span className="cat-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="cat-mgmt-text-input"
                    placeholder="Enter Category Name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>

                <div className="cat-mgmt-input-group">
                  <label className="cat-mgmt-label">Total Courses</label>
                  <input
                    type="text"
                    className="cat-mgmt-text-input cat-mgmt-text-input--readonly"
                    value={activeTab === 'edit-category' ? formCourses.length : 0}
                    readOnly
                  />
                </div>

                <div className="cat-mgmt-input-group">
                  <label className="cat-mgmt-label">
                    Select Branches<span className="cat-mgmt-required-star">*</span>
                  </label>
                  <div className="cat-mgmt-select-wrapper">
                    <select
                      className="cat-mgmt-select-input"
                      value=""
                      onChange={handleAddBranchToForm}
                    >
                      <option value="">-- Add a Branch --</option>
                      {availableBranches.map((branch) => (
                        <option
                          key={branch._id}
                          value={branch._id}
                          disabled={formSelectedBranches.some(
                            (sb) => sb._id === branch._id
                          )}
                        >
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="cat-mgmt-select-arrow" />
                  </div>
                </div>
              </div>

              {/* Full-width Selected Branches Row */}
              <div className="cat-mgmt-form-full-row">
                <div className="cat-mgmt-input-group">
                  <label className="cat-mgmt-label">
                    Selected Branches<span className="cat-mgmt-required-star">*</span>
                  </label>
                  <div className="cat-mgmt-selected-courses-box">
                    {formSelectedBranches.length === 0 ? (
                      <span className="cat-mgmt-placeholder-italic">
                        No branches selected yet.
                      </span>
                    ) : (
                      formSelectedBranches.map((branch) => (
                        <span key={branch._id} className="cat-mgmt-course-pill">
                          {branch.branchName}
                          <button
                            type="button"
                            className="cat-mgmt-pill-remove"
                            onClick={() =>
                              handleRemoveBranchFromForm(branch._id)
                            }
                            title="Remove branch"
                          >
                            <LuX />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Added Courses List (Shown in Edit Mode if courses exist) */}
              {activeTab === 'edit-category' && formCourses.length > 0 && (
                <div className="cat-mgmt-form-full-row">
                  <div className="cat-mgmt-input-group">
                    <label className="cat-mgmt-label">Added Courses</label>
                    <div className="cat-mgmt-topics-grid">
                      {formCourses.map((course) => (
                        <div key={course._id} className="cat-mgmt-topic-chip">
                          <span>{course.courseName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="cat-mgmt-form-footer">
              <button
                type="button"
                className="cat-mgmt-cancel-btn"
                onClick={handleBackToCategories}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cat-mgmt-submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : activeTab === 'new-category'
                  ? 'Create Category'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* VIEW CATEGORY MODAL */}
      {viewingCategory && (
        <div
          className="cat-mgmt-modal-backdrop"
          onClick={() => setViewingCategory(null)}
        >
          <div
            className="cat-mgmt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cat-mgmt-modal-header">
              <h2 className="cat-mgmt-modal-title">{viewingCategory.name}</h2>
              <button
                type="button"
                className="cat-mgmt-modal-close-top"
                onClick={() => setViewingCategory(null)}
              >
                <span>&lt; Close</span>
              </button>
            </div>

            <div className="cat-mgmt-modal-details-grid">
              <div className="cat-mgmt-modal-detail-item">
                <span className="cat-mgmt-modal-detail-label">Category Name:</span>
                <span>{viewingCategory.name}</span>
              </div>

              <div className="cat-mgmt-modal-detail-item">
                <span className="cat-mgmt-modal-detail-label">Total Courses:</span>
                <span>{viewingCategory.totalCourses}</span>
              </div>

              <div className="cat-mgmt-modal-detail-item">
                <span className="cat-mgmt-modal-detail-label">Branches:</span>
                <span>
                  {viewingCategory.branches.length > 0
                    ? viewingCategory.branches.map((b) => b.branchName).join(', ')
                    : 'None'}
                </span>
              </div>

              <div className="cat-mgmt-modal-detail-item">
                <span className="cat-mgmt-modal-detail-label">Created:</span>
                <span>{viewingCategory.createdAt || '-'}</span>
              </div>

              <div className="cat-mgmt-modal-detail-item">
                <span className="cat-mgmt-modal-detail-label">ID:</span>
                <span>{viewingCategory.code}</span>
              </div>
            </div>

            <div className="cat-mgmt-modal-subcard">
              <h3 className="cat-mgmt-modal-subcard-title">Assigned Courses</h3>
              {viewingCategory.courses && viewingCategory.courses.length > 0 ? (
                <div className="cat-mgmt-modal-topics-list">
                  {viewingCategory.courses.map((course) => (
                    <span
                      key={course._id}
                      className="cat-mgmt-modal-topic-tag"
                    >
                      {course.courseName}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="cat-mgmt-modal-subcard-text">
                  No courses assigned to this category yet.
                </p>
              )}
            </div>

            <div className="cat-mgmt-modal-footer">
              <button
                type="button"
                className="cat-mgmt-modal-close-btn"
                onClick={() => setViewingCategory(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="cat-mgmt-modal-edit-btn"
                onClick={() => handleOpenEditCategory(viewingCategory)}
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

export default Categories;
