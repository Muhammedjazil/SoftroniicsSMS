
import React, { useEffect, useMemo, useState } from "react";
import {
  MdPersonOutline,
  MdOutlineCalendarToday,
  MdVisibility
} from "react-icons/md";
import AdminService from "../../../services/admin-api-services/AdminService";
import "./Attendancestudent.css";

const Attendancestudent = () => {
  const {
    takebranch,
    takebatches,
    getAttendanceStudents,
    createDailyAttendance,
    saveAttendance,
    getAttendanceReports
  } = AdminService();

  // ============================================
  // STATES
  // ============================================

  const [attendanceStudentActiveTab, setAttendanceStudentActiveTab] =
    useState("student");

  const [attendanceStudentStudents, setAttendanceStudentStudents] =
    useState([]);

  const [attendanceStudentBranches, setAttendanceStudentBranches] =
    useState([]);

  const [attendanceStudentBatches, setAttendanceStudentBatches] =
    useState([]);

  const [attendanceStudentBranch, setAttendanceStudentBranch] =
    useState("");

  const [attendanceStudentBatch, setAttendanceStudentBatch] =
    useState("All Batches");

  const [attendanceStudentDay, setAttendanceStudentDay] =
    useState("Monday");

  const [attendanceStudentSelectedDate, setAttendanceStudentSelectedDate] =
    useState(new Date().toISOString().split("T")[0]);

  const [attendanceStudentCreated, setAttendanceStudentCreated] =
    useState(false);

  const [attendanceStudentLoading, setAttendanceStudentLoading] =
    useState(false);

  const [attendanceStudentSaving, setAttendanceStudentSaving] =
    useState(false);

  const [attendanceStudentReportData, setAttendanceStudentReportData] =
    useState([]);

  const [attendanceStudentReportLoading, setAttendanceStudentReportLoading] =
    useState(false);

  // Report filters
  const [attendanceStudentSearch, setAttendanceStudentSearch] =
    useState("");

  const [attendanceStudentReportBranch, setAttendanceStudentReportBranch] =
    useState("All Branches");

  const [attendanceStudentMentor, setAttendanceStudentMentor] =
    useState("All Mentors");

  const [attendanceStudentYear, setAttendanceStudentYear] =
    useState(String(new Date().getFullYear()));

  const [attendanceStudentMonth, setAttendanceStudentMonth] =
    useState(new Date().toLocaleString("en-US", { month: "long" }));

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getArray = (response, keys = []) => {
    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.data)) return response.data;

    for (const key of keys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }
    }

    return [];
  };

  const getId = (value) => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  };

  const getName = (value, fallback = "") => {
    if (!value) return fallback;

    if (typeof value === "string") return value;

    return (
      value.fullName ||
      value.name ||
      value.branchName ||
      value.batchName ||
      value.courseName ||
      fallback
    );
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ============================================
  // FETCH BRANCHES
  // ============================================

  const attendanceStudentFetchBranches = async () => {
    try {
      const response = await takebranch();

      const branches = getArray(response, ["branches"]);

      setAttendanceStudentBranches(branches);

      if (branches.length > 0) {
        setAttendanceStudentBranch(
          getId(branches[0])
        );
      }
    } catch (error) {
      console.error(
        "Branch fetch error:",
        error.response?.data || error.message
      );
    }
  };

  // ============================================
  // FETCH BATCHES
  // ============================================

  const attendanceStudentFetchBatches = async () => {
    try {
      const response = await takebatches();

      const batches = getArray(response, ["batches"]);

      setAttendanceStudentBatches(batches);
    } catch (error) {
      console.error(
        "Batch fetch error:",
        error.response?.data || error.message
      );
    }
  };

  // ============================================
  // FETCH STUDENTS
  // ============================================

  const attendanceStudentFetchStudents = async () => {
    if (!attendanceStudentBranch) return;

    try {
      setAttendanceStudentLoading(true);

      const params = {
        branch: attendanceStudentBranch,
        batch:
          attendanceStudentBatch === "All Batches"
            ? ""
            : attendanceStudentBatch,
        date: attendanceStudentSelectedDate
      };

      const response = await getAttendanceStudents(params);

      const students = getArray(response, ["students", "interns"]);

      const formattedStudents = students.map((student) => ({
        id: student._id || student.id,
        name: student.fullName || student.name || "Unknown",
        email: student.email || "",
        course: getName(student.course, ""),
        branch: getId(student.branch),
        batch: getId(student.batch),
        status: student.attendanceCreated ? "Created" : "Not Created",
        mentorCard: "View Card",
        attendance:
          student.attendance === "PRESENT" ||
          student.attendance === "present"
            ? "present"
            : student.attendance === "ABSENT" ||
                student.attendance === "absent"
              ? "absent"
              : "unmarked"
      }));

      setAttendanceStudentStudents(formattedStudents);

      setAttendanceStudentCreated(
        formattedStudents.some((student) => student.status === "Created")
      );
    } catch (error) {
      console.error(
        "Student fetch error:",
        error.response?.data || error.message
      );

      setAttendanceStudentStudents([]);
    } finally {
      setAttendanceStudentLoading(false);
    }
  };

  // ============================================
  // FETCH ATTENDANCE REPORTS
  // ============================================

  const attendanceStudentFetchReports = async () => {
    try {
      setAttendanceStudentReportLoading(true);

      const params = {
        year: attendanceStudentYear,
        month: attendanceStudentMonth,
        branch:
          attendanceStudentReportBranch === "All Branches"
            ? ""
            : attendanceStudentReportBranch
      };

      const response = await getAttendanceReports(params);

      const reports = getArray(response, ["reports", "attendanceReports"]);

      const formattedReports = reports.map((record) => ({
        id: record._id || record.id,
        name:
          record.intern?.fullName ||
          record.intern?.name ||
          record.name ||
          "Unknown",
        email: record.intern?.email || record.email || "",
        branch: getName(record.branch, ""),
        mentor:
          record.mentor?.fullName ||
          record.mentor?.name ||
          record.mentor ||
          "Not Assigned",
        present: record.present || 0,
        absent: record.absent || 0,
        percentage: record.percentage || 0,
        date: record.date
      }));

      setAttendanceStudentReportData(formattedReports);
    } catch (error) {
      console.error(
        "Attendance report error:",
        error.response?.data || error.message
      );

      setAttendanceStudentReportData([]);
    } finally {
      setAttendanceStudentReportLoading(false);
    }
  };

  // ============================================
  // USE EFFECTS
  // ============================================

  useEffect(() => {
    attendanceStudentFetchBranches();
    attendanceStudentFetchBatches();
  }, []);

  useEffect(() => {
    attendanceStudentFetchStudents();
  }, [
    attendanceStudentBranch,
    attendanceStudentBatch,
    attendanceStudentSelectedDate
  ]);

  useEffect(() => {
    if (attendanceStudentActiveTab === "report") {
      attendanceStudentFetchReports();
    }
  }, [
    attendanceStudentActiveTab,
    attendanceStudentYear,
    attendanceStudentMonth,
    attendanceStudentReportBranch
  ]);

  // ============================================
  // FILTER BATCHES BY BRANCH
  // ============================================

  const attendanceStudentFilteredBatches = useMemo(() => {
    return attendanceStudentBatches.filter((batch) => {
      return getId(batch.branch) === attendanceStudentBranch;
    });
  }, [attendanceStudentBatches, attendanceStudentBranch]);

  // ============================================
  // SUMMARY CALCULATIONS
  // ============================================

  const attendanceStudentTotal =
    attendanceStudentStudents.length;

  const attendanceStudentPresent =
    attendanceStudentStudents.filter(
      (student) => student.attendance === "present"
    ).length;

  const attendanceStudentAbsent =
    attendanceStudentStudents.filter(
      (student) => student.attendance === "absent"
    ).length;

  // ============================================
  // REPORT FILTERED DATA
  // ============================================

  const attendanceStudentFilteredReports = useMemo(() => {
    return attendanceStudentReportData.filter((record) => {
      const search = attendanceStudentSearch.toLowerCase();

      const searchMatch =
        record.name?.toLowerCase().includes(search) ||
        record.email?.toLowerCase().includes(search);

      const branchMatch =
        attendanceStudentReportBranch === "All Branches" ||
        record.branch ===
          getName(
            attendanceStudentBranches.find(
              (branch) =>
                getId(branch) === attendanceStudentReportBranch
            ),
            attendanceStudentReportBranch
          );

      const mentorMatch =
        attendanceStudentMentor === "All Mentors" ||
        record.mentor === attendanceStudentMentor;

      return searchMatch && branchMatch && mentorMatch;
    });
  }, [
    attendanceStudentReportData,
    attendanceStudentSearch,
    attendanceStudentReportBranch,
    attendanceStudentMentor,
    attendanceStudentBranches
  ]);

  const attendanceStudentMentors = [
    ...new Set(
      attendanceStudentReportData
        .map((record) => record.mentor)
        .filter((mentor) => mentor && mentor !== "Not Assigned")
    )
  ];

  // ============================================
  // TOGGLE STUDENT ATTENDANCE
  // ============================================

  const attendanceStudentHandleToggle = (studentId, checked) => {
    setAttendanceStudentStudents((previousStudents) =>
      previousStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              attendance: checked ? "present" : "absent"
            }
          : student
      )
    );
  };

  // ============================================
  // CREATE DAILY ATTENDANCE
  // ============================================

  const attendanceStudentHandleCreate = async () => {
    if (!attendanceStudentBranch) {
      alert("Please select a branch");
      return;
    }

    if (attendanceStudentBatch === "All Batches") {
      alert("Please select a batch before creating attendance");
      return;
    }

    try {
      const payload = {
        date: attendanceStudentSelectedDate,
        branch: attendanceStudentBranch,
        batch: attendanceStudentBatch,
        day: attendanceStudentDay
      };

      await createDailyAttendance(payload);

      setAttendanceStudentCreated(true);

      setAttendanceStudentStudents((previousStudents) =>
        previousStudents.map((student) => ({
          ...student,
          status: "Created"
        }))
      );

      alert("Daily attendance created successfully");
    } catch (error) {
      console.error(
        "Create attendance error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to create daily attendance"
      );
    }
  };

  // ============================================
  // SAVE ATTENDANCE
  // ============================================

  const attendanceStudentHandleSave = async () => {
    if (!attendanceStudentCreated) {
      alert("Please create daily attendance first");
      return;
    }

    if (attendanceStudentStudents.length === 0) {
      alert("No students available");
      return;
    }

    const unmarkedStudents = attendanceStudentStudents.filter(
      (student) => student.attendance === "unmarked"
    );

    if (unmarkedStudents.length > 0) {
      alert("Please mark attendance for all students");
      return;
    }

    try {
      setAttendanceStudentSaving(true);

      const attendancePayload = {
        date: attendanceStudentSelectedDate,
        branch: attendanceStudentBranch,
        batch: attendanceStudentBatch,
        students: attendanceStudentStudents.map((student) => ({
          internId: student.id,
          status:
            student.attendance === "present" ? "PRESENT" : "ABSENT"
        }))
      };

      await saveAttendance(attendancePayload);

      alert("Attendance saved successfully");

      attendanceStudentFetchStudents();
    } catch (error) {
      console.error(
        "Save attendance error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to save attendance"
      );
    } finally {
      setAttendanceStudentSaving(false);
    }
  };

  // ============================================
  // VIEW MENTOR CARD
  // ============================================

  const attendanceStudentHandleViewCard = (student) => {
    console.log("Selected student:", student);
    alert(`Intern: ${student.name}`);
  };

  // ============================================
  // EXPORT REPORT
  // ============================================

  const attendanceStudentHandleExport = () => {
    if (attendanceStudentFilteredReports.length === 0) {
      alert("No attendance records available to export");
      return;
    }

    window.print();
  };

  // ============================================
  // MAIN JSX
  // ============================================

  return (
    <div className="attendance-student-page">
      <div className="attendance-student-main">

        {/* TOP NAVIGATION */}

        <div className="attendance-student-topbar">
          <div className="attendance-student-tabs">
            <button
              type="button"
              className={
                attendanceStudentActiveTab === "student"
                  ? "attendance-student-tab attendance-student-tab-active"
                  : "attendance-student-tab"
              }
              onClick={() => setAttendanceStudentActiveTab("student")}
            >
              Student Attendance
            </button>

            <button
              type="button"
              className={
                attendanceStudentActiveTab === "report"
                  ? "attendance-student-tab attendance-student-tab-active"
                  : "attendance-student-tab"
              }
              onClick={() => setAttendanceStudentActiveTab("report")}
            >
              Report
            </button>
          </div>

          {/* STUDENT ATTENDANCE FILTERS */}

          {attendanceStudentActiveTab === "student" && (
            <div className="attendance-student-top-filters">

              <select
                id="attendance-student-day"
                value={attendanceStudentDay}
                onChange={(e) =>
                  setAttendanceStudentDay(e.target.value)
                }
              >
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <select
                id="attendance-student-branch"
                value={attendanceStudentBranch}
                onChange={(e) => {
                  setAttendanceStudentBranch(e.target.value);
                  setAttendanceStudentBatch("All Batches");
                }}
              >
                <option value="">Select Branch</option>

                {attendanceStudentBranches.map((branch) => (
                  <option key={getId(branch)} value={getId(branch)}>
                    {getName(branch)}
                  </option>
                ))}
              </select>

              <select
                id="attendance-student-batch"
                value={attendanceStudentBatch}
                onChange={(e) =>
                  setAttendanceStudentBatch(e.target.value)
                }
              >
                <option value="All Batches">All Batches</option>

                {attendanceStudentFilteredBatches.map((batch) => (
                  <option key={getId(batch)} value={getId(batch)}>
                    {getName(batch)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* STUDENT ATTENDANCE SCREEN */}

        {attendanceStudentActiveTab === "student" && (
          <div className="attendance-student-content">

            {/* CREATE DAILY ATTENDANCE */}

            <div className="attendance-student-create-row">
              <button
                type="button"
                className="attendance-student-create-btn"
                onClick={attendanceStudentHandleCreate}
              >
                {attendanceStudentCreated
                  ? "Attendance Created"
                  : "Create Daily Attendance"}
              </button>
            </div>

            {/* SUMMARY CARDS */}

            <div className="attendance-student-summary">
              <div className="attendance-student-summary-card">
                <p>Total Records</p>
                <h2 className="attendance-student-total">
                  {String(attendanceStudentTotal).padStart(2, "0")}
                </h2>
              </div>

              <div className="attendance-student-summary-card">
                <p>Total Present</p>
                <h2 className="attendance-student-present">
                  {String(attendanceStudentPresent).padStart(2, "0")}
                </h2>
              </div>

              <div className="attendance-student-summary-card">
                <p>Total Absent</p>
                <h2 className="attendance-student-absent">
                  {String(attendanceStudentAbsent).padStart(2, "0")}
                </h2>
              </div>
            </div>

            {/* ATTENDANCE TABLE */}

            <div className="attendance-student-table-card">
              <div className="attendance-student-table-heading">
                <h2>Attendance</h2>

                <div className="attendance-student-selected-date">
                  <span>Selected Date:</span>

                  <strong>
                    {new Date(
                      attendanceStudentSelectedDate + "T00:00:00"
                    ).toLocaleDateString("en-GB")}
                  </strong>

                  <div className="attendance-student-date-input">
                    <input
                      id="attendance-student-selected-date"
                      type="date"
                      value={attendanceStudentSelectedDate}
                      onChange={(e) => {
                        setAttendanceStudentSelectedDate(e.target.value);
                        setAttendanceStudentCreated(false);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="attendance-student-table-wrapper">
                <table className="attendance-student-table">
                  <thead>
                    <tr>
                      <th>Intern Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Mentor Card</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendanceStudentLoading ? (
                      <tr>
                        <td colSpan="6" className="attendance-student-empty">
                          Loading students...
                        </td>
                      </tr>
                    ) : attendanceStudentStudents.length > 0 ? (
                      attendanceStudentStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="attendance-student-name">
                            {student.name}
                          </td>

                          <td className="attendance-student-email">
                            {student.email}
                          </td>

                          <td>{student.course}</td>

                          <td>
                            <span
                              className={
                                student.status === "Created"
                                  ? "attendance-student-status attendance-student-status-created"
                                  : "attendance-student-status"
                              }
                            >
                              {student.status}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="attendance-student-view-card"
                              onClick={() =>
                                attendanceStudentHandleViewCard(student)
                              }
                            >
                              {student.mentorCard}
                            </button>
                          </td>

                          <td>
                            <label className="attendance-student-switch">
                              <input
                                id={`attendance-student-toggle-${student.id}`}
                                type="checkbox"
                                checked={student.attendance === "present"}
                                disabled={!attendanceStudentCreated}
                                onChange={(e) =>
                                  attendanceStudentHandleToggle(
                                    student.id,
                                    e.target.checked
                                  )
                                }
                              />

                              <span className="attendance-student-slider"></span>
                            </label>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="attendance-student-empty">
                          No students available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* SAVE BUTTON */}

              <div className="attendance-student-save-row">
                <button
                  type="button"
                  className="attendance-student-save-btn"
                  onClick={attendanceStudentHandleSave}
                  disabled={attendanceStudentSaving}
                >
                  {attendanceStudentSaving
                    ? "Saving..."
                    : "Save Attendance"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPORT SCREEN */}

        {attendanceStudentActiveTab === "report" && (
          <div className="attendance-student-report-container">

            {/* REPORT FILTERS */}

            <div className="attendance-student-report-filters">

              <input
                id="attendance-student-search"
                type="search"
                placeholder="Search intern..."
                value={attendanceStudentSearch}
                onChange={(e) =>
                  setAttendanceStudentSearch(e.target.value)
                }
              />

              <select
                id="attendance-student-report-branch"
                value={attendanceStudentReportBranch}
                onChange={(e) =>
                  setAttendanceStudentReportBranch(e.target.value)
                }
              >
                <option value="All Branches">All Branches</option>

                {attendanceStudentBranches.map((branch) => (
                  <option key={getId(branch)} value={getId(branch)}>
                    {getName(branch)}
                  </option>
                ))}
              </select>

              <select
                id="attendance-student-mentor"
                value={attendanceStudentMentor}
                onChange={(e) =>
                  setAttendanceStudentMentor(e.target.value)
                }
              >
                <option value="All Mentors">All Mentors</option>

                {attendanceStudentMentors.map((mentor) => (
                  <option key={mentor} value={mentor}>
                    {mentor}
                  </option>
                ))}
              </select>

              <select
                id="attendance-student-year"
                value={attendanceStudentYear}
                onChange={(e) =>
                  setAttendanceStudentYear(e.target.value)
                }
              >
                {[2025, 2026, 2027].map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                id="attendance-student-month"
                value={attendanceStudentMonth}
                onChange={(e) =>
                  setAttendanceStudentMonth(e.target.value)
                }
              >
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December"
                ].map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="attendance-student-export-btn"
                disabled={attendanceStudentFilteredReports.length === 0}
                onClick={attendanceStudentHandleExport}
              >
                Export PDF
              </button>
            </div>

            {/* REPORT RESULTS */}

            <div className="attendance-student-report-results">
              {attendanceStudentReportLoading ? (
                <div className="attendance-student-no-records">
                  <h4>Loading attendance reports...</h4>
                </div>
              ) : attendanceStudentFilteredReports.length === 0 ? (
                <div className="attendance-student-no-records">
                  <h4>
                    No attendance records found for the selected month
                  </h4>

                  <p>
                    Try selecting a different month or check if
                    attendance has been marked
                  </p>
                </div>
              ) : (
                <div className="attendance-student-report-table-wrapper">
                  <table className="attendance-student-report-table">
                    <thead>
                      <tr>
                        <th>Intern Name</th>
                        <th>Email</th>
                        <th>Mentor</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>

                    <tbody>
                      {attendanceStudentFilteredReports.map(
                        (record, index) => (
                          <tr key={record.id || index}>
                            <td>{record.name}</td>
                            <td>{record.email}</td>
                            <td>{record.mentor}</td>
                            <td>{record.present}</td>
                            <td>{record.absent}</td>
                            <td>{record.percentage}%</td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendancestudent;
