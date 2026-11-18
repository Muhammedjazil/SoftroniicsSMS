import React, { useMemo, useState } from "react";
import { LuUser } from "react-icons/lu";
import "./Internmonthlycard.css";

/* =========================================
   STUDENT DETAILS
   Replace with API data when integrating.
========================================= */

const InternmonthlycardStudent = {
    name: "ADEEB N",
    initials: "AN",
    batch: "MERN_NEW_02",
    studentId: "STU-001",
    course: "MERN 6 MONTH",
    internshipType: "FULL TIME"
};

const InternmonthlycardInitialData = [];

const Internmonthlycard = () => {
    const [InternmonthlycardStudentData] = useState(InternmonthlycardStudent);
    const [InternmonthlycardEvaluationData] = useState(InternmonthlycardInitialData);

    const InternmonthlycardCalculateAverage = (field) => {
        if (InternmonthlycardEvaluationData.length === 0) {
            return 0;
        }

        const total = InternmonthlycardEvaluationData.reduce(
            (sum, item) => sum + (Number(item[field]) || 0),
            0
        );

        return (total / InternmonthlycardEvaluationData.length).toFixed(2);
    };

    const InternmonthlycardAverages = useMemo(() => {
        return {
            technical: InternmonthlycardCalculateAverage("technical"),
            aptitude: InternmonthlycardCalculateAverage("aptitude"),
            logical: InternmonthlycardCalculateAverage("logical"),
            communication: InternmonthlycardCalculateAverage("communication"),
            attendance: InternmonthlycardCalculateAverage("attendance")
        };
    }, [InternmonthlycardEvaluationData]);

    const InternmonthlycardTableHeadings = [
        "MONTH",
        "APTITUDE",
        "LOGICAL",
        "TECHNICAL",
        "COMMUNICATION",
        "ATTENDANCE",
        "MENTOR NOTE",
        "MENTOR"
    ];

    return (
        <div className="wk-card-container">
            {/* Header */}
            <header className="wk-card-header">
                <div className="wk-card-title-group">
                    <h1 className="wk-card-heading">My Monthly Evaluation</h1>
                    <nav className="wk-card-breadcrumb">
                        <span>My Monthly Evaluation</span>
                        <span className="wk-card-breadcrumb-sep">&gt;</span>
                        <span>Monthly Card</span>
                    </nav>
                </div>

                <div className="wk-card-profile-card">
                    <div className="wk-card-profile-avatar">
                        <LuUser />
                    </div>
                    <div className="wk-card-profile-info">
                        <span className="wk-card-username">
                            {InternmonthlycardStudentData.name}
                        </span>
                        <span className="wk-card-role">Intern</span>
                    </div>
                </div>
            </header>

            {/* Main Content Wrapper */}
            <div className="wk-card-body">
                {/* Intern Identity Banner */}
                <section className="wk-card-identity-card">
                    <div className="int-monthly-avatar-square">
                        {InternmonthlycardStudentData.initials}
                    </div>

                    <div className="wk-card-identity-details">
                        <h2 className="wk-card-intern-title">
                            {InternmonthlycardStudentData.name}
                        </h2>

                        <div className="wk-card-badges-row">
                            <span className="int-monthly-badge int-monthly-badge--fulltime">
                                {InternmonthlycardStudentData.internshipType}
                            </span>
                            <span className="int-monthly-badge int-monthly-badge--batch">
                                {InternmonthlycardStudentData.batch}
                            </span>
                            <span className="int-monthly-badge int-monthly-badge--id">
                                {InternmonthlycardStudentData.studentId}
                            </span>
                            {InternmonthlycardStudentData.course && (
                                <span className="int-monthly-badge int-monthly-badge--course">
                                    {InternmonthlycardStudentData.course}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {/* 5 Metric Summary Cards */}
                <section className="int-monthly-metrics-grid">
                    <div className="wk-card-metric-box int-monthly-metric--technical">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">AVG TECHNICAL</span>
                            <span className="int-monthly-score-tag">AVG</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardAverages.technical}
                            </span>
                            <span className="wk-card-metric-denom">/ 100</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box int-monthly-metric--aptitude">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">AVG APTITUDE</span>
                            <span className="int-monthly-score-tag">AVG</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardAverages.aptitude}
                            </span>
                            <span className="wk-card-metric-denom">/ 100</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box int-monthly-metric--logical">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">AVG LOGICAL</span>
                            <span className="int-monthly-score-tag">AVG</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardAverages.logical}
                            </span>
                            <span className="wk-card-metric-denom">/ 100</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box int-monthly-metric--communication">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">AVG COMMUNICATION</span>
                            <span className="int-monthly-score-tag">AVG</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardAverages.communication}
                            </span>
                            <span className="wk-card-metric-denom">/ 100</span>
                        </div>
                    </div>

                    <div className="wk-card-metric-box int-monthly-metric--attendance">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">ATTENDANCE</span>
                        </div>
                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardAverages.attendance}
                            </span>
                            <span className="wk-card-metric-percent">%</span>
                        </div>
                        <span className="wk-card-metric-subtext">Overall</span>
                    </div>
                </section>

                {/* Evaluation Table Card */}
                <section className="wk-card-table-card">
                    <div className="wk-card-table-scroll">
                        <table className="wk-card-table">
                            <thead>
                                <tr>
                                    {InternmonthlycardTableHeadings.map((heading) => (
                                        <th key={heading}>{heading}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {InternmonthlycardEvaluationData.length > 0 ? (
                                    InternmonthlycardEvaluationData.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.month}</td>
                                            <td>{item.aptitude}</td>
                                            <td>{item.logical}</td>
                                            <td>{item.technical}</td>
                                            <td>{item.communication}</td>
                                            <td>{item.attendance}%</td>
                                            <td className="int-monthly-mentor-note">
                                                {item.mentorNote || "-"}
                                            </td>
                                            <td>{item.mentor || "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={InternmonthlycardTableHeadings.length}
                                            className="wk-card-table-status"
                                        >
                                            No monthly evaluation details are currently available for you.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Internmonthlycard;
