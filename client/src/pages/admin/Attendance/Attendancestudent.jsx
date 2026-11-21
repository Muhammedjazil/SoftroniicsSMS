
import React, { useMemo, useState } from "react";
import {
    MdPersonOutline,
    MdOutlineCalendarToday,
    MdVisibility
} from "react-icons/md";

import "./Attendancestudent.css";


// ================================================
// SAMPLE STUDENT DATA
// Replace with API data later
// ================================================

const attendanceStudentInitialData = [
    {
        id: 1,
        name: "HASHIM N",
        email: "hashim.njandoli@gmail.com",
        course: "PYTHON 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 2,
        name: "SAYANTH",
        email: "sayanthsajeev721@gmail.com",
        course: "MERN 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 3,
        name: "ADEEB N",
        email: "adeebn479@gmail.com",
        course: "MERN 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 4,
        name: "MUHAMMED JAZIL K",
        email: "muhammedjazil87@gmail.com",
        course: "MERN 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 5,
        name: "JOHN ABRAHAM",
        email: "johnabraham@gmail.com",
        course: "UI/UX DESIGNING",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 6,
        name: "ARJUN",
        email: "arjun@gmail.com",
        course: "MERN 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 7,
        name: "THOMAS",
        email: "thomas@gmail.com",
        course: "PYTHON 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 8,
        name: "PRIYESH",
        email: "priyesh@gmail.com",
        course: "MERN 6 MONTH",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    },
    {
        id: 9,
        name: "VISHNU",
        email: "vishnu@gmail.com",
        course: "UI/UX DESIGNING",
        status: "Not Created",
        mentorCard: "View Card",
        attendance: "unmarked"
    }
];


// ================================================
// COMPONENT
// ================================================

const Attendancestudent = () => {

    // ============================================
    // STATES
    // ============================================

    const [attendanceStudentActiveTab, setAttendanceStudentActiveTab] =
        useState("student");

    const [attendanceStudentStudents, setAttendanceStudentStudents] =
        useState(attendanceStudentInitialData);

    const [attendanceStudentDay, setAttendanceStudentDay] =
        useState("Wednesday");

    const [attendanceStudentBranch, setAttendanceStudentBranch] =
        useState("calicut");

    const [attendanceStudentBatch, setAttendanceStudentBatch] =
        useState("All Batches");

    const [attendanceStudentSelectedDate, setAttendanceStudentSelectedDate] =
        useState("2026-11-11");

    const [attendanceStudentCreated, setAttendanceStudentCreated] =
        useState(false);

    // Report states

    const [attendanceStudentSearch, setAttendanceStudentSearch] =
        useState("");

    const [attendanceStudentReportBranch, setAttendanceStudentReportBranch] =
        useState("calicut");

    const [attendanceStudentMentor, setAttendanceStudentMentor] =
        useState("All Mentors");

    const [attendanceStudentYear, setAttendanceStudentYear] =
        useState("2026");

    const [attendanceStudentMonth, setAttendanceStudentMonth] =
        useState("November");


    // ============================================
    // REPORT DATA
    // Initially empty as shown in Figma
    // ============================================

    const [attendanceStudentReportData] = useState([]);


    // ============================================
    // SUMMARY CALCULATIONS
    // ============================================

    const attendanceStudentTotal =
        attendanceStudentStudents.length;

    const attendanceStudentPresent =
        attendanceStudentStudents.filter(
            student => student.attendance === "present"
        ).length;

    const attendanceStudentAbsent =
        attendanceStudentStudents.filter(
            student => student.attendance === "absent"
        ).length;


    // ============================================
    // ATTENDANCE FILTERED DATA
    // ============================================

    const attendanceStudentFilteredStudents = useMemo(() => {

        return attendanceStudentStudents;

    }, [attendanceStudentStudents]);


    // ============================================
    // REPORT FILTERED DATA
    // ============================================

    const attendanceStudentFilteredReports = useMemo(() => {

        return attendanceStudentReportData.filter(record => {

            const searchMatch =
                record.name?.toLowerCase().includes(
                    attendanceStudentSearch.toLowerCase()
                ) ||
                record.email?.toLowerCase().includes(
                    attendanceStudentSearch.toLowerCase()
                );

            const branchMatch =
                attendanceStudentReportBranch === "All Branches" ||
                record.branch === attendanceStudentReportBranch;

            const mentorMatch =
                attendanceStudentMentor === "All Mentors" ||
                record.mentor === attendanceStudentMentor;

            return searchMatch && branchMatch && mentorMatch;

        });

    }, [
        attendanceStudentReportData,
        attendanceStudentSearch,
        attendanceStudentReportBranch,
        attendanceStudentMentor
    ]);


    // ============================================
    // TOGGLE STUDENT ATTENDANCE
    // ============================================

    const attendanceStudentHandleToggle = (studentId, checked) => {

        setAttendanceStudentStudents(previousStudents =>
            previousStudents.map(student =>
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

    const attendanceStudentHandleCreate = () => {

        setAttendanceStudentCreated(true);

        setAttendanceStudentStudents(previousStudents =>
            previousStudents.map(student => ({
                ...student,
                status: "Created"
            }))
        );

        console.log("Daily attendance creation requested");

        // Connect your create daily attendance API here.
    };


    // ============================================
    // SAVE ATTENDANCE
    // ============================================

    const attendanceStudentHandleSave = () => {

        const attendancePayload = {
            date: attendanceStudentSelectedDate,
            branch: attendanceStudentBranch,
            batch: attendanceStudentBatch,

            students: attendanceStudentStudents.map(student => ({
                studentId: student.id,
                name: student.name,
                attendance: student.attendance
            }))
        };

        console.log("Attendance payload:", attendancePayload);

        // Connect your save attendance API here.
        alert("Attendance saved successfully!");

    };


    // ============================================
    // VIEW MENTOR CARD
    // ============================================

    const attendanceStudentHandleViewCard = (student) => {

        console.log("Selected student:", student);

        // Navigate to mentor card details or open a modal here.
    };


    // ============================================
    // EXPORT REPORT
    // ============================================

    const attendanceStudentHandleExport = () => {

        if (attendanceStudentFilteredReports.length === 0) {
            return;
        }

        // Print the report for saving as PDF.
        window.print();

    };


    // ============================================
    // MAIN JSX
    // ============================================

    return (

        <div className="attendance-student-page">

            {/* =====================================
                HEADER
            ===================================== */}

            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <div className="attendance-student-main">


                {/* =================================
                    TOP NAVIGATION
                ================================= */}

                <div className="attendance-student-topbar">

                    <div className="attendance-student-tabs">

                        <button
                            type="button"
                            className={
                                attendanceStudentActiveTab === "student"
                                    ? "attendance-student-tab attendance-student-tab-active"
                                    : "attendance-student-tab"
                            }
                            onClick={() =>
                                setAttendanceStudentActiveTab("student")
                            }
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
                            onClick={() =>
                                setAttendanceStudentActiveTab("report")
                            }
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
                                onChange={e =>
                                    setAttendanceStudentDay(e.target.value)
                                }
                            >
                                <option value="Monday">Monday</option>
                                <option value="Tuesday">Tuesday</option>
                                <option value="Wednesday">Wednesday</option>
                                <option value="Thursday">Thursday</option>
                                <option value="Friday">Friday</option>
                                <option value="Saturday">Saturday</option>
                                <option value="Sunday">Sunday</option>
                            </select>


                            <select
                                id="attendance-student-branch"
                                value={attendanceStudentBranch}
                                onChange={e =>
                                    setAttendanceStudentBranch(e.target.value)
                                }
                            >
                                <option value="calicut">calicut</option>
                                <option value="kochi">kochi</option>
                                <option value="palakkad">palakkad</option>
                            </select>


                            <select
                                id="attendance-student-batch"
                                value={attendanceStudentBatch}
                                onChange={e =>
                                    setAttendanceStudentBatch(e.target.value)
                                }
                            >
                                <option value="All Batches">All Batches</option>
                                <option value="MERN_JUN_RG_B1_2025">
                                    MERN_JUN_RG_B1_2025
                                </option>
                                <option value="PYTHON_JUN_RG_B1_2025">
                                    PYTHON_JUN_RG_B1_2025
                                </option>
                                <option value="UIUX_JUN_RG_B1_2025">
                                    UIUX_JUN_RG_B1_2025
                                </option>
                            </select>

                        </div>

                    )}

                </div>


                {/* =================================
                    STUDENT ATTENDANCE SCREEN
                ================================= */}

                {attendanceStudentActiveTab === "student" && (

                    <div className="attendance-student-content">


                        {/* CREATE DAILY ATTENDANCE BUTTON */}

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


                        {/* ATTENDANCE TABLE CONTAINER */}

                        <div className="attendance-student-table-card">


                            {/* TABLE HEADER */}

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
                                            onChange={e =>
                                                setAttendanceStudentSelectedDate(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* STUDENT TABLE */}

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

                                        {attendanceStudentFilteredStudents.length > 0 ? (

                                            attendanceStudentFilteredStudents.map(student => (

                                                <tr key={student.id}>

                                                    <td className="attendance-student-name">
                                                        {student.name}
                                                    </td>

                                                    <td className="attendance-student-email">
                                                        {student.email}
                                                    </td>

                                                    <td>
                                                        {student.course}
                                                    </td>

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
                                                                checked={
                                                                    student.attendance === "present"
                                                                }
                                                                onChange={e =>
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

                                                <td
                                                    colSpan="6"
                                                    className="attendance-student-empty"
                                                >
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
                                >
                                    Save Attendance
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* =================================
                    REPORT SCREEN
                ================================= */}

                {attendanceStudentActiveTab === "report" && (

                    <div className="attendance-student-report-container">


                        {/* REPORT FILTERS */}

                        <div className="attendance-student-report-filters">


                            {/* SEARCH INTERN */}

                            <input
                                id="attendance-student-search"
                                type="search"
                                placeholder="Search intern..."
                                value={attendanceStudentSearch}
                                onChange={e =>
                                    setAttendanceStudentSearch(e.target.value)
                                }
                            />


                            {/* BRANCH */}

                            <select
                                id="attendance-student-report-branch"
                                value={attendanceStudentReportBranch}
                                onChange={e =>
                                    setAttendanceStudentReportBranch(e.target.value)
                                }
                            >
                                <option value="calicut">calicut</option>
                                <option value="kochi">kochi</option>
                                <option value="palakkad">palakkad</option>
                                <option value="All Branches">All Branches</option>
                            </select>


                            {/* MENTOR */}

                            <select
                                id="attendance-student-mentor"
                                value={attendanceStudentMentor}
                                onChange={e =>
                                    setAttendanceStudentMentor(e.target.value)
                                }
                            >
                                <option value="All Mentors">All Mentors</option>
                                <option value="Priyesh">Priyesh</option>
                                <option value="John">John</option>
                                <option value="Arjun">Arjun</option>
                            </select>


                            {/* YEAR */}

                            <select
                                id="attendance-student-year"
                                value={attendanceStudentYear}
                                onChange={e =>
                                    setAttendanceStudentYear(e.target.value)
                                }
                            >
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>


                            {/* MONTH */}

                            <select
                                id="attendance-student-month"
                                value={attendanceStudentMonth}
                                onChange={e =>
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
                                ].map(month => (

                                    <option key={month} value={month}>
                                        {month}
                                    </option>

                                ))}

                            </select>


                            {/* EXPORT PDF */}

                            <button
                                type="button"
                                className="attendance-student-export-btn"
                                disabled={
                                    attendanceStudentFilteredReports.length === 0
                                }
                                onClick={attendanceStudentHandleExport}
                            >
                                Export PDF
                            </button>

                        </div>


                        {/* REPORT RESULTS */}

                        <div className="attendance-student-report-results">

                            {attendanceStudentFilteredReports.length === 0 ? (

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
