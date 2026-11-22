import React, { useMemo, useState } from "react";
import {
    MdChevronLeft,
    MdChevronRight,
    MdPeopleOutline,
    MdBarChart
} from "react-icons/md";
import { LuUser } from "react-icons/lu";

import "./Internattendance.css";

// =============================================
// INITIAL ATTENDANCE DATA
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
            const itemDate = new Date(`${item.date}T00:00:00`);
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
            ? (internattendancePresentDays / internattendanceTotalDays) * 100
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
        const totalCells = Math.ceil((startingDay + totalDays) / 7) * 7;
        const calendar = [];

        for (let i = 0; i < totalCells; i++) {
            const date = new Date(
                internattendanceCurrentYear,
                internattendanceCurrentMonth,
                i - startingDay + 1
            );
            const dateString = internattendanceFormatDate(date);

            calendar.push({
                date: date,
                dateString: dateString,
                day: date.getDate(),
                isCurrentMonth:
                    date.getMonth() === internattendanceCurrentMonth,
                status: internattendanceAttendanceMap[dateString] || ""
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
        if (internattendanceCurrentMonth === 0) {
            setInternattendanceCurrentMonth(11);
            setInternattendanceCurrentYear(prev => prev - 1);
        } else {
            setInternattendanceCurrentMonth(prev => prev - 1);
        }
    };

    // =============================================
    // NEXT MONTH
    // =============================================
    const internattendanceNextMonth = () => {
        if (internattendanceCurrentMonth === 11) {
            setInternattendanceCurrentMonth(0);
            setInternattendanceCurrentYear(prev => prev + 1);
        } else {
            setInternattendanceCurrentMonth(prev => prev + 1);
        }
    };

    // =============================================
    // GO TO TODAY
    // =============================================
    const internattendanceGoToToday = () => {
        setInternattendanceCurrentMonth(internattendanceToday.getMonth());
        setInternattendanceCurrentYear(internattendanceToday.getFullYear());
        setInternattendanceSelectedDate(internattendanceToday);
    };

    // =============================================
    // PREVIOUS YEAR
    // =============================================
    const internattendancePreviousYear = () => {
        setInternattendanceCurrentYear(prev => prev - 1);
    };

    // =============================================
    // NEXT YEAR
    // =============================================
    const internattendanceNextYear = () => {
        setInternattendanceCurrentYear(prev => prev + 1);
    };

    // =============================================
    // SELECT MONTH FROM SIDEBAR
    // =============================================
    const internattendanceSelectMonth = (monthIndex, year) => {
        setInternattendanceCurrentMonth(monthIndex);
        setInternattendanceCurrentYear(year);
        setInternattendanceSelectedDate(new Date(year, monthIndex, 1));
    };

    // =============================================
    // FIVE MONTHS LIST
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
    }, [internattendanceCurrentMonth, internattendanceCurrentYear]);

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

    return (
        <div className="wk-card-container">
        

            {/* Main Content Body */}
            <div className="wk-card-body">
                {/* 4 Statistics Cards */}
                <section className="int-att-metrics-grid">
                    <div className="wk-card-metric-box wk-card-metric-box--total">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">TOTAL DAYS</span>
                            <span className="wk-card-score-tag wk-card-score-tag--total">DAYS</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">{internattendanceTotalDays}</span>
                            <span className="wk-card-metric-denom">Days</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box wk-card-metric-box--present">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">PRESENT DAYS</span>
                            <span className="wk-card-score-tag wk-card-score-tag--present">PRESENT</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">{internattendancePresentDays}</span>
                            <span className="wk-card-metric-denom">Days</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box wk-card-metric-box--absent">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">ABSENT DAYS</span>
                            <span className="wk-card-score-tag wk-card-score-tag--absent">ABSENT</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">{internattendanceAbsentDays}</span>
                            <span className="wk-card-metric-denom">Days</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box wk-card-metric-box--percentage">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">ATTENDANCE</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">{internattendancePercentage.toFixed(2)}</span>
                            <span className="wk-card-metric-percent">%</span>
                        </div>
                        <span className="wk-card-metric-subtext">Overall</span>
                    </div>
                </section>

                {/* Main Calendar Card */}
                <div className="internattendance-calendar-card">
                    {/* Calendar Top Bar */}
                    <div className="internattendance-calendar-header">
                        <div className="internattendance-cal-title-wrap">
                            <h3 className="internattendance-cal-title">Calendar</h3>
                            <h2 className="internattendance-cal-month-year">
                                {internattendanceMonths[internattendanceCurrentMonth]}{" "}
                                {internattendanceCurrentYear}
                            </h2>
                        </div>

                        {/* Month Navigation */}
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

                        {/* Mentor Filter */}
                        <div className="internattendance-mentor-filter">
                            <MdPeopleOutline />
                            <select
                                id="internattendance-mentor"
                                value={internattendanceSelectedMentor}
                                onChange={(e) =>
                                    setInternattendanceSelectedMentor(e.target.value)
                                }
                            >
                                <option value="All Mentors">All Mentors</option>
                                {internattendanceMentors.map((mentor) => (
                                    <option key={mentor} value={mentor}>
                                        {mentor}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Calendar Body */}
                    <div className="internattendance-calendar-body">
                        {/* Month Sidebar */}
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

                            <div className="internattendance-month-list">
                                {internattendanceVisibleMonths.map((month) => {
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
                                })}
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="internattendance-calendar-grid-section">
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
                                        className={`internattendance-weekday ${
                                            index === 0 ? "internattendance-sunday" : ""
                                        } ${index === 6 ? "internattendance-saturday" : ""}`}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="internattendance-days-grid">
                                {internattendanceCalendarDays.map((day, index) => {
                                    const isToday = internattendanceIsToday(day.date);
                                    const isSelected = internattendanceIsSelected(day.date);

                                    return (
                                        <button
                                            type="button"
                                            key={`${day.dateString}-${index}`}
                                            className={`internattendance-day-cell ${
                                                !day.isCurrentMonth
                                                    ? "internattendance-other-month"
                                                    : ""
                                            } ${isToday ? "internattendance-today" : ""} ${
                                                isSelected && !isToday
                                                    ? "internattendance-selected-day"
                                                    : ""
                                            } ${
                                                day.status
                                                    ? `internattendance-day-${day.status.toLowerCase()}`
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                internattendanceSelectDate(day)
                                            }
                                            aria-label={`${day.dateString}${
                                                day.status ? `, ${day.status}` : ""
                                            }`}
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

                        {/* Right Information Panel */}
                        <div className="internattendance-information-panel">
                            {/* Attendance Legend */}
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

                            {/* Monthly Summary */}
                            <div className="internattendance-summary-card">
                                <h3>
                                    <MdBarChart />
                                    Monthly Summary
                                </h3>
                                <div className="internattendance-summary-row">
                                    <span>Total Days</span>
                                    <strong>{internattendanceTotalDays}</strong>
                                </div>
                                <div className="internattendance-summary-row">
                                    <span>Present Days</span>
                                    <strong>{internattendancePresentDays}</strong>
                                </div>
                                <div className="internattendance-summary-row">
                                    <span>Absent Days</span>
                                    <strong>{internattendanceAbsentDays}</strong>
                                </div>
                                <div className="internattendance-summary-row">
                                    <span>Attendance</span>
                                    <strong>{internattendancePercentage.toFixed(2)}%</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Internattendance;
