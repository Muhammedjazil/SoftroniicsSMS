import React, { useState, useEffect, useCallback } from 'react';
import './TimingsManagement.css';
import { LuUser } from 'react-icons/lu';
import { FiChevronDown, FiEdit2 } from 'react-icons/fi';
import AdminService from "../../../services/admin-api-services/AdminService"

const TimingsManagement = () => {
  const { takebranch, taketiming, createtiming, updatetiming } = AdminService();

  const [activeTab, setActiveTab] = useState('timings'); // 'timings' | 'new-timing' | 'edit-timing'
  const [branchFilter, setBranchFilter] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [branches, setBranches] = useState([]);
  const [timings, setTimings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [branchId, setBranchId] = useState('');
  const [timeError, setTimeError] = useState('');

  // Convert 24-hour ("14:00") -> 12-hour ("02:00 PM")
  const formatTo12Hour = (time24) => {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${minute} ${ampm}`;
  };

  // Convert 12-hour ("02:00 PM") -> 24-hour ("14:00") for <input type="time">
  const parse12To24Hour = (time12) => {
    if (!time12) return '';
    const match = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return '';
    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const modifier = match[3].toUpperCase();

    if (modifier === 'PM' && hour !== 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${minute}`;
  };

  // Normalize API Timing record
  const normalizeTiming = useCallback((item) => {
    const parts = (item.timeSlot || '').split('-').map((p) => p.trim());
    const start = parts[0] ? parse12To24Hour(parts[0]) : '';
    const end = parts[1] ? parse12To24Hour(parts[1]) : '';
    const bObj = typeof item.branch === 'object' && item.branch !== null ? item.branch : null;

    return {
      id: item._id,
      start,
      end,
      label: item.timeSlot,
      branchId: bObj ? bObj._id : item.branch || '',
      branchName: bObj ? bObj.branchName || bObj.name : '',
    };
  }, []);

  // Load initial branches and timings
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [branchesRes, timingsRes] = await Promise.all([
        takebranch(),
        taketiming(),
      ]);

      const rawBranches = Array.isArray(branchesRes) ? branchesRes : branchesRes?.data || [];
      const rawTimings = Array.isArray(timingsRes) ? timingsRes : timingsRes?.data || [];

      setBranches(rawBranches);
      setTimings(rawTimings.map(normalizeTiming));

      if (rawBranches.length > 0) {
        const calicut = rawBranches.find(
          (b) => (b.branchName || b.name || '').toLowerCase() === 'calicut'
        );
        setBranchFilter(calicut ? calicut._id : rawBranches[0]._id);
      }
    } catch (error) {
      console.error('Failed to load timings data:', error);
    } finally {
      setLoading(false);
    }
  }, [normalizeTiming]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setBranchId('');
    setEditingId(null);
    setTimeError('');
  };

  const handleOpenNew = () => {
    resetForm();
    if (branchFilter) setBranchId(branchFilter);
    setActiveTab('new-timing');
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setStartTime(item.start);
    setEndTime(item.end);
    setBranchId(item.branchId);
    setTimeError('');
    setActiveTab('edit-timing');
  };

  const handleStartTimeChange = (value) => {
    setStartTime(value);
    if (endTime && value >= endTime) {
      setTimeError('End time must be later than start time.');
    } else {
      setTimeError('');
    }
  };

  const handleEndTimeChange = (value) => {
    setEndTime(value);
    if (startTime && value <= startTime) {
      setTimeError('End time must be later than start time.');
    } else {
      setTimeError('');
    }
  };

  const handleSaveTiming = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime || !branchId || submitting) return;

    if (endTime <= startTime) {
      setTimeError('End time must be later than start time.');
      return;
    }

    const timeSlot = `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
    const payload = {
      branch: branchId,
      timeSlot,
    };

    setSubmitting(true);
    try {
      if (activeTab === 'edit-timing' && editingId) {
        const res = await updatetiming(editingId, payload);
        const updated = res?.data || res;
        setTimings((prev) =>
          prev.map((t) => (t.id === editingId ? normalizeTiming(updated) : t))
        );
      } else {
        const res = await createtiming(payload);
        const created = res?.data || res;
        setTimings((prev) => [...prev, normalizeTiming(created)]);
      }

      setBranchFilter(branchId);
      resetForm();
      setActiveTab('timings');
    } catch (error) {
      console.error('Error saving timing:', error);
      alert(error?.response?.data?.message || 'Failed to save timing');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTimings = timings.filter((t) =>
    branchFilter ? t.branchId === branchFilter : true
  );

  return (
    <div className="tmg-mgmt-container">
      <header className="tmg-mgmt-header">
        <div className="tmg-mgmt-title-group">
          <h1 className="tmg-mgmt-heading">Settings</h1>
          <nav className="tmg-mgmt-breadcrumb">
            <span>Settings</span>
            <span className="tmg-mgmt-breadcrumb-separator">&gt;</span>
            <span>
              {activeTab === 'timings'
                ? 'timings'
                : activeTab === 'edit-timing'
                ? 'edit-timing'
                : 'new-timing'}
            </span>
          </nav>
        </div>

        <div className="tmg-mgmt-profile-card">
          <div className="tmg-mgmt-profile-avatar">
            <LuUser />
          </div>
          <div className="tmg-mgmt-profile-info">
            <span className="tmg-mgmt-username">vijitha</span>
            <span className="tmg-mgmt-role">super admin</span>
          </div>
        </div>
      </header>

      <div className="tmg-mgmt-toolbar">
        <div className="tmg-mgmt-tab-group">
          <button
            type="button"
            className={`tmg-mgmt-tab-btn ${activeTab === 'timings' ? 'tmg-mgmt-tab-btn--active' : ''}`}
            onClick={() => {
              resetForm();
              setActiveTab('timings');
            }}
          >
            Timings
          </button>
          <button
            type="button"
            className={`tmg-mgmt-tab-btn ${
              activeTab === 'new-timing' || activeTab === 'edit-timing'
                ? 'tmg-mgmt-tab-btn--active'
                : ''
            }`}
            onClick={handleOpenNew}
          >
            {activeTab === 'edit-timing' ? 'Edit Timing' : 'New Timing'}
          </button>
        </div>
      </div>

      <main className="tmg-mgmt-panel">
        {activeTab === 'timings' ? (
          <>
            <div className="tmg-mgmt-list-header">
              <h2 className="tmg-mgmt-section-heading">Added Timings</h2>

              <div className="tmg-mgmt-branch-filter">
                <span className="tmg-mgmt-filter-label">Filter by Branch:</span>
                <div className="tmg-mgmt-select-wrapper">
                  <select
                    className="tmg-mgmt-select-input"
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                  >
                    {branches.map((br) => (
                      <option key={br._id} value={br._id}>
                        {br.branchName || br.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="tmg-mgmt-select-arrow" />
                </div>
              </div>
            </div>

            {loading ? (
              <p className="tmg-mgmt-empty-text">Loading timings...</p>
            ) : filteredTimings.length === 0 ? (
              <p className="tmg-mgmt-empty-text">No timings added for this branch yet.</p>
            ) : (
              <div className="tmg-mgmt-pills-grid">
                {filteredTimings.map((item) => (
                  <div key={item.id} className="tmg-mgmt-timing-pill">
                    <span>{item.label}</span>
                    <button
                      type="button"
                      className="tmg-mgmt-pill-edit-btn"
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Timing"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleSaveTiming}>
            <h2 className="tmg-mgmt-section-heading">Timings Details</h2>

            <div className="tmg-mgmt-form-row">
              <div className="tmg-mgmt-input-group">
                <label className="tmg-mgmt-label">
                  Start Time<span className="tmg-mgmt-required-star">*</span>
                </label>
                <input
                  type="time"
                  className="tmg-mgmt-time-input"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  required
                />
              </div>

              <div className="tmg-mgmt-input-group">
                <label className="tmg-mgmt-label">
                  End Time<span className="tmg-mgmt-required-star">*</span>
                </label>
                <input
                  type="time"
                  className="tmg-mgmt-time-input"
                  min={startTime || undefined}
                  value={endTime}
                  onChange={(e) => handleEndTimeChange(e.target.value)}
                  style={timeError ? { borderColor: '#dc2626' } : undefined}
                  required
                />
                {timeError && (
                  <span style={{ color: '#dc2626', fontSize: '12px', fontWeight: 500, marginTop: '4px' }}>
                    {timeError}
                  </span>
                )}
              </div>

              <div className="tmg-mgmt-input-group">
                <label className="tmg-mgmt-label">
                  Branch Name<span className="tmg-mgmt-required-star">*</span>
                </label>
                <div className="tmg-mgmt-select-wrapper">
                  <select
                    className="tmg-mgmt-select-input tmg-mgmt-select-input--form"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
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
                  <FiChevronDown className="tmg-mgmt-select-arrow" />
                </div>
              </div>
            </div>

            <div className="tmg-mgmt-form-footer">
              <button
                type="button"
                className="tmg-mgmt-cancel-btn"
                onClick={() => {
                  resetForm();
                  setActiveTab('timings');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="tmg-mgmt-submit-btn"
                disabled={Boolean(timeError) || submitting}
              >
                {submitting
                  ? 'Saving...'
                  : activeTab === 'edit-timing'
                  ? 'Save Timing'
                  : 'Create Timing'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default TimingsManagement;