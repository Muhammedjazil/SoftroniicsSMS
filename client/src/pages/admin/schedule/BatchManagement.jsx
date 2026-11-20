import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './BatchManagement.css';
import { LuUser, LuSearch, LuX } from 'react-icons/lu';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminService from "../../../services/admin-api-services/AdminService" // Adjust path if needed

const BatchManagement = () => {
  const {
    takebatches,
    takebranch,
    takeinternsbybranch,
    createbatch,
    updatebatch,
    removebatch,
  } = AdminService();

  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'add-batch' | 'edit-batch'
  const [viewingBatch, setViewingBatch] = useState(null);
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // API Data States
  const [batches, setBatches] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchInternsList, setBranchInternsList] = useState([]);

  // List Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [branchFilter, setBranchFilter] = useState('All Branches');

  // Form States
  const [formBatchName, setFormBatchName] = useState('');
  const [formBranchId, setFormBranchId] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formInterns, setFormInterns] = useState([]);

  // Intern Search States
  const [internSearch, setInternSearch] = useState('');
  const [internAdmissionNumber, setInternAdmissionNumber] = useState('');
  const [internCourseName, setInternCourseName] = useState('');
  const [selectedInternObj, setSelectedInternObj] = useState(null);
  const [showInternSuggestions, setShowInternSuggestions] = useState(false);

  // Helper to normalize intern fields from API
  const normalizeIntern = (intern) => ({
    _id: intern._id || intern.id,
    name: intern.name || 'Unnamed Intern',
    admissionNumber: intern.admissionNo || intern.admissionNumber || 'N/A',
    courseName:
      intern.course?.courseName ||
      intern.course?.name ||
      intern.courseName ||
      (typeof intern.course === 'string' ? intern.course : 'N/A'),
  });

  // Helper to normalize batch fields from API
  const normalizeBatch = useCallback((b) => {
    const branchObj = typeof b.branch === 'object' && b.branch !== null ? b.branch : null;
    const branchId = branchObj ? branchObj._id : b.branch || '';
    const branchLabel = branchObj
      ? branchObj.branchName || branchObj.name || 'Unknown'
      : b.branch || 'Unknown';

    const createdDate = b.createdAt
      ? new Date(b.createdAt).toLocaleDateString('en-US')
      : '';

    return {
      id: b._id,
      code: b._id ? b._id.slice(-6) : '',
      name: b.batchName || '',
      branchId,
      branch: branchLabel,
      status: b.status || 'Active',
      createdAt: createdDate,
      interns: Array.isArray(b.interns) ? b.interns.map(normalizeIntern) : [],
    };
  }, []);

  // Fetch initial batches and branches
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [batchesRes, branchesRes] = await Promise.all([
        takebatches(),
        takebranch(),
      ]);

      const rawBatches = Array.isArray(batchesRes) ? batchesRes : batchesRes?.data || [];
      const rawBranches = Array.isArray(branchesRes) ? branchesRes : branchesRes?.data || [];

      setBatches(rawBatches.map(normalizeBatch));
      setBranches(rawBranches);

      // Default to 'calicut' branch if present
      const calicutBranch = rawBranches.find(
        (br) => (br.branchName || br.name || '').toLowerCase() === 'calicut'
      );
      if (calicutBranch) {
        setBranchFilter(calicutBranch._id);
      }
    } catch (error) {
      console.error('Failed to load batch management data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeBatch]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Fetch interns whenever formBranchId changes
  useEffect(() => {
    if (!formBranchId) {
      setBranchInternsList([]);
      return;
    }

    const fetchBranchInterns = async () => {
      try {
        const res = await takeinternsbybranch(formBranchId);
        const list = Array.isArray(res) ? res : res?.data || [];
        setBranchInternsList(list.map(normalizeIntern));
      } catch (error) {
        console.error('Failed to load interns for branch:', error);
        setBranchInternsList([]);
      }
    };

    fetchBranchInterns();
  }, [formBranchId]);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        batch.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        batch.code.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesStatus = statusFilter === 'All Status' || batch.status === statusFilter;
      const matchesBranch =
        branchFilter === 'All Branches' ||
        batch.branchId === branchFilter ||
        batch.branch.toLowerCase() === branchFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [batches, searchQuery, statusFilter, branchFilter]);

  const branchFilteredInterns = useMemo(() => {
    if (!formBranchId) return [];
    const query = internSearch.toLowerCase().trim();
    return branchInternsList.filter(
      (i) =>
        i.name.toLowerCase().includes(query) ||
        i.admissionNumber.toLowerCase().includes(query)
    );
  }, [formBranchId, branchInternsList, internSearch]);

  const resetForm = () => {
    setFormBatchName('');
    setFormBranchId('');
    setFormStatus('Active');
    setFormInterns([]);
    setInternSearch('');
    setInternAdmissionNumber('');
    setInternCourseName('');
    setSelectedInternObj(null);
    setShowInternSuggestions(false);
    setEditingBatchId(null);
  };

  const handleOpenAddBatch = () => {
    resetForm();
    setViewingBatch(null);
    setActiveTab('add-batch');
  };

  const handleBackToBatches = () => {
    resetForm();
    setViewingBatch(null);
    setActiveTab('batches');
  };

  const handleViewBatch = (batchItem) => {
    setViewingBatch(batchItem);
  };

  const handleOpenEditBatch = (batchItem) => {
    setViewingBatch(null);
    setEditingBatchId(batchItem.id);
    setFormBatchName(batchItem.name);
    setFormBranchId(batchItem.branchId);
    setFormStatus(batchItem.status || 'Active');
    setFormInterns([...batchItem.interns]);
    setActiveTab('edit-batch');
  };

  const handleSelectInternSuggestion = (intern) => {
    setSelectedInternObj(intern);
    setInternSearch(intern.name);
    setInternAdmissionNumber(intern.admissionNumber);
    setInternCourseName(intern.courseName);
    setShowInternSuggestions(false);
  };

  const handleAddIntern = () => {
    if (!selectedInternObj) return;

    const alreadyAdded = formInterns.some((i) => i._id === selectedInternObj._id);
    if (alreadyAdded) return;

    setFormInterns((prev) => [...prev, selectedInternObj]);
    setInternSearch('');
    setInternAdmissionNumber('');
    setInternCourseName('');
    setSelectedInternObj(null);
  };

  const handleRemoveIntern = (internId) => {
    setFormInterns((prev) => prev.filter((intern) => intern._id !== internId));
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    if (!formBatchName.trim() || !formBranchId || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        batchName: formBatchName.trim().toUpperCase(),
        branch: formBranchId,
        status: formStatus || 'Active',
        interns: formInterns.map((i) => i._id),
      };

      const res = await createbatch(payload);
      const created = res?.data || res;

      setBatches((prev) => [normalizeBatch(created), ...prev]);
      handleBackToBatches();
    } catch (error) {
      console.error('Error creating batch:', error);
      alert(error?.response?.data?.message || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEditedBatch = async (e) => {
    e.preventDefault();
    if (!formBatchName.trim() || !formBranchId || !editingBatchId || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        batchName: formBatchName.trim().toUpperCase(),
        branch: formBranchId,
        status: formStatus,
        interns: formInterns.map((i) => i._id),
      };

      const res = await updatebatch(editingBatchId, payload);
      const updated = res?.data || res;

      setBatches((prev) =>
        prev.map((b) => (b.id === editingBatchId ? normalizeBatch(updated) : b))
      );
      handleBackToBatches();
    } catch (error) {
      console.error('Error updating batch:', error);
      alert(error?.response?.data?.message || 'Failed to update batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    try {
      await removebatch(id);
      setBatches((prev) => prev.filter((b) => b.id !== id));
      if (viewingBatch && viewingBatch.id === id) {
        setViewingBatch(null);
      }
    } catch (error) {
      console.error('Error deleting batch:', error);
      alert(error?.response?.data?.message || 'Failed to delete batch');
    }
  };

  return (
    <div className="btc-mgmt-container">
      {/* Header */}
      <header className="btc-mgmt-header">
        <div className="btc-mgmt-title-group">
          <h1 className="btc-mgmt-heading">Batch Management</h1>
          <nav className="btc-mgmt-breadcrumb">
            <span>Batch Management</span>
            <span className="btc-mgmt-breadcrumb-separator">&gt;</span>
            <span>
              {activeTab === 'batches' && 'batches'}
              {activeTab === 'add-batch' && 'new-batch'}
              {activeTab === 'edit-batch' && 'edit-batch'}
            </span>
          </nav>
        </div>

        <div className="btc-mgmt-profile-card">
          <div className="btc-mgmt-profile-avatar">
            <LuUser />
          </div>
          <div className="btc-mgmt-profile-info">
            <span className="btc-mgmt-username">vijitha</span>
            <span className="btc-mgmt-role">super admin</span>
          </div>
        </div>
      </header>

      {/* Outer Toolbar */}
      <div className="btc-mgmt-toolbar">
        <div className="btc-mgmt-tab-group">
          <button
            type="button"
            className={`btc-mgmt-tab-btn ${activeTab === 'batches' ? 'btc-mgmt-tab-btn--active' : ''}`}
            onClick={handleBackToBatches}
          >
            Batches
          </button>
          <button
            type="button"
            className={`btc-mgmt-tab-btn ${
              activeTab === 'add-batch' || activeTab === 'edit-batch'
                ? 'btc-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenAddBatch}
          >
            {activeTab === 'edit-batch' ? 'Edit Batch' : 'New Batch'}
          </button>
        </div>

        <button type="button" className="btc-mgmt-export-btn">
          <HiOutlineArrowDownTray className="btc-mgmt-export-icon" />
          <span>Export</span>
        </button>
      </div>

      {/* Main White Card Container */}
      <main className="btc-mgmt-panel">
        {/* BATCHES LIST VIEW */}
        {activeTab === 'batches' && (
          <>
            <div className="btc-mgmt-filter-bar">
              <div className="btc-mgmt-search-wrapper">
                <LuSearch className="btc-mgmt-search-icon" />
                <input
                  type="text"
                  className="btc-mgmt-search-input"
                  placeholder="Search Batches"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="btc-mgmt-filter-select-wrapper">
                <select
                  className="btc-mgmt-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Closed">Closed</option>
                </select>
                <FiChevronDown className="btc-mgmt-select-arrow" />
              </div>

              <div className="btc-mgmt-filter-select-wrapper">
                <select
                  className="btc-mgmt-filter-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="All Branches">All Branches</option>
                  {branches.map((br) => (
                    <option key={br._id} value={br._id}>
                      {br.branchName || br.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="btc-mgmt-select-arrow" />
              </div>
            </div>

            {loading ? (
              <div className="btc-mgmt-content-area">
                <p className="btc-mgmt-empty-message">Loading batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="btc-mgmt-content-area">
                <p className="btc-mgmt-empty-message">
                  No batches available. Please add batches to view them here.
                </p>
              </div>
            ) : (
              <div className="btc-mgmt-table-wrapper">
                <div className="btc-mgmt-table-header-row">
                  <div className="btc-mgmt-th">#</div>
                  <div className="btc-mgmt-th">BATCH NAME</div>
                  <div className="btc-mgmt-th btc-mgmt-th-center">BRANCH</div>
                  <div className="btc-mgmt-th btc-mgmt-th-center">STATUS</div>
                  <div className="btc-mgmt-th btc-mgmt-th-center">TOTAL INTERNS</div>
                  <div className="btc-mgmt-th btc-mgmt-th-center">CREATED</div>
                  <div className="btc-mgmt-th btc-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="btc-mgmt-table-body">
                  {filteredBatches.map((item, idx) => {
                    const count = item.interns.length;
                    return (
                      <div key={item.id} className="btc-mgmt-table-row">
                        <div className="btc-mgmt-td" data-label="#">
                          {idx + 1}
                        </div>

                        <div className="btc-mgmt-td" data-label="Batch Name">
                          <div className="btc-mgmt-batch-cell">
                            <span className="btc-mgmt-batch-avatar">
                              {item.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="btc-mgmt-batch-info">
                              <span className="btc-mgmt-batch-name-text">{item.name}</span>
                              <span className="btc-mgmt-batch-id-sub">ID: {item.code}</span>
                            </div>
                          </div>
                        </div>

                        <div className="btc-mgmt-td btc-mgmt-td-center" data-label="Branch">
                          <span className="btc-mgmt-branch-pill">{item.branch}</span>
                        </div>

                        <div className="btc-mgmt-td btc-mgmt-td-center" data-label="Status">
                          <span
                            className={`btc-mgmt-status-pill btc-mgmt-status-pill--${item.status.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="btc-mgmt-td btc-mgmt-td-center" data-label="Total Interns">
                          <div className="btc-mgmt-interns-count-wrap">
                            <span className="btc-mgmt-interns-count">{count}</span>
                            {count > 2 && (
                              <span className="btc-mgmt-interns-more">+{count - 2} more</span>
                            )}
                          </div>
                        </div>

                        <div className="btc-mgmt-td btc-mgmt-td-center" data-label="Created">
                          <span className="btc-mgmt-date-text">{item.createdAt}</span>
                        </div>

                        <div className="btc-mgmt-td btc-mgmt-col-actions" data-label="Actions">
                          <button
                            type="button"
                            className="btc-mgmt-text-action btc-mgmt-text-action--view"
                            onClick={() => handleViewBatch(item)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="btc-mgmt-text-action btc-mgmt-text-action--edit"
                            onClick={() => handleOpenEditBatch(item)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btc-mgmt-text-action btc-mgmt-text-action--delete"
                            onClick={() => handleDeleteBatch(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="btc-mgmt-pagination-bar">
                  <span className="btc-mgmt-pagination-text">1 of 1</span>
                  <div className="btc-mgmt-pagination-controls">
                    <button type="button" className="btc-mgmt-page-btn" disabled>
                      <FiChevronLeft />
                    </button>
                    <button type="button" className="btc-mgmt-page-btn" disabled>
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW BATCH & EDIT BATCH FORM */}
        {(activeTab === 'add-batch' || activeTab === 'edit-batch') && (
          <form
            className="btc-mgmt-form-layout"
            onSubmit={activeTab === 'add-batch' ? handleCreateBatch : handleSaveEditedBatch}
          >
            <div className="btc-mgmt-form-body">
              <h2 className="btc-mgmt-section-heading">Batch Details</h2>

              <div className="btc-mgmt-form-row">
                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">
                    Batch Name<span className="btc-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="btc-mgmt-text-input"
                    placeholder="Enter Batch Name"
                    value={formBatchName}
                    onChange={(e) => setFormBatchName(e.target.value)}
                    required
                  />
                </div>

                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">
                    Branch Name<span className="btc-mgmt-required-star">*</span>
                  </label>
                  <div className="btc-mgmt-select-wrapper">
                    <select
                      className="btc-mgmt-select-input"
                      value={formBranchId}
                      onChange={(e) => {
                        setFormBranchId(e.target.value);
                        setInternSearch('');
                        setSelectedInternObj(null);
                        setFormInterns([]);
                      }}
                      required
                    >
                      <option value="" disabled>
                        Choose Branch
                      </option>
                      {branches.map((br) => {
                        const label = br.branchName || br.name || '';
                        return (
                          <option key={br._id} value={br._id}>
                            {label.charAt(0).toUpperCase() + label.slice(1)}
                          </option>
                        );
                      })}
                    </select>
                    <FiChevronDown className="btc-mgmt-select-arrow" />
                  </div>
                </div>

                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">Total Interns</label>
                  <input
                    type="text"
                    className="btc-mgmt-text-input btc-mgmt-text-input--readonly"
                    value={formInterns.length}
                    readOnly
                  />
                </div>
              </div>

              <div className="btc-mgmt-form-full-row">
                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">Status</label>
                  <div className="btc-mgmt-select-wrapper">
                    <select
                      className="btc-mgmt-select-input"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <FiChevronDown className="btc-mgmt-select-arrow" />
                  </div>
                </div>
              </div>

              <h2 className="btc-mgmt-section-heading btc-mgmt-section-heading--intern">
                Intern Assignment
              </h2>

              <div className="btc-mgmt-form-row">
                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">Search Interns</label>
                  <div className="btc-mgmt-intern-search-wrapper">
                    <LuSearch className="btc-mgmt-intern-search-icon" />
                    <input
                      type="text"
                      className="btc-mgmt-text-input btc-mgmt-text-input--left-icon"
                      placeholder={
                        formBranchId
                          ? 'Search by intern name or admission no...'
                          : 'Select a branch first to search interns...'
                      }
                      value={internSearch}
                      disabled={!formBranchId}
                      onFocus={() => setShowInternSuggestions(true)}
                      onChange={(e) => {
                        setInternSearch(e.target.value);
                        setSelectedInternObj(null);
                        setShowInternSuggestions(true);
                      }}
                    />
                    {showInternSuggestions &&
                      formBranchId &&
                      branchFilteredInterns.length > 0 && (
                        <div className="btc-mgmt-intern-dropdown">
                          {branchFilteredInterns.map((intern) => (
                            <div
                              key={intern._id}
                              className="btc-mgmt-intern-dropdown-item"
                              onClick={() => handleSelectInternSuggestion(intern)}
                            >
                              <span>{intern.name}</span>
                              <span className="btc-mgmt-intern-dropdown-meta">
                                #{intern.admissionNumber} • {intern.courseName}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">Intern Admission Number</label>
                  <input
                    type="text"
                    className="btc-mgmt-text-input btc-mgmt-text-input--readonly"
                    placeholder="Enter admission number"
                    value={internAdmissionNumber}
                    readOnly
                  />
                </div>

                <div className="btc-mgmt-input-group">
                  <label className="btc-mgmt-label">Intern Course Name</label>
                  <input
                    type="text"
                    className="btc-mgmt-text-input btc-mgmt-text-input--readonly"
                    placeholder="Enter course name"
                    value={internCourseName}
                    readOnly
                  />
                </div>
              </div>

              <div className="btc-mgmt-add-intern-action">
                <button
                  type="button"
                  className={`btc-mgmt-add-intern-btn ${
                    selectedInternObj ? 'btc-mgmt-add-intern-btn--ready' : ''
                  }`}
                  onClick={handleAddIntern}
                  disabled={!selectedInternObj}
                >
                  Add Intern
                </button>
              </div>

              <h2 className="btc-mgmt-section-heading btc-mgmt-section-heading--added">
                Added Interns
              </h2>

              {formInterns.length === 0 ? (
                <div className="btc-mgmt-added-empty">
                  No interns added yet. Add interns using the form above.
                </div>
              ) : (
                <div className="btc-mgmt-added-interns-grid">
                  {formInterns.map((intern) => (
                    <div key={intern._id} className="btc-mgmt-intern-chip">
                      <div className="btc-mgmt-intern-chip-info">
                        <span className="btc-mgmt-intern-chip-name">{intern.name}</span>
                        <span className="btc-mgmt-intern-chip-sub">
                          #{intern.admissionNumber} • {intern.courseName}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btc-mgmt-intern-remove-btn"
                        onClick={() => handleRemoveIntern(intern._id)}
                      >
                        <LuX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="btc-mgmt-form-footer">
              <button
                type="button"
                className="btc-mgmt-cancel-btn"
                onClick={handleBackToBatches}
              >
                Cancel
              </button>
              <button type="submit" className="btc-mgmt-submit-btn" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : activeTab === 'add-batch'
                  ? 'Create Batch'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* VIEW BATCH MODAL */}
      {viewingBatch && (
        <div
          className="btc-mgmt-modal-backdrop"
          onClick={() => setViewingBatch(null)}
        >
          <div
            className="btc-mgmt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="btc-mgmt-modal-header">
              <h2 className="btc-mgmt-modal-title">{viewingBatch.name}</h2>
              <button
                type="button"
                className="btc-mgmt-modal-close-top"
                onClick={() => setViewingBatch(null)}
              >
                <span>&lt; Close</span>
              </button>
            </div>

            <div className="btc-mgmt-modal-details-grid">
              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">Batch Name:</span>
                <span>{viewingBatch.name}</span>
              </div>

              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">Branch:</span>
                <span>{viewingBatch.branch}</span>
              </div>

              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">Status:</span>
                <span>{viewingBatch.status}</span>
              </div>

              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">Created:</span>
                <span>{viewingBatch.createdAt}</span>
              </div>

              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">Total Interns:</span>
                <span>{viewingBatch.interns.length}</span>
              </div>

              <div className="btc-mgmt-modal-detail-item">
                <span className="btc-mgmt-modal-detail-label">ID:</span>
                <span>{viewingBatch.code}</span>
              </div>
            </div>

            <div className="btc-mgmt-modal-subcard">
              <h3 className="btc-mgmt-modal-subcard-title">Assigned Interns</h3>
              {viewingBatch.interns.length === 0 ? (
                <p className="btc-mgmt-modal-subcard-text">
                  No interns assigned to this batch yet.
                </p>
              ) : (
                <div className="btc-mgmt-modal-interns-list">
                  {viewingBatch.interns.map((intern) => (
                    <div key={intern._id} className="btc-mgmt-modal-intern-tag">
                      <strong>{intern.name}</strong> ({intern.admissionNumber}) —{' '}
                      {intern.courseName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="btc-mgmt-modal-footer">
              <button
                type="button"
                className="btc-mgmt-modal-close-btn"
                onClick={() => setViewingBatch(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btc-mgmt-modal-edit-btn"
                onClick={() => handleOpenEditBatch(viewingBatch)}
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

export default BatchManagement;