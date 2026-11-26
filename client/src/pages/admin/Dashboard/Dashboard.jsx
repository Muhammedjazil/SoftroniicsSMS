import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiBell,
  FiArrowUpRight,
  FiMoreVertical,
  FiCalendar,
  FiChevronDown,
  FiBarChart2,
} from "react-icons/fi";
import {
  LuBookOpen,
  LuUsers,
  LuLayers,
  LuUserCheck,
  LuFolderGit2,
} from "react-icons/lu";
import AdminService from "../../../services/admin-api-services/AdminService";
import "./Dashboard.css";

const COURSE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80";

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    takecourses,
    takebatches,
    getallinterns,
    getallstaff,
    taketasks,
  } = AdminService();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const [stats, setStats] = useState({
    courses: 0,
    interns: 0,
    batches: 0,
    staff: 0,
  });

  const [coursesList, setCoursesList] = useState([]);
  const [upcomingTest, setUpcomingTest] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [hasWeeklyActivity, setHasWeeklyActivity] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, batchesRes, internsRes, staffRes, tasksRes] =
          await Promise.allSettled([
            takecourses(),
            takebatches(),
            getallinterns(),
            getallstaff(),
            taketasks(),
          ]);

        let loadedCourses = [];
        let totalCoursesCount = 0;
        let totalBatchesCount = 0;
        let totalInternsCount = 0;
        let totalStaffCount = 0;

        if (coursesRes.status === "fulfilled") {
          const raw = Array.isArray(coursesRes.value)
            ? coursesRes.value
            : coursesRes.value?.courses || coursesRes.value?.data || [];
          const activeCourses = raw.filter((c) => !c.isDeleted);
          totalCoursesCount = activeCourses.length;
          loadedCourses = activeCourses.map((c, idx) => ({
            id: c._id || `c-${idx}`,
            name: (c.courseName || c.name || "Course").toUpperCase(),
            duration: c.duration || "6 Months",
            courseType: c.courseType || "Regular",
            description: c.description || c.courseName || "Course overview",
            modulesCount: Array.isArray(c.modules) ? c.modules.length : 0,
            enrolledCount: Array.isArray(c.interns) ? c.interns.length : 0,
            image: c.image || COURSE_FALLBACK_IMAGE,
          }));
        }

        if (batchesRes.status === "fulfilled") {
          const raw = Array.isArray(batchesRes.value)
            ? batchesRes.value
            : batchesRes.value?.batches || batchesRes.value?.data || [];
          const activeBatches = raw.filter((b) => !b.isDeleted);
          totalBatchesCount = activeBatches.length;
        }

        if (internsRes.status === "fulfilled") {
          const raw = Array.isArray(internsRes.value)
            ? internsRes.value
            : internsRes.value?.interns || internsRes.value?.data || [];
          const activeInterns = raw.filter((i) => !i.isDeleted);
          totalInternsCount = activeInterns.length;
        }

        if (staffRes.status === "fulfilled") {
          const raw = Array.isArray(staffRes.value)
            ? staffRes.value
            : staffRes.value?.staff || staffRes.value?.data || [];
          const activeStaff = raw.filter((s) => !s.isDeleted);
          totalStaffCount = activeStaff.length;
        }

        setStats({
          courses: totalCoursesCount,
          interns: totalInternsCount,
          batches: totalBatchesCount,
          staff: totalStaffCount,
        });

        setCoursesList(loadedCourses);

        // Process Real Tasks for Upcoming Test / Evaluation & Weekly Activity
        let allTasks = [];
        if (tasksRes.status === "fulfilled") {
          allTasks = Array.isArray(tasksRes.value)
            ? tasksRes.value
            : tasksRes.value?.tasks || tasksRes.value?.data || [];
        }

        // 1. Upcoming Test / Task from real data
        const pendingTasks = allTasks.filter(
          (t) => t.status !== "Completed" && t.status !== "Cancelled"
        );

        pendingTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        const testTask =
          pendingTasks.find(
            (t) =>
              (t.taskType && /test|eval|exam|assessment/i.test(t.taskType)) ||
              (t.title && /test|eval|exam|assessment/i.test(t.title))
          ) ||
          pendingTasks[0] ||
          null;

        if (testTask) {
          const batchNames = Array.isArray(testTask.batches)
            ? testTask.batches
                .map((b) => (typeof b === "object" ? b.batchName : b))
                .filter(Boolean)
            : [];

          const branchNames = Array.isArray(testTask.branch)
            ? testTask.branch
                .map((br) => (typeof br === "object" ? br.branchName : br))
                .filter(Boolean)
            : testTask.branch?.branchName
            ? [testTask.branch.branchName]
            : [];

          const dueDateObj = testTask.dueDate ? new Date(testTask.dueDate) : null;
          const timingStr = dueDateObj
            ? `${dueDateObj.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}`
            : "Scheduled";

          setUpcomingTest({
            id: testTask._id,
            badge: /test|exam|assessment/i.test(
              testTask.title || testTask.taskType
            )
              ? "UPCOMING TEST"
              : `UPCOMING ${testTask.taskType ? testTask.taskType.toUpperCase() : "TASK"}`,
            title: testTask.title || "Evaluation",
            timing: timingStr,
            batchTag: batchNames.length > 0 ? batchNames.join(", ") : null,
            branchTag: branchNames.length > 0 ? branchNames.join(", ") : null,
          });
        } else {
          setUpcomingTest(null);
        }

        // 2. Real Weekly Activity for current week
        const weekDays = [
          { day: "Mon", count: 0 },
          { day: "Tue", count: 0 },
          { day: "Wed", count: 0 },
          { day: "Thu", count: 0 },
          { day: "Fri", count: 0 },
        ];

        const startOfWeek = new Date();
        const dayIdx = startOfWeek.getDay();
        const diffToMon = dayIdx === 0 ? -6 : 1 - dayIdx;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        let totalActivities = 0;
        allTasks.forEach((task) => {
          const taskDate = new Date(
            task.dueDate || task.startDate || task.createdAt
          );
          if (taskDate >= startOfWeek && taskDate <= endOfWeek) {
            const dayNum = taskDate.getDay();
            if (dayNum >= 1 && dayNum <= 5) {
              weekDays[dayNum - 1].count += 1;
              totalActivities += 1;
            }
          }
        });

        if (totalActivities > 0) {
          const maxCount = Math.max(...weekDays.map((d) => d.count), 1);
          const computedActivity = weekDays.map((d) => ({
            day: d.day,
            hours: `${(d.count * 1.5).toFixed(1)}h`,
            percentage: Math.min(Math.round((d.count / maxCount) * 100), 100),
          }));
          setWeeklyActivity(computedActivity);
          setHasWeeklyActivity(true);
        } else {
          setWeeklyActivity([]);
          setHasWeeklyActivity(false);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (activeFilter === "Popular") {
        return course.enrolledCount > 0 || course.name.includes("DATA");
      }
      if (activeFilter === "Ongoing") {
        return course.courseType === "Regular";
      }
      if (activeFilter === "Upcoming") {
        return course.duration.includes("1 Year") || course.name.includes("FLUTTER");
      }
      return true;
    });
  }, [coursesList, searchQuery, activeFilter]);

  return (
    <div className="dsh-container">
      {/* Top Welcome & Search Header */}
      <header className="dsh-header-row">
        <div className="dsh-welcome-group">
          <h1 className="dsh-welcome-title">
            Welcome back, <span className="dsh-brand-name">Softronii<span className="dsh-brand-x">X</span></span>
          </h1>
          <p className="dsh-welcome-subtitle">
            Manage courses, interns, staff, and daily operations efficiently from one place.
          </p>
        </div>

        <div className="dsh-actions-group">
          <div className="dsh-search-bar">
            <FiSearch className="dsh-search-icon" />
            <input
              type="text"
              placeholder="Search pages, courses, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dsh-search-input"
            />
          </div>

          <button
            type="button"
            className="dsh-bell-btn"
            onClick={() => navigate("/notification")}
            title="Notifications"
          >
            <FiBell />
            <span className="dsh-bell-badge" />
          </button>
        </div>
      </header>

      {/* 4 Top KPI Stat Cards */}
      <section className="dsh-stats-grid">
        {/* Total Courses */}
        <div
          className="dsh-stat-card"
          onClick={() => navigate("/course")}
          role="button"
          tabIndex={0}
        >
          <div className="dsh-stat-card-top">
            <div className="dsh-stat-icon-box">
              <LuBookOpen />
            </div>
            <div className="dsh-stat-content">
              <span className="dsh-stat-label">Total Courses</span>
              <h2 className="dsh-stat-value">{stats.courses}</h2>
            </div>
            <button
              type="button"
              className="dsh-stat-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/course");
              }}
              title="View Courses"
            >
              <FiArrowUpRight />
            </button>
          </div>
          <div className="dsh-stat-footer">
            <span className="dsh-stat-subtext">+2 this month</span>
          </div>
        </div>

        {/* Total Interns */}
        <div
          className="dsh-stat-card"
          onClick={() => navigate("/internmanagement")}
          role="button"
          tabIndex={0}
        >
          <div className="dsh-stat-card-top">
            <div className="dsh-stat-icon-box">
              <LuUsers />
            </div>
            <div className="dsh-stat-content">
              <span className="dsh-stat-label">Total Interns</span>
              <h2 className="dsh-stat-value">{stats.interns}</h2>
            </div>
            <button
              type="button"
              className="dsh-stat-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/internmanagement");
              }}
              title="View Interns"
            >
              <FiArrowUpRight />
            </button>
          </div>
          <div className="dsh-stat-footer">
            <span className="dsh-stat-subtext">+3 this month</span>
          </div>
        </div>

        {/* Active Batches */}
        <div
          className="dsh-stat-card"
          onClick={() => navigate("/batchmanagement")}
          role="button"
          tabIndex={0}
        >
          <div className="dsh-stat-card-top">
            <div className="dsh-stat-icon-box">
              <LuLayers />
            </div>
            <div className="dsh-stat-content">
              <span className="dsh-stat-label">Active Batches</span>
              <h2 className="dsh-stat-value">{stats.batches}</h2>
            </div>
            <button
              type="button"
              className="dsh-stat-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/batchmanagement");
              }}
              title="View Batches"
            >
              <FiArrowUpRight />
            </button>
          </div>
          <div className="dsh-stat-footer">
            <span className="dsh-stat-subtext">2 ongoing</span>
          </div>
        </div>

        {/* Total Staff */}
        <div
          className="dsh-stat-card"
          onClick={() => navigate("/staffmanagement")}
          role="button"
          tabIndex={0}
        >
          <div className="dsh-stat-card-top">
            <div className="dsh-stat-icon-box">
              <LuUserCheck />
            </div>
            <div className="dsh-stat-content">
              <span className="dsh-stat-label">Total Staff</span>
              <h2 className="dsh-stat-value">{stats.staff}</h2>
            </div>
            <button
              type="button"
              className="dsh-stat-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/staffmanagement");
              }}
              title="View Staff"
            >
              <FiArrowUpRight />
            </button>
          </div>
          <div className="dsh-stat-footer">
            <span className="dsh-stat-subtext">+1 this month</span>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content Workspace */}
      <div className="dsh-main-grid">
        {/* Left Column: Latest Courses */}
        <section className="dsh-courses-section">
          <div className="dsh-section-header">
            <h2 className="dsh-section-title">Latest Courses</h2>

            <div className="dsh-filters-wrap">
              <div className="dsh-filter-pills">
                {["All", "Popular", "Ongoing", "Upcoming"].map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className={`dsh-pill-btn ${activeFilter === pill ? "dsh-pill-btn--active" : ""}`}
                    onClick={() => setActiveFilter(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="dsh-see-all-btn"
                onClick={() => navigate("/course")}
              >
                See all &gt;
              </button>
            </div>
          </div>

          {/* 2-Column Course Cards Grid */}
          <div className="dsh-courses-grid">
            {filteredCourses.length > 0 ? (
              filteredCourses.slice(0, 4).map((course) => (
                <div key={course.id} className="dsh-course-card">
                  <div className="dsh-course-top">
                    <div className="dsh-course-thumb-wrap">
                      <img
                        src={course.image}
                        alt={course.name}
                        className="dsh-course-thumb"
                        loading="lazy"
                      />
                      <span className="dsh-course-badge">{course.courseType}</span>
                    </div>

                    <div className="dsh-course-info">
                      <div className="dsh-course-meta-row">
                        <span className="dsh-course-duration">
                          Duration: {course.duration}
                        </span>
                        <button
                          type="button"
                          className="dsh-course-menu-btn"
                          onClick={() => navigate("/course")}
                          title="Course Options"
                        >
                          <FiMoreVertical />
                        </button>
                      </div>

                      <h3 className="dsh-course-name">{course.name}</h3>
                      <p className="dsh-course-desc">{course.description}</p>
                    </div>
                  </div>

                  <div className="dsh-course-footer">
                    <div className="dsh-course-metrics">
                      <span className="dsh-metric-item">
                        <LuFolderGit2 className="dsh-metric-icon" />
                        Modules {course.modulesCount}
                      </span>
                      <span className="dsh-metric-item">
                        <LuUsers className="dsh-metric-icon" />
                        Enrolled {course.enrolledCount}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="dsh-view-details-btn"
                      onClick={() => navigate("/course")}
                    >
                      View Details &rarr;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="dsh-no-courses">
                <p>No courses available</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Weekly Activity & Upcoming Test */}
        <aside className="dsh-sidebar-col">
          {/* Weekly Activity Card */}
          <div className="dsh-widget-card">
            <div className="dsh-widget-header">
              <div className="dsh-widget-title-group">
                <FiBarChart2 className="dsh-widget-icon" />
                <h3 className="dsh-widget-title">Weekly Activity</h3>
              </div>
              <div className="dsh-dropdown-pill">
                <span>This Week</span>
                <FiChevronDown />
              </div>
            </div>

            <div className="dsh-activity-list">
              {hasWeeklyActivity && weeklyActivity.length > 0 ? (
                weeklyActivity.map((act) => (
                  <div key={act.day} className="dsh-activity-row">
                    <span className="dsh-activity-day">{act.day}</span>
                    <div className="dsh-activity-track">
                      <div
                        className="dsh-activity-fill"
                        style={{ width: `${act.percentage}%` }}
                      />
                    </div>
                    <span className="dsh-activity-hours">{act.hours}</span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#94a3b8",
                    textAlign: "center",
                    padding: "24px 0",
                    margin: 0,
                  }}
                >
                  No activity this week
                </p>
              )}
            </div>
          </div>

          {/* Upcoming Test Orange Gradient Card */}
          <div className="dsh-test-card">
            <div className="dsh-test-header">
              <FiCalendar className="dsh-test-icon" />
              <span className="dsh-test-badge-title">
                {upcomingTest ? upcomingTest.badge : "UPCOMING TEST"}
              </span>
            </div>

            {upcomingTest ? (
              <div className="dsh-test-body">
                <h4 className="dsh-test-name">{upcomingTest.title}</h4>
                <p className="dsh-test-timing">{upcomingTest.timing}</p>
                {(upcomingTest.batchTag || upcomingTest.branchTag) && (
                  <div className="dsh-test-footer">
                    {upcomingTest.batchTag && (
                      <span className="dsh-test-tag">{upcomingTest.batchTag}</span>
                    )}
                    {upcomingTest.branchTag && (
                      <span className="dsh-test-tag">{upcomingTest.branchTag}</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="dsh-test-body">
                <h4 className="dsh-test-name">No upcoming tests</h4>
                <p className="dsh-test-timing">
                  No pending evaluations or tasks scheduled
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
