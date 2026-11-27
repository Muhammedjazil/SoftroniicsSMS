import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './TopicManagement.css';
import { LuUser, LuSearch } from 'react-icons/lu';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import AdminService from '../../../services/admin-api-services/AdminService'; // Adjust path if needed
import Loader from '../../../components/common/Loader';
import { useToast } from '../../../components/common/Toast';

const TopicManagement = () => {
  const { showToast, ToastContainer } = useToast();
  const {
    taketopics,
    takemodules,
    createtopic,
    updatetopic,
    removetopic,
  } = AdminService();

  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'new-topic' | 'edit-topic'
  const [viewingTopic, setViewingTopic] = useState(null);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All Modules');

  // Form states
  const [formTopicName, setFormTopicName] = useState('');
  const [formModuleId, setFormModuleId] = useState('');

  // API Data states
  const [topics, setTopics] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  // Normalize topic document from API
  const normalizeTopic = useCallback((t, index = 0) => {
    const modObj = typeof t.module === 'object' && t.module !== null ? t.module : null;
    const moduleId = modObj ? modObj._id : t.module || '';
    const moduleName = modObj ? modObj.moduleName || 'Untitled Module' : 'Module';
    const createdDate = t.createdAt
      ? new Date(t.createdAt).toLocaleDateString('en-US')
      : '';

    return {
      id: t._id,
      code: t._id ? t._id.slice(-4).toUpperCase() : `T${index + 11}`,
      name: t.topicName || '',
      moduleId,
      module: moduleName,
      createdAt: createdDate,
    };
  }, []);

  // Load topics and modules on mount
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [topicsRes, modulesRes] = await Promise.all([
        taketopics(),
        takemodules(),
      ]);

      const rawTopics = Array.isArray(topicsRes) ? topicsRes : topicsRes?.data || [];
      const rawModules = Array.isArray(modulesRes) ? modulesRes : modulesRes?.data || [];

      setTopics(rawTopics.map((item, idx) => normalizeTopic(item, idx)));
      setAvailableModules(rawModules);
    } catch (error) {
      console.error('Failed to load topics data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeTopic]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch = topic.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchesModule =
        moduleFilter === 'All Modules' || topic.moduleId === moduleFilter;
      return matchesSearch && matchesModule;
    });
  }, [topics, searchQuery, moduleFilter]);

  const resetForm = () => {
    setFormTopicName('');
    setFormModuleId('');
    setEditingTopicId(null);
  };

  const handleOpenNewTopic = () => {
    resetForm();
    setViewingTopic(null);
    setActiveTab('new-topic');
  };

  const handleBackToTopics = () => {
    resetForm();
    setViewingTopic(null);
    setActiveTab('topics');
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!formTopicName.trim() || !formModuleId || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        topicName: formTopicName.trim().toUpperCase(),
        module: formModuleId,
      };

      const res = await createtopic(payload);
      const created = res?.data || res;

      setTopics((prev) => [normalizeTopic(created, prev.length), ...prev]);
      showToast('Topic created successfully', 'success');
      handleBackToTopics();
    } catch (error) {
      console.error('Error creating topic:', error);
      showToast(error?.response?.data?.message || 'Failed to create topic', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTopic = (topicItem) => {
    setViewingTopic(topicItem);
  };

  const handleOpenEditTopic = (topicItem) => {
    setViewingTopic(null);
    setEditingTopicId(topicItem.id);
    setFormTopicName(topicItem.name);
    setFormModuleId(topicItem.moduleId);
    setActiveTab('edit-topic');
  };

  const handleSaveEditedTopic = async (e) => {
    e.preventDefault();
    if (!formTopicName.trim() || !formModuleId || !editingTopicId || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        topicName: formTopicName.trim().toUpperCase(),
        module: formModuleId,
      };

      const res = await updatetopic(editingTopicId, payload);
      const updated = res?.data || res;

      setTopics((prev) =>
        prev.map((t, idx) =>
          t.id === editingTopicId ? normalizeTopic(updated, idx) : t
        )
      );
      showToast('Topic updated successfully', 'success');
      handleBackToTopics();
    } catch (error) {
      console.error('Error updating topic:', error);
      showToast(error?.response?.data?.message || 'Failed to update topic', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (id) => {
    try {
      await removetopic(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      showToast('Topic deleted successfully', 'success');
      if (viewingTopic && viewingTopic.id === id) {
        setViewingTopic(null);
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      showToast(error?.response?.data?.message || 'Failed to delete topic', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['#', 'Topic Name', 'Module', 'Topic Code', 'Created'];
    const rows = filteredTopics.map((t, idx) => [
      idx + 1,
      t.name,
      t.module,
      t.code,
      t.createdAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'topics_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tpc-mgmt-container">
      <ToastContainer />
      {/* Header */}
     

      {/* Outer Toolbar */}
      <div className="tpc-mgmt-toolbar">
        <div className="tpc-mgmt-tab-group">
          <button
            type="button"
            className={`tpc-mgmt-tab-btn ${activeTab === 'topics' ? 'tpc-mgmt-tab-btn--active' : ''}`}
            onClick={handleBackToTopics}
          >
            Topics List
          </button>
          <button
            type="button"
            className={`tpc-mgmt-tab-btn ${
              activeTab === 'new-topic' || activeTab === 'edit-topic'
                ? 'tpc-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenNewTopic}
          >
            {activeTab === 'edit-topic' ? 'Edit Topic' : 'New Topic'}
          </button>
        </div>

        <button
          type="button"
          className="tpc-mgmt-export-btn"
          onClick={handleExportCSV}
        >
          <HiOutlineArrowDownTray className="tpc-mgmt-export-icon" />
          <span>Export</span>
        </button>
      </div>

      {/* Main White Card Container */}
      <main className="tpc-mgmt-panel">
        {/* TOPICS LIST & EMPTY STATE */}
        {activeTab === 'topics' && (
          <>
            <div className="tpc-mgmt-filter-bar">
              <div className="tpc-mgmt-search-wrapper">
                <LuSearch className="tpc-mgmt-search-icon" />
                <input
                  type="text"
                  className="tpc-mgmt-search-input"
                  placeholder="Search Topics"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="tpc-mgmt-filter-select-wrapper">
                <select
                  className="tpc-mgmt-filter-select"
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value)}
                >
                  <option value="All Modules">All Modules</option>
                  {availableModules.map((mod) => (
                    <option key={mod._id} value={mod._id}>
                      {mod.moduleName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="tpc-mgmt-select-arrow" />
              </div>
            </div>

            {loading ? (
              <Loader message="Loading topics..." minHeight="320px" />
            ) : filteredTopics.length === 0 ? (
              <div className="tpc-mgmt-content-area">
                <p className="tpc-mgmt-empty-message">
                  No topics available. Please add topics to view them here.
                </p>
              </div>
            ) : (
              <div className="tpc-mgmt-table-wrapper">
                <div className="tpc-mgmt-table-header-row">
                  <div className="tpc-mgmt-th">#</div>
                  <div className="tpc-mgmt-th">TOPIC NAME</div>
                  <div className="tpc-mgmt-th tpc-mgmt-th-center">MODULE</div>
                  <div className="tpc-mgmt-th tpc-mgmt-th-center">TOPIC CODE</div>
                  <div className="tpc-mgmt-th tpc-mgmt-th-center">CREATED</div>
                  <div className="tpc-mgmt-th tpc-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="tpc-mgmt-table-body">
                  {filteredTopics.map((item, idx) => (
                    <div key={item.id} className="tpc-mgmt-table-row">
                      <div className="tpc-mgmt-td" data-label="#">
                        {idx + 1}
                      </div>

                      <div className="tpc-mgmt-td" data-label="Topic Name">
                        <div className="tpc-mgmt-topic-cell">
                          <span className="tpc-mgmt-topic-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="tpc-mgmt-topic-name-text">{item.name}</span>
                        </div>
                      </div>

                      <div className="tpc-mgmt-td tpc-mgmt-td-center" data-label="Module">
                        <span className="tpc-mgmt-module-pill">{item.module}</span>
                      </div>

                      <div className="tpc-mgmt-td tpc-mgmt-td-center" data-label="Topic Code">
                        <span className="tpc-mgmt-code-badge">{item.code}</span>
                      </div>

                      <div className="tpc-mgmt-td tpc-mgmt-td-center" data-label="Created">
                        <span className="tpc-mgmt-date-text">{item.createdAt}</span>
                      </div>

                      <div className="tpc-mgmt-td tpc-mgmt-col-actions" data-label="Actions">
                        <button
                          type="button"
                          className="tpc-mgmt-text-action tpc-mgmt-text-action--view"
                          onClick={() => handleViewTopic(item)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="tpc-mgmt-text-action tpc-mgmt-text-action--edit"
                          onClick={() => handleOpenEditTopic(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="tpc-mgmt-text-action tpc-mgmt-text-action--delete"
                          onClick={() => handleDeleteTopic(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="tpc-mgmt-pagination-bar">
                  <span className="tpc-mgmt-pagination-text">1 of 1</span>
                  <div className="tpc-mgmt-pagination-controls">
                    <button type="button" className="tpc-mgmt-page-btn" disabled>
                      <FiChevronLeft />
                    </button>
                    <button type="button" className="tpc-mgmt-page-btn" disabled>
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* NEW TOPIC & EDIT TOPIC FORM */}
        {(activeTab === 'new-topic' || activeTab === 'edit-topic') && (
          <form
            className="tpc-mgmt-form-layout"
            onSubmit={activeTab === 'new-topic' ? handleCreateTopic : handleSaveEditedTopic}
          >
            <div className="tpc-mgmt-form-body">
              <h2 className="tpc-mgmt-section-heading">Topic Details</h2>

              <div className="tpc-mgmt-form-row">
                <div className="tpc-mgmt-input-group">
                  <label className="tpc-mgmt-label">
                    Topic Name<span className="tpc-mgmt-required-star">*</span>
                  </label>
                  <input
                    type="text"
                    className="tpc-mgmt-text-input"
                    placeholder="Enter Topic Name"
                    value={formTopicName}
                    onChange={(e) => setFormTopicName(e.target.value)}
                    required
                  />
                </div>

                <div className="tpc-mgmt-input-group">
                  <label className="tpc-mgmt-label">
                    Module<span className="tpc-mgmt-required-star">*</span>
                  </label>
                  <div className="tpc-mgmt-select-wrapper">
                    <select
                      className="tpc-mgmt-select-input"
                      value={formModuleId}
                      onChange={(e) => setFormModuleId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Choose Module
                      </option>
                      {availableModules.map((mod) => (
                        <option key={mod._id} value={mod._id}>
                          {mod.moduleName}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="tpc-mgmt-select-arrow" />
                  </div>
                </div>
              </div>
            </div>

            <div className="tpc-mgmt-form-footer">
              <button
                type="button"
                className="tpc-mgmt-cancel-btn"
                onClick={handleBackToTopics}
              >
                Cancel
              </button>
              <button type="submit" className="tpc-mgmt-submit-btn" disabled={submitting}>
                {submitting
                  ? 'Saving...'
                  : activeTab === 'new-topic'
                  ? 'Create Topic'
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* VIEW TOPIC MODAL */}
      {viewingTopic && (
        <div
          className="tpc-mgmt-modal-backdrop"
          onClick={() => setViewingTopic(null)}
        >
          <div
            className="tpc-mgmt-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="tpc-mgmt-modal-header">
              <h2 className="tpc-mgmt-modal-title">{viewingTopic.name}</h2>
              <button
                type="button"
                className="tpc-mgmt-modal-close-top"
                onClick={() => setViewingTopic(null)}
              >
                <span>&lt; Close</span>
              </button>
            </div>

            <div className="tpc-mgmt-modal-details-grid">
              <div className="tpc-mgmt-modal-detail-item">
                <span className="tpc-mgmt-modal-detail-label">Topic Name:</span>
                <span>{viewingTopic.name}</span>
              </div>

              <div className="tpc-mgmt-modal-detail-item">
                <span className="tpc-mgmt-modal-detail-label">Module:</span>
                <span>{viewingTopic.module}</span>
              </div>

              <div className="tpc-mgmt-modal-detail-item">
                <span className="tpc-mgmt-modal-detail-label">Topic Code:</span>
                <span>{viewingTopic.code}</span>
              </div>

              <div className="tpc-mgmt-modal-detail-item">
                <span className="tpc-mgmt-modal-detail-label">Created:</span>
                <span>{viewingTopic.createdAt}</span>
              </div>
            </div>

            <div className="tpc-mgmt-modal-footer">
              <button
                type="button"
                className="tpc-mgmt-modal-close-btn"
                onClick={() => setViewingTopic(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="tpc-mgmt-modal-edit-btn"
                onClick={() => handleOpenEditTopic(viewingTopic)}
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

export default TopicManagement;