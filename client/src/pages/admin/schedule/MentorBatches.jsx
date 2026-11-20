import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './MentorBatches.css';
import { LuUser, LuClock, LuBriefcase, LuTag } from 'react-icons/lu';
import { HiOutlineArrowDownTray } from 'react-icons/hi2';
import { FiChevronDown, FiCalendar } from 'react-icons/fi';
import AdminService from '../../../services/admin-api-services/AdminService'

const MentorBatches = () => {
  const { takebranch, takementors, takementorschedule } = AdminService();

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');

  const [mentorDetails, setMentorDetails] = useState(null);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // 1. Load Branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await takebranch();
        const rawBranches = Array.isArray(res) ? res : res?.data || [];
        setBranches(rawBranches);

        const calicut = rawBranches.find(
          (b) => (b.branchName || b.name || '').toLowerCase() === 'calicut'
        );
        if (calicut) {
          setBranchFilter(calicut._id);
        }
      } catch (err) {
        console.error('Failed to load branches:', err);
      }
    };
    loadBranches();
  }, []);

  // 2. Load Mentors whenever branchFilter changes
  useEffect(() => {
    const loadMentors = async () => {
      setLoadingMentors(true);
      try {
        const res = await takementors(branchFilter);
        const list = Array.isArray(res) ? res : res?.data || [];
        setMentors(list);

        if (list.length > 0) {
          setSelectedMentorId((prev) =>
            list.some((m) => m._id === prev) ? prev : list[0]._id
          );
        } else {
          setSelectedMentorId('');
          setMentorDetails(null);
        }
      } catch (err) {
        console.error('Failed to load mentors:', err);
        setMentors([]);
        setSelectedMentorId('');
      } finally {
        setLoadingMentors(false);
      }
    };
    loadMentors();
  }, [branchFilter]);

  // 3. Load Selected Mentor's Assigned Batches & Weekly Schedule
  const fetchSchedule = useCallback(async () => {
    if (!selectedMentorId) {
      setMentorDetails(null);
      return;
    }

    setLoadingSchedule(true);
    try {
      const data = await takementorschedule(selectedMentorId, {
        startDate,
        branchId: branchFilter,
      });
      setMentorDetails(data);
    } catch (err) {
      console.error('Failed to load mentor schedule:', err);
      setMentorDetails(null);
    } finally {
      setLoadingSchedule(false);
    }
  }, [selectedMentorId, startDate, branchFilter]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const endDateFormatted = useMemo(() => {
    if (!startDate) return '';
    const dt = new Date(startDate);
    dt.setDate(dt.getDate() + 6);
    return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  }, [startDate]);

  const selectedMentorMeta = useMemo(
    () => mentors.find((m) => m._id === selectedMentorId) || null,
    [mentors, selectedMentorId]
  );

  const currentMentor = mentorDetails?.mentor || {
    name: selectedMentorMeta?.fullName || 'No Mentor Selected',
    email: selectedMentorMeta?.email || selectedMentorMeta?.officialEmail || '—',
    primaryBranch:
      selectedMentorMeta?.branch?.branchName ||
      selectedMentorMeta?.branch?.name ||
      '—',
    multipleBranches: [],
  };

  const assignedBatches = mentorDetails?.assignedBatches || [];
  const timeline = mentorDetails?.timeline || [];
  const stats = mentorDetails?.stats || {
    assignedBatchesCount: assignedBatches.length,
    scheduleSlotsCount: timeline.length,
  };

  return (
    <div className="mnt-btc-container">
      {/* Header */}
      <header className="mnt-btc-header">
        <div className="mnt-btc-title-group">
          <h1 className="mnt-btc-heading">Mentor Batches</h1>
          <nav className="mnt-btc-breadcrumb">
            <span>Mentor Batches</span>
            <span className="mnt-btc-breadcrumb-separator">&gt;</span>
            <span>Mentor Batches</span>
          </nav>
        </div>

        <div className="mnt-btc-profile-card">
          <div className="mnt-btc-profile-avatar">
            <LuUser />
          </div>
          <div className="mnt-btc-profile-info">
            <span className="mnt-btc-username">vijitha</span>
            <span className="mnt-btc-role">super admin</span>
          </div>
        </div>
      </header>

      {/* Top Selector Bar */}
      <section className="mnt-btc-selector-card">
        <div className="mnt-btc-selector-left">
          <div className="mnt-btc-selector-icon-box">
            <LuUser />
          </div>
          <div>
            <h2 className="mnt-btc-selector-title">Select Mentor Schedule</h2>
            <p className="mnt-btc-selector-sub">
              Choose a mentor to view assigned batches &amp; schedule
            </p>
          </div>
        </div>

        <div className="mnt-btc-selector-controls">
          <input
            type="date"
            className="mnt-btc-date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <span className="mnt-btc-to-pill">To: {endDateFormatted}</span>

          <div className="mnt-btc-select-wrapper">
            <select
              className="mnt-btc-select"
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
            <FiChevronDown className="mnt-btc-select-arrow" />
          </div>

          <div className="mnt-btc-select-wrapper mnt-btc-select-wrapper--mentor">
            <select
              className="mnt-btc-select"
              value={selectedMentorId}
              onChange={(e) => setSelectedMentorId(e.target.value)}
              disabled={loadingMentors || mentors.length === 0}
            >
              {loadingMentors ? (
                <option value="">Loading mentors...</option>
              ) : mentors.length === 0 ? (
                <option value="">No mentors found</option>
              ) : (
                mentors.map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.fullName}
                  </option>
                ))
              )}
            </select>
            <FiChevronDown className="mnt-btc-select-arrow" />
          </div>

          <button type="button" className="mnt-btc-download-btn" title="Export Schedule">
            <HiOutlineArrowDownTray />
          </button>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className="mnt-btc-grid">
        {/* Left Column: Mentor Info + Assigned Batches */}
        <div className="mnt-btc-left-col">
          {/* Mentor Overview Card */}
          <div className="mnt-btc-card">
            <div className="mnt-btc-mentor-top">
              <div className="mnt-btc-mentor-avatar">
                <LuUser />
              </div>
              <div>
                <span className="mnt-btc-role-badge">MENTOR</span>
                <h3 className="mnt-btc-mentor-name">{currentMentor.name}</h3>
                <p className="mnt-btc-mentor-email">{currentMentor.email}</p>
              </div>
            </div>

            <div className="mnt-btc-assigned-label">ASSIGNED BRANCHES</div>
            <div className="mnt-btc-branch-tag">
              <span className="mnt-btc-branch-dot" />
              <span>{currentMentor.primaryBranch} (Primary)</span>
            </div>
            {currentMentor.multipleBranches?.map((mb, idx) => (
              <div key={idx} className="mnt-btc-branch-tag" style={{ marginTop: '6px' }}>
                <span className="mnt-btc-branch-dot" />
                <span>{mb}</span>
              </div>
            ))}

            <div className="mnt-btc-stats-row">
              <div className="mnt-btc-stat-box">
                <span className="mnt-btc-stat-num mnt-btc-stat-num--blue">
                  {stats.assignedBatchesCount}
                </span>
                <span className="mnt-btc-stat-label">ASSIGNED BATCHES</span>
              </div>

              <div className="mnt-btc-stat-box">
                <span className="mnt-btc-stat-num mnt-btc-stat-num--green">
                  {stats.scheduleSlotsCount}
                </span>
                <span className="mnt-btc-stat-label">SCHEDULE SLOTS</span>
              </div>
            </div>
          </div>

          {/* Assigned Batches Card */}
          <div className="mnt-btc-card">
            <div className="mnt-btc-card-header">
              <div className="mnt-btc-card-header-icon">
                <LuBriefcase />
              </div>
              <h3 className="mnt-btc-card-title">
                Assigned Batches ({assignedBatches.length})
              </h3>
            </div>

            {loadingSchedule ? (
              <p className="mnt-btc-inactive-text">Loading assigned batches...</p>
            ) : assignedBatches.length === 0 ? (
              <p className="mnt-btc-inactive-text">
                No batches assigned to this mentor for the selected range.
              </p>
            ) : (
              <div className="mnt-btc-assigned-list">
                {assignedBatches.map((batch) => (
                  <div key={batch.id} className="mnt-btc-assigned-item">
                    <div className="mnt-btc-assigned-item-top">
                      <span className="mnt-btc-assigned-batch-name">{batch.name}</span>
                      <div className="mnt-btc-assigned-badges">
                        {batch.isToday && <span className="mnt-btc-today-pill">Today</span>}
                        <span className="mnt-btc-days-pill">{batch.days}</span>
                        <span className="mnt-btc-branch-mini-pill">{batch.branch}</span>
                      </div>
                    </div>
                    <div className="mnt-btc-assigned-course-sub">
                      {batch.course} &bull; {batch.branch}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Schedule Timeline */}
        <div className="mnt-btc-card">
          <div className="mnt-btc-card-header">
            <div className="mnt-btc-card-header-icon mnt-btc-card-header-icon--green">
              <FiCalendar />
            </div>
            <h3 className="mnt-btc-card-title">Weekly Schedule Timeline</h3>
          </div>

          {loadingSchedule ? (
            <p className="mnt-btc-inactive-text">Loading schedule timeline...</p>
          ) : timeline.length === 0 ? (
            <p className="mnt-btc-inactive-text">
              No schedule slots found for this mentor in the selected week.
            </p>
          ) : (
            <div className="mnt-btc-timeline-wrapper">
              {timeline.map((group) => (
                <div key={group.slot} className="mnt-btc-slot-group">
                  <span className="mnt-btc-slot-dot" />
                  <div className="mnt-btc-slot-badge">
                    <LuClock />
                    <span>{group.slot}</span>
                  </div>

                  <div className="mnt-btc-day-cards">
                    {group.entries.length === 0 ? (
                      <div className="mnt-btc-day-card mnt-btc-day-card--inactive">
                        <p className="mnt-btc-inactive-text">
                          No active batches assigned to this slot
                        </p>
                      </div>
                    ) : (
                      group.entries.map((entry, idx) => (
                        <div
                          key={`${group.slot}_${entry.day}_${idx}`}
                          className={`mnt-btc-day-card ${
                            !entry.active ? 'mnt-btc-day-card--inactive' : ''
                          }`}
                        >
                          <div className="mnt-btc-day-card-top">
                            <div className="mnt-btc-day-left">
                              <span className="mnt-btc-day-badge">{entry.day}</span>
                              {entry.branch && (
                                <span className="mnt-btc-branch-mini-pill">{entry.branch}</span>
                              )}
                            </div>
                            {entry.active ? (
                              <span className="mnt-btc-active-status">1 Batch(es) Active</span>
                            ) : (
                              <span className="mnt-btc-no-batch-status">No Batches</span>
                            )}
                          </div>

                          {entry.active ? (
                            <div className="mnt-btc-day-batch-row">
                              <span className="mnt-btc-batch-tag">
                                {entry.batchName}{' '}
                                <span className="mnt-btc-batch-tag-branch">{entry.branch}</span>
                              </span>

                              {entry.subject && (
                                <span className="mnt-btc-subject-tag">
                                  <LuTag />
                                  <span>Subject: {entry.subject}</span>
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="mnt-btc-inactive-text">
                              No active batches assigned to this slot
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorBatches;