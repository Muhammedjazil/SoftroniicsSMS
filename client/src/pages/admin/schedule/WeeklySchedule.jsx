import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './WeeklySchedule.css';
import { LuUser, LuSearch, LuEye, LuX } from 'react-icons/lu';
import { FiChevronDown, FiEdit3, FiCalendar } from 'react-icons/fi';
import AdminService from "../../../services/admin-api-services/AdminService";

const WeeklySchedule = () => {
  const {
    takebranch,
    takeweeklyschedule,
    saveweeklyschedulecell,
    clonenextweeklyschedule,
  } = AdminService();

  const [branches, setBranches] = useState([]);
  const [branchFilter, setBranchFilter] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [batchSearch, setBatchSearch] = useState('');
  const [previewBatch, setPreviewBatch] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [editingNoteKey, setEditingNoteKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  const [allBatches, setAllBatches] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Schedule state keyed by `${mentorId}_${timeId}_${day}`
  const [scheduleData, setScheduleData] = useState({});

  // 1. Load branches on mount
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await takebranch();
        const rawBranches = Array.isArray(res) ? res : res?.data || [];
        setBranches(rawBranches);

        if (rawBranches.length > 0) {
          const calicut = rawBranches.find(
            (b) => (b.branchName || b.name || '').toLowerCase() === 'calicut'
          );
          setBranchFilter(calicut ? calicut._id : rawBranches[0]._id);
        }
      } catch (err) {
        console.error('Failed to load branches:', err.response?.data || err.message);
      }
    };
    loadBranches();
  }, []);

  // 2. Load weekly schedule matrix whenever branchFilter or startDate changes
  const fetchMatrix = useCallback(async () => {
    if (!branchFilter || !startDate) return;

    setLoading(true);
    try {
      const data = await takeweeklyschedule({
        branchId: branchFilter,
        startDate,
      });

      setMentors(data.mentors || []);
      setAllBatches(data.batches || []);
      setSubjects(data.subjects || []);
      setScheduleData(data.scheduleMap || {});
    } catch (err) {
      console.error(
        'Failed to load weekly schedule matrix:',
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  }, [branchFilter, startDate]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  const endDateFormatted = useMemo(() => {
    if (!startDate) return '';
    const dt = new Date(startDate);
    dt.setDate(dt.getDate() + 6);
    return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
  }, [startDate]);

  // Track which batches have at least one slot assigned (highlights green in sidebar)
  const assignedBatchIds = useMemo(() => {
    const set = new Set();
    Object.values(scheduleData).forEach((entry) => {
      if (entry.batchId) set.add(entry.batchId);
    });
    return set;
  }, [scheduleData]);

  const filteredSidebarBatches = allBatches.filter((b) =>
    b.name.toLowerCase().includes(batchSearch.toLowerCase().trim())
  );

  // Persist a single cell change to backend and rollback UI on failure
  const persistCell = async (
    { mentorId, timeId, day, batchId, subjectId, note },
    previousCellState = null
  ) => {
    try {
      await saveweeklyschedulecell({
        startDate,
        branchId: branchFilter,
        mentorId,
        timeId,
        day,
        batchId,
        subjectId,
        note,
      });
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;
      console.error('Failed to save cell:', {
        status: err.response?.status,
        data: err.response?.data,
        message: serverMsg,
      });

      // Revert optimistic UI update if save failed
      if (previousCellState !== null) {
        const cellKey = `${mentorId}_${timeId}_${day}`;
        setScheduleData((prev) => {
          if (previousCellState === undefined) {
            const copy = { ...prev };
            delete copy[cellKey];
            return copy;
          }
          return {
            ...prev,
            [cellKey]: previousCellState,
          };
        });
      }

      alert(`Failed to save schedule cell: ${serverMsg}`);
    }
  };

  const handleDragStart = (e, batch) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id: batch._id, name: batch.name })
    );
  };

  // Allows only ONE batch per time slot (replaces any existing batch in that slot)
  const handleDropBatch = async (e, mentorId, timeId, day) => {
    e.preventDefault();
    setDragOverCell(null);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;

    let droppedBatch;
    try {
      droppedBatch = JSON.parse(raw);
    } catch {
      console.error('Invalid drag payload:', raw);
      return;
    }

    const cellKey = `${mentorId}_${timeId}_${day}`;
    const previousState = scheduleData[cellKey];
    const existing = previousState || {
      batchId: null,
      batchName: null,
      subjectId: '',
      note: '',
    };

    const updatedCell = {
      ...existing,
      batchId: droppedBatch.id,
      batchName: droppedBatch.name,
    };

    setScheduleData((prev) => ({
      ...prev,
      [cellKey]: updatedCell,
    }));

    await persistCell(
      {
        mentorId,
        timeId,
        day,
        batchId: updatedCell.batchId,
        subjectId: updatedCell.subjectId,
        note: updatedCell.note,
      },
      previousState
    );
  };

  const handleRemoveAssignedBatch = async (mentorId, timeId, day) => {
    const cellKey = `${mentorId}_${timeId}_${day}`;
    const existing = scheduleData[cellKey];
    if (!existing) return;

    const updatedCell = {
      ...existing,
      batchId: null,
      batchName: null,
    };

    setScheduleData((prev) => ({
      ...prev,
      [cellKey]: updatedCell,
    }));

    await persistCell(
      {
        mentorId,
        timeId,
        day,
        batchId: null,
        subjectId: updatedCell.subjectId,
        note: updatedCell.note,
      },
      existing
    );
  };

  const handleSubjectChange = async (mentorId, timeId, day, subjectId) => {
    const cellKey = `${mentorId}_${timeId}_${day}`;
    const previousState = scheduleData[cellKey];
    const existing = previousState || {
      batchId: null,
      batchName: null,
      subjectId: '',
      note: '',
    };

    const updatedCell = { ...existing, subjectId };

    setScheduleData((prev) => ({
      ...prev,
      [cellKey]: updatedCell,
    }));

    await persistCell(
      {
        mentorId,
        timeId,
        day,
        batchId: updatedCell.batchId,
        subjectId: updatedCell.subjectId,
        note: updatedCell.note,
      },
      previousState
    );
  };

  const handleNoteChange = (cellKey, note) => {
    setScheduleData((prev) => {
      const existing = prev[cellKey] || {
        batchId: null,
        batchName: null,
        subjectId: '',
        note: '',
      };
      return {
        ...prev,
        [cellKey]: { ...existing, note },
      };
    });
  };

  const handleNoteBlur = async (mentorId, timeId, day) => {
    setEditingNoteKey(null);
    const cellKey = `${mentorId}_${timeId}_${day}`;
    const cell = scheduleData[cellKey];
    if (!cell) return;

    await persistCell({
      mentorId,
      timeId,
      day,
      batchId: cell.batchId,
      subjectId: cell.subjectId,
      note: cell.note,
    });
  };

  const handleAdvanceWeek = async () => {
    if (!startDate || !branchFilter) return;
    try {
      const res = await clonenextweeklyschedule({
        branchId: branchFilter,
        startDate,
      });
      if (res?.nextStartDate) {
        setStartDate(res.nextStartDate);
      } else {
        const dt = new Date(startDate);
        dt.setDate(dt.getDate() + 7);
        setStartDate(dt.toISOString().split('T')[0]);
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message;
      console.error('Failed to advance week:', err.response?.data || err.message);
      alert(`Failed to advance schedule week: ${serverMsg}`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Mentor',
      'Time Slot',
      ...days.flatMap((d) => [d, `${d} Subject`, `${d} Note`]),
    ];
    const rows = [];

    mentors.forEach((mentor) => {
      if (mentor.slots.length === 0) {
        rows.push([mentor.name, '-', ...Array(days.length * 3).fill('')]);
      } else {
        mentor.slots.forEach((slot) => {
          const row = [mentor.name, slot.timeSlot];
          days.forEach((day) => {
            const cellKey = `${mentor._id}_${slot._id}_${day}`;
            const cell = scheduleData[cellKey] || {};
            const subjName =
              subjects.find((s) => s._id === cell.subjectId)?.name || '';
            row.push(cell.batchName || '', subjName, cell.note || '');
          });
          rows.push(row);
        });
      }
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows]
        .map((r) =>
          r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `weekly_schedule_${startDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="wk-sched-container">
      {/* Header */}
      <header className="wk-sched-header">
        <div className="wk-sched-title-group">
          <h1 className="wk-sched-heading">Batch Management</h1>
          <nav className="wk-sched-breadcrumb">
            <span>Batch Management</span>
            <span className="wk-sched-breadcrumb-separator">&gt;</span>
            <span>weekly-schedule</span>
          </nav>
        </div>

        <div className="wk-sched-profile-card">
          <div className="wk-sched-profile-avatar">
            <LuUser />
          </div>
          <div className="wk-sched-profile-info">
            <span className="wk-sched-username">vijitha</span>
            <span className="wk-sched-role">super admin</span>
          </div>
        </div>
      </header>

      {/* Main Split Workspace */}
      <div className="wk-sched-workspace">
        {/* Left Draggable Batch List */}
        <aside className="wk-sched-batch-sidebar">
          <h2 className="wk-sched-sidebar-title">Batch&apos;s</h2>
          <p className="wk-sched-sidebar-subtitle">
            Drag batches to the weekly live schedule (classes.)
          </p>

          <div className="wk-sched-sidebar-search">
            <LuSearch className="wk-sched-sidebar-search-icon" />
            <input
              type="text"
              className="wk-sched-sidebar-search-input"
              placeholder="Search Batch"
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
            />
          </div>

          <div className="wk-sched-batch-list">
            {filteredSidebarBatches.map((batch) => {
              const isAssigned = assignedBatchIds.has(batch._id);
              return (
                <div
                  key={batch._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, batch)}
                  className={`wk-sched-batch-pill ${
                    isAssigned ? 'wk-sched-batch-pill--assigned' : ''
                  }`}
                >
                  <span>{batch.name}</span>
                  <button
                    type="button"
                    className="wk-sched-batch-eye-btn"
                    onClick={() => setPreviewBatch(batch)}
                    title="Quick View Batch"
                  >
                    <LuEye />
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Weekly Schedule Card */}
        <section className="wk-sched-main-panel">
          <div className="wk-sched-panel-topbar">
            <div className="wk-sched-panel-title-wrap">
              <h2 className="wk-sched-panel-title">Weekly Schedule</h2>
              <p className="wk-sched-panel-subtitle">Assign batches to timings</p>
            </div>

            <div className="wk-sched-controls-group">
              <div className="wk-sched-select-wrapper">
                <select
                  className="wk-sched-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  {branches.map((br) => (
                    <option key={br._id} value={br._id}>
                      {br.branchName || br.name}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="wk-sched-select-arrow" />
              </div>

              <input
                type="date"
                className="wk-sched-date-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <span className="wk-sched-to-badge">To: {endDateFormatted}</span>

              <button
                type="button"
                className="wk-sched-export-btn"
                onClick={handleExportCSV}
              >
                Export
              </button>

              <button
                type="button"
                className="wk-sched-add-next-btn"
                onClick={handleAdvanceWeek}
              >
                <FiCalendar />
                <span>Add Next Schedule</span>
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Matrix */}
          <div className="wk-sched-table-scroll">
            <table className="wk-sched-table">
              <thead className="wk-sched-thead">
                <tr>
                  <th>MENTORS</th>
                  <th>TIME</th>
                  {days.map((day) => (
                    <React.Fragment key={day}>
                      <th>{day}</th>
                      <th>SUBJECT</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody className="wk-sched-tbody">
                {loading ? (
                  <tr>
                    <td
                      colSpan={2 + days.length * 2}
                      className="wk-sched-no-timings"
                    >
                      Loading weekly schedule...
                    </td>
                  </tr>
                ) : mentors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2 + days.length * 2}
                      className="wk-sched-no-timings"
                    >
                      No mentors found for this branch
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor) => {
                    if (mentor.slots.length === 0) {
                      return (
                        <tr key={mentor._id}>
                          <td className="wk-sched-mentor-cell">{mentor.name}</td>
                          <td className="wk-sched-time-cell">-</td>
                          <td
                            colSpan={days.length * 2}
                            className="wk-sched-no-timings"
                          >
                            No timings assigned for this branch
                          </td>
                        </tr>
                      );
                    }

                    return mentor.slots.map((slot, slotIdx) => (
                      <tr key={`${mentor._id}_${slot._id}`}>
                        {slotIdx === 0 && (
                          <td
                            rowSpan={mentor.slots.length}
                            className="wk-sched-mentor-cell"
                          >
                            {mentor.name}
                          </td>
                        )}

                        <td className="wk-sched-time-cell">{slot.timeSlot}</td>

                        {days.map((day) => {
                          const cellKey = `${mentor._id}_${slot._id}_${day}`;
                          const cellData = scheduleData[cellKey] || {
                            batchId: null,
                            batchName: null,
                            subjectId: '',
                            note: '',
                          };
                          const isOver = dragOverCell === cellKey;

                          return (
                            <React.Fragment key={cellKey}>
                              <td
                                className={`wk-sched-drop-cell ${
                                  isOver ? 'wk-sched-drop-cell--over' : ''
                                }`}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  setDragOverCell(cellKey);
                                }}
                                onDragLeave={() => setDragOverCell(null)}
                                onDrop={(e) =>
                                  handleDropBatch(e, mentor._id, slot._id, day)
                                }
                              >
                                <div className="wk-sched-drop-box">
                                  {!cellData.batchName ? (
                                    <span className="wk-sched-empty-slot-text">
                                      No batches assigned
                                    </span>
                                  ) : (
                                    <div className="wk-sched-assigned-tags">
                                      <span className="wk-sched-assigned-chip">
                                        {cellData.batchName}
                                        <button
                                          type="button"
                                          className="wk-sched-chip-remove"
                                          onClick={() =>
                                            handleRemoveAssignedBatch(
                                              mentor._id,
                                              slot._id,
                                              day
                                            )
                                          }
                                        >
                                          <LuX />
                                        </button>
                                      </span>
                                    </div>
                                  )}

                                  {editingNoteKey === cellKey ? (
                                    <input
                                      type="text"
                                      className="wk-sched-note-input"
                                      placeholder="Type note..."
                                      value={cellData.note}
                                      autoFocus
                                      onBlur={() =>
                                        handleNoteBlur(mentor._id, slot._id, day)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.target.blur();
                                        }
                                      }}
                                      onChange={(e) =>
                                        handleNoteChange(cellKey, e.target.value)
                                      }
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      className="wk-sched-note-trigger"
                                      onClick={() => setEditingNoteKey(cellKey)}
                                    >
                                      <FiEdit3 />
                                      <span>{cellData.note || 'Add Note'}</span>
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="wk-sched-subject-cell">
                                <select
                                  className="wk-sched-subject-select"
                                  value={cellData.subjectId}
                                  onChange={(e) =>
                                    handleSubjectChange(
                                      mentor._id,
                                      slot._id,
                                      day,
                                      e.target.value
                                    )
                                  }
                                >
                                  <option value="">Choose Subject</option>
                                  {subjects.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                      {sub.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    ));
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Quick Batch Preview Modal */}
      {previewBatch && (
        <div
          className="wk-sched-modal-backdrop"
          onClick={() => setPreviewBatch(null)}
        >
          <div
            className="wk-sched-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wk-sched-modal-header">
              <h3 className="wk-sched-modal-title">{previewBatch.name}</h3>
              <button
                type="button"
                className="wk-sched-modal-close"
                onClick={() => setPreviewBatch(null)}
              >
                Close
              </button>
            </div>
            <div className="wk-sched-modal-row">
              <strong>Course:</strong> {previewBatch.course}
            </div>
            <div className="wk-sched-modal-row">
              <strong>Branch:</strong> {previewBatch.branch}
            </div>
            <div className="wk-sched-modal-row">
              <strong>Total Interns:</strong> {previewBatch.interns}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklySchedule;