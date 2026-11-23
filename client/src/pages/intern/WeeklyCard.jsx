import React, { useState, useEffect, useCallback } from 'react';
import './WeeklyCard.css';
import { LuUser } from 'react-icons/lu';
import UserService from '../../services/user-api-services/UserService';

const WeeklyCard = () => {
  const { takeinternweeklycard } = UserService();
  const [isLoading, setIsLoading] = useState(true);
  const [internData, setInternData] = useState(null);
  const [evaluations, setEvaluations] = useState([]);

  // Resolve logged-in intern identifier from localStorage
  const getStoredUserQuery = () => {
    try {
      const rawUser =
        localStorage.getItem('user') ||
        localStorage.getItem('intern') ||
        localStorage.getItem('auth');
      if (!rawUser) return {};
      const parsed = JSON.parse(rawUser);
      const u = parsed?.user || parsed;
      return {
        internId: u?._id || u?.id || '',
        email: u?.email || u?.officialEmail || '',
      };
    } catch {
      return {};
    }
  };

  const fetchWeeklyCard = useCallback(async () => {
    setIsLoading(true);
    try {
      const userQuery = getStoredUserQuery();
      const res = await takeinternweeklycard(userQuery);
      if (res?.intern) {
        setInternData(res.intern);
      }
      setEvaluations(Array.isArray(res?.evaluations) ? res.evaluations : []);
    } catch (err) {
      console.error('Failed to load intern weekly card:', err);
      const userQuery = getStoredUserQuery();
      setInternData({
        name: 'INTERN',
        initial: 'I',
        mode: 'FULL TIME',
        batch: 'BATCH',
        studentId: userQuery.internId ? `STU-${userQuery.internId.slice(-4).toUpperCase()}` : 'STU-001',
        course: '',
        avgTestScore: 0,
        avgProjectScore: 0,
        attendance: 0,
      });
      setEvaluations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyCard();
  }, [fetchWeeklyCard]);

  const tableColumns = [
    'WEEK',
    'DATES',
    'SUBJECT',
    'TOPIC',
    'TEST',
    'PROJECT',
    'SOFT SKILL',
    'ATTENDANCE',
    'MENTOR',
    'NOTES',
  ];

  return (
    <div className="wk-card-container">
      

      {/* Main Content Wrapper */}
      <div className="wk-card-body">
        {/* Intern Identity Banner */}
        <section className="wk-card-identity-card">
          <div className="wk-card-avatar-square">
            {isLoading ? '...' : internData?.initial || 'I'}
          </div>

          <div className="wk-card-identity-details">
            <h2 className="wk-card-intern-title">
              {isLoading ? 'Loading...' : internData?.name || 'Intern'}
            </h2>

            <div className="wk-card-badges-row">
              <span className="wk-card-badge wk-card-badge--indigo">
                {isLoading ? 'FULL TIME' : internData?.mode || 'FULL TIME'}
              </span>
              <span className="wk-card-badge wk-card-badge--teal">
                {isLoading ? 'BATCH' : internData?.batch || 'BATCH'}
              </span>
              <span className="wk-card-badge wk-card-badge--slate">
                {isLoading ? 'STU-001' : internData?.studentId || 'STU-001'}
              </span>
              {!isLoading && internData?.course && (
                <span className="wk-card-badge wk-card-badge--purple">
                  {internData.course}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Three Metric Summary Cards */}
        <section className="wk-card-metrics-grid">
          <div className="wk-card-metric-box wk-card-metric-box--teal">
            <div className="wk-card-metric-top">
              <span className="wk-card-metric-label">AVG TEST SCORE</span>
              <span className="wk-card-score-tag">SCORE</span>
            </div>
            <div className="wk-card-metric-value-row">
              <span className="wk-card-metric-num">
                {isLoading ? 0 : internData?.avgTestScore ?? 0}
              </span>
              <span className="wk-card-metric-denom">/ 100</span>
            </div>
          </div>

          <div className="wk-card-metric-box wk-card-metric-box--purple">
            <div className="wk-card-metric-top">
              <span className="wk-card-metric-label">AVG PROJECT SCORE</span>
              <span className="wk-card-score-tag">SCORE</span>
            </div>
            <div className="wk-card-metric-value-row">
              <span className="wk-card-metric-num">
                {isLoading ? 0 : internData?.avgProjectScore ?? 0}
              </span>
              <span className="wk-card-metric-denom">/ 100</span>
            </div>
          </div>

          <div className="wk-card-metric-box wk-card-metric-box--orange">
            <div className="wk-card-metric-top">
              <span className="wk-card-metric-label">ATTENDANCE</span>
            </div>
            <div className="wk-card-metric-value-row">
              <span className="wk-card-metric-num">
                {isLoading ? 0 : internData?.attendance ?? 0}
              </span>
              <span className="wk-card-metric-percent">%</span>
            </div>
            <span className="wk-card-metric-subtext">Percentage</span>
          </div>
        </section>

        {/* Evaluation Table Card */}
        <section className="wk-card-table-card">
          <div className="wk-card-table-scroll">
            <table className="wk-card-table">
              <thead>
                <tr>
                  {tableColumns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={tableColumns.length} className="wk-card-table-status">
                      Loading your evaluation details...
                    </td>
                  </tr>
                ) : evaluations.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumns.length} className="wk-card-table-status">
                      No evaluation details are currently available for you.
                    </td>
                  </tr>
                ) : (
                  evaluations.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td>{row.week}</td>
                      <td>{row.dates}</td>
                      <td>{row.subject}</td>
                      <td>{row.topic}</td>
                      <td>{row.test}</td>
                      <td>{row.project}</td>
                      <td>{row.softSkill}</td>
                      <td>{row.attendance}</td>
                      <td>{row.mentor}</td>
                      <td>{row.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WeeklyCard;