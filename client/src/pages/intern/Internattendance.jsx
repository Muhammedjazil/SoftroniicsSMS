
import React, { useMemo, useState } from "react";
import {
    MdPersonOutline,
    MdCalendarToday,
    MdCheckCircleOutline,
    MdAccessTime,
    MdPercent,
    MdPeopleOutline,
    MdBarChart,
    MdChevronLeft,
    MdChevronRight
} from "react-icons/md";

import "./Internattendance.css";

// =============================================
// INITIAL ATTENDANCE DATA
// Connect your API data here later.
// Expected format:
// {
//   id: 1,
//   date: "2026-11-15",
//   status: "Present",
//   mentor: "Mentor Name"
// }
// =============================================

const internattendanceInitialData = [];


const Internattendance = () => {

    // =============================================
    // CURRENT DATE
    // =============================================

    const internattendanceToday = new Date();

    const [internattendanceCurrentMonth, setInternattendanceCurrentMonth] =
        useState(internattendanceToday.getMonth());

    const [internattendanceCurrentYear, setInternattendanceCurrentYear] =
        useState(internattendanceToday.getFullYear());

    const [internattendanceSelectedDate, setInternattendanceSelectedDate] =
        useState(internattendanceToday);

    const [internattendanceSelectedMentor, setInternattendanceSelectedMentor] =
        useState("All Mentors");

    const [internattendanceData] =
        useState(internattendanceInitialData);


    // =============================================
    // MONTH NAMES
    // =============================================

    const internattendanceMonths = [
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
    ];


    // =============================================
    // FORMAT DATE
    // =============================================

    const internattendanceFormatDate = (date) => {

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, "0");

        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };


    // =============================================
    // MENTOR LIST
    // =============================================

    const internattendanceMentors = useMemo(() => {

        const mentors = [
            ...new Set(
                internattendanceData
                    .map(item => item.mentor)
                    .filter(Boolean)
            )
        ];

        return mentors;

    }, [internattendanceData]);


    // =============================================
    // FILTER ATTENDANCE DATA
    // =============================================

    const internattendanceFilteredData = useMemo(() => {

        return internattendanceData.filter(item => {

            const itemDate = new Date(
                `${item.date}T00:00:00`
            );

            const monthMatch =
                itemDate.getMonth() === internattendanceCurrentMonth;

            const yearMatch =
                itemDate.getFullYear() === internattendanceCurrentYear;

            const mentorMatch =
                internattendanceSelectedMentor === "All Mentors" ||
                item.mentor === internattendanceSelectedMentor;

            return monthMatch && yearMatch && mentorMatch;

        });

    }, [
        internattendanceData,
        internattendanceCurrentMonth,
        internattendanceCurrentYear,
        internattendanceSelectedMentor
    ]);


    // =============================================
    // ATTENDANCE STATISTICS
    // =============================================

    const internattendanceTotalDays =
        internattendanceFilteredData.filter(item =>
            ["Present", "Absent"].includes(item.status)
        ).length;

    const internattendancePresentDays =
        internattendanceFilteredData.filter(item =>
            item.status?.toLowerCase() === "present"
        ).length;

    const internattendanceAbsentDays =
        internattendanceFilteredData.filter(item =>
            item.status?.toLowerCase() === "absent"
        ).length;

    const internattendancePercentage =
        internattendanceTotalDays > 0
            ? (
                internattendancePresentDays /
                internattendanceTotalDays
            ) * 100
            : 0;


    // =============================================
    // ATTENDANCE DATE MAP
    // =============================================

    const internattendanceAttendanceMap = useMemo(() => {

        const map = {};

        internattendanceFilteredData.forEach(item => {

            map[item.date] = item.status;

        });

        return map;

    }, [internattendanceFilteredData]);


    // =============================================
    // CALENDAR GENERATION
    // =============================================

    const internattendanceCalendarDays = useMemo(() => {

        const firstDay = new Date(
            internattendanceCurrentYear,
            internattendanceCurrentMonth,
            1
        );

        const lastDay = new Date(
            internattendanceCurrentYear,
            internattendanceCurrentMonth + 1,
            0
        );

        const startingDay = firstDay.getDay();

        const totalDays = lastDay.getDate();

        const totalCells = Math.ceil(
            (startingDay + totalDays) / 7
        ) * 7;

        const calendar = [];

        for (let i = 0; i < totalCells; i++) {

            const date = new Date(
                internattendanceCurrentYear,
                internattendanceCurrentMonth,
                i - startingDay + 1
            );

            const dateString =
                internattendanceFormatDate(date);

            calendar.push({
                date: date,
                dateString: dateString,
                day: date.getDate(),
                isCurrentMonth:
                    date.getMonth() === internattendanceCurrentMonth,
                status:
                    internattendanceAttendanceMap[dateString] || ""
            });

        }

        return calendar;

    }, [
        internattendanceCurrentMonth,
        internattendanceCurrentYear,
        internattendanceAttendanceMap
    ]);


    // =============================================
    // PREVIOUS MONTH
    // =============================================

    const internattendancePreviousMonth = () => {

        const newDate = new Date(
            internattendanceCurrentYear,
            internattendanceCurrentMonth - 1,
            1
        );

        setInternattendanceCurrentMonth(newDate.getMonth());

        setInternattendanceCurrentYear(newDate.getFullYear());

        setInternattendanceSelectedDate(newDate);

    };


    // =============================================
    // NEXT MONTH
    // =============================================

    const internattendanceNextMonth = () => {

        const newDate = new Date(
            internattendanceCurrentYear,
            internattendanceCurrentMonth + 1,
            1
        );

        setInternattendanceCurrentMonth(newDate.getMonth());

        setInternattendanceCurrentYear(newDate.getFullYear());

        setInternattendanceSelectedDate(newDate);

    };


    // =============================================
    // TODAY BUTTON
    // =============================================

    const internattendanceGoToToday = () => {

        const today = new Date();

        setInternattendanceCurrentMonth(today.getMonth());

        setInternattendanceCurrentYear(today.getFullYear());

        setInternattendanceSelectedDate(today);

    };


    // =============================================
    // PREVIOUS YEAR
    // =============================================

    const internattendancePreviousYear = () => {

        const newYear = internattendanceCurrentYear - 1;

        setInternattendanceCurrentYear(newYear);

        setInternattendanceSelectedDate(
            new Date(newYear, internattendanceCurrentMonth, 1)
        );

    };


    // =============================================
    // NEXT YEAR
    // =============================================

    const internattendanceNextYear = () => {

        const newYear = internattendanceCurrentYear + 1;

        setInternattendanceCurrentYear(newYear);

        setInternattendanceSelectedDate(
            new Date(newYear, internattendanceCurrentMonth, 1)
        );

    };


    // =============================================
    // SELECT MONTH FROM LEFT PANEL
    // =============================================

    const internattendanceSelectMonth = (monthIndex, year) => {

        setInternattendanceCurrentMonth(monthIndex);

        setInternattendanceCurrentYear(year);

        setInternattendanceSelectedDate(
            new Date(year, monthIndex, 1)
        );

    };


    // =============================================
    // FIVE MONTHS LIST
    // Two previous, current, two next months
    // =============================================

    const internattendanceVisibleMonths = useMemo(() => {

        return [-2, -1, 0, 1, 2].map(offset => {

            const date = new Date(
                internattendanceCurrentYear,
                internattendanceCurrentMonth + offset,
                1
            );

            return {
                month: date.getMonth(),
                year: date.getFullYear(),
                label: internattendanceMonths[date.getMonth()]
            };

        });

    }, [
        internattendanceCurrentMonth,
        internattendanceCurrentYear
    ]);


    // =============================================
    // SELECT CALENDAR DATE
    // =============================================

    const internattendanceSelectDate = (day) => {

        setInternattendanceSelectedDate(day.date);

    };


    // =============================================
    // CHECK TODAY
    // =============================================

    const internattendanceIsToday = (date) => {

        return (
            date.getDate() === internattendanceToday.getDate() &&
            date.getMonth() === internattendanceToday.getMonth() &&
            date.getFullYear() === internattendanceToday.getFullYear()
        );

    };


    // =============================================
    // CHECK SELECTED DATE
    // =============================================

    const internattendanceIsSelected = (date) => {

        return (
            date.getDate() === internattendanceSelectedDate.getDate() &&
            date.getMonth() === internattendanceSelectedDate.getMonth() &&
            date.getFullYear() === internattendanceSelectedDate.getFullYear()
        );

    };


    // =============================================
    // JSX
    // =============================================

    return (

        <div className="internattendance-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="internattendance-header">

                <div className="internattendance-heading">

                    <h2>Student Attendance</h2>

                    <p>
                        Student Attendance
                        <span>&gt;</span>
                        Attendance Details
                    </p>

                </div>


                {/* INTERN PROFILE */}

                <div className="internattendance-profile">

                    <div className="internattendance-profile-icon">
                        <MdPersonOutline />
                    </div>

                    <div className="internattendance-profile-info">

                        <h4>ADEEB N</h4>

                        <p>Intern</p>

                    </div>

                </div>

            </div>


            {/* =================================
                STATISTICS CARDS
            ================================= */}

            <div className="internattendance-stats">

                {/* TOTAL DAYS */}

                <div className="internattendance-stat-card">

                    <div className="internattendance-stat-icon internattendance-total-icon">
                        <MdCalendarToday />
                    </div>

                    <div className="internattendance-stat-info">

                        <p>Total Days</p>

                        <h3>{internattendanceTotalDays}</h3>

                        <span>Days</span>

                    </div>

                </div>


                {/* PRESENT DAYS */}

                <div className="internattendance-stat-card">

                    <div className="internattendance-stat-icon internattendance-present-icon">
                        <MdCheckCircleOutline />
                    </div>

                    <div className="internattendance-stat-info">

                        <p>Present Days</p>

                        <h3>{internattendancePresentDays}</h3>

                        <span>Days</span>

                    </div>

                </div>


                {/* ABSENT DAYS */}

                <div className="internattendance-stat-card">

                    <div className="internattendance-stat-icon internattendance-absent-icon">
                        <MdAccessTime />
                    </div>

                    <div className="internattendance-stat-info">

                        <p>Absent Days</p>

                        <h3>{internattendanceAbsentDays}</h3>

                        <span>Days</span>

                    </div>

                </div>


                {/* ATTENDANCE PERCENTAGE */}

                <div className="internattendance-stat-card">

                    <div className="internattendance-stat-icon internattendance-percentage-icon">
                        <MdPercent />
                    </div>

                    <div className="internattendance-stat-info">

                        <p>Attendance</p>

                        <h3>
                            {internattendancePercentage.toFixed(2)}%
                        </h3>

                        <span>Overall</span>

                    </div>

                </div>

            </div>


            {/* =================================
                MAIN CALENDAR CARD
            ================================= */}

            <div className="internattendance-calendar-card">


                {/* =================================
                    CALENDAR HEADER
                ================================= */}

                <div className="internattendance-calendar-header">

                    <h3>Calendar</h3>

                    <h2>
                        {internattendanceMonths[internattendanceCurrentMonth]}{" "}
                        {internattendanceCurrentYear}
                    </h2>


                    {/* MONTH NAVIGATION */}

                    <div className="internattendance-calendar-controls">

                        <button
                            type="button"
                            onClick={internattendancePreviousMonth}
                            title="Previous Month"
                            aria-label="Previous month"
                        >
                            <MdChevronLeft />
                        </button>

                        <button
                            type="button"
                            className="internattendance-today-btn"
                            onClick={internattendanceGoToToday}
                        >
                            Today
                        </button>

                        <button
                            type="button"
                            onClick={internattendanceNextMonth}
                            title="Next Month"
                            aria-label="Next month"
                        >
                            <MdChevronRight />
                        </button>

                    </div>


                    {/* MENTOR FILTER */}

                    <div className="internattendance-mentor-filter">

                        <MdPeopleOutline />

                        <select
                            id="internattendance-mentor"
                            value={internattendanceSelectedMentor}
                            onChange={(e) =>
                                setInternattendanceSelectedMentor(
                                    e.target.value
                                )
                            }
                        >

                            <option value="All Mentors">
                                All Mentors
                            </option>

                            {internattendanceMentors.map(mentor => (

                                <option key={mentor} value={mentor}>
                                    {mentor}
                                </option>

                            ))}

                        </select>

                    </div>

                </div>


                {/* =================================
                    CALENDAR BODY
                ================================= */}

                <div className="internattendance-calendar-body">


                    {/* =================================
                        LEFT MONTH SIDEBAR
                    ================================= */}

                    <div className="internattendance-month-sidebar">

                        <div className="internattendance-year-navigation">

                            <button
                                type="button"
                                onClick={internattendancePreviousYear}
                                aria-label="Previous year"
                            >
                                <MdChevronLeft />
                            </button>

                            <h3>{internattendanceCurrentYear}</h3>

                            <button
                                type="button"
                                onClick={internattendanceNextYear}
                                aria-label="Next year"
                            >
                                <MdChevronRight />
                            </button>

                        </div>


                        {/* MONTH LIST */}

                        <div className="internattendance-month-list">

                            {internattendanceVisibleMonths.map(
                                (month, index) => {

                                    const isActive =
                                        month.month === internattendanceCurrentMonth &&
                                        month.year === internattendanceCurrentYear;

                                    return (

                                        <button
                                            type="button"
                                            key={`${month.year}-${month.month}`}
                                            className={`internattendance-month-item ${
                                                isActive
                                                    ? "internattendance-month-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                internattendanceSelectMonth(
                                                    month.month,
                                                    month.year
                                                )
                                            }
                                        >

                                            <span className="internattendance-month-dot"></span>

                                            <span className="internattendance-month-name">
                                                {month.label}
                                            </span>

                                            {isActive && (
                                                <MdChevronRight className="internattendance-month-arrow" />
                                            )}

                                        </button>

                                    );

                                }
                            )}

                        </div>

                    </div>


                    {/* =================================
                        CALENDAR GRID
                    ================================= */}

                    <div className="internattendance-calendar-grid-section">


                        {/* WEEK DAYS */}

                        <div className="internattendance-weekdays">

                            {[
                                "SUN",
                                "MON",
                                "TUE",
                                "WED",
                                "THU",
                                "FRI",
                                "SAT"
                            ].map((day, index) => (

                                <div
                                    key={day}
                                    className={`
                                        internattendance-weekday
                                        ${index === 0 ? "internattendance-sunday" : ""}
                                        ${index === 6 ? "internattendance-saturday" : ""}
                                    `}
                                >
                                    {day}
                                </div>

                            ))}

                        </div>


                        {/* CALENDAR DATES */}

                        <div className="internattendance-days-grid">

                            {internattendanceCalendarDays.map((day, index) => {

                                const isToday =
                                    internattendanceIsToday(day.date);

                                const isSelected =
                                    internattendanceIsSelected(day.date);

                                return (

                                    <button
                                        type="button"
                                        key={`${day.dateString}-${index}`}
                                        className={`
                                            internattendance-day-cell

                                            ${!day.isCurrentMonth
                                                ? "internattendance-other-month"
                                                : ""}

                                            ${isToday
                                                ? "internattendance-today"
                                                : ""}

                                            ${isSelected && !isToday
                                                ? "internattendance-selected-day"
                                                : ""}

                                            ${day.status
                                                ? `internattendance-day-${day.status.toLowerCase()}`
                                                : ""}
                                        `}
                                        onClick={() =>
                                            internattendanceSelectDate(day)
                                        }
                                        aria-label={`${day.dateString}${day.status ? `, ${day.status}` : ""}`}
                                    >

                                        <span className="internattendance-day-number">
                                            {day.day}
                                        </span>

                                        {day.isCurrentMonth && day.status && (

                                            <span
                                                className={`internattendance-day-indicator internattendance-indicator-${day.status.toLowerCase()}`}
                                            ></span>

                                        )}

                                        {isToday && (

                                            <span className="internattendance-today-dot"></span>

                                        )}

                                    </button>

                                );

                            })}

                        </div>

                    </div>


                    {/* =================================
                        RIGHT INFORMATION PANEL
                    ================================= */}

                    <div className="internattendance-information-panel">


                        {/* ATTENDANCE LEGEND */}

                        <div className="internattendance-legend-card">

                            <h3>Attendance Legend</h3>

                            <div className="internattendance-legend-item">

                                <span className="internattendance-legend-dot internattendance-legend-present"></span>

                                <p>Present</p>

                            </div>

                            <div className="internattendance-legend-item">

                                <span className="internattendance-legend-dot internattendance-legend-absent"></span>

                                <p>Absent</p>

                            </div>

                            <div className="internattendance-legend-item">

                                <span className="internattendance-legend-dot internattendance-legend-today"></span>

                                <p>Today</p>

                            </div>

                            <div className="internattendance-legend-item">

                                <span className="internattendance-legend-dot internattendance-legend-other"></span>

                                <p>Other Day</p>

                            </div>

                        </div>


                        {/* MONTHLY SUMMARY */}

                        <div className="internattendance-summary-card">

                            <h3>
                                <MdBarChart />
                                Monthly Summary
                            </h3>

                            <div className="internattendance-summary-row">

                                <span>Total Days</span>

                                <strong>
                                    {internattendanceTotalDays}
                                </strong>

                            </div>

                            <div className="internattendance-summary-row">

                                <span>Present Days</span>

                                <strong>
                                    {internattendancePresentDays}
                                </strong>

                            </div>

                            <div className="internattendance-summary-row">

                                <span>Absent Days</span>

                                <strong>
                                    {internattendanceAbsentDays}
                                </strong>

                            </div>

                            <div className="internattendance-summary-row">

                                <span>Attendance</span>

                                <strong>
                                    {internattendancePercentage.toFixed(2)}%
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default Internattendance;
