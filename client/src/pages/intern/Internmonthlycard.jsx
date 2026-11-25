
import React, { useEffect, useState } from "react";
import { LuUser } from "react-icons/lu";
import "./Internmonthlycard.css";

import UserService from "../../services/user-api-services/UserService";

// Get intern details from localStorage
const getStoredUserQuery = () => {
    try {
        const rawUser =
            localStorage.getItem("user") ||
            localStorage.getItem("intern") ||
            localStorage.getItem("auth");

        if (!rawUser) return {};

        const parsed = JSON.parse(rawUser);
        const user = parsed?.user || parsed;

        return {
            internId: user?._id || user?.id || "",
            email: user?.email || user?.officialEmail || "",
        };
    } catch (error) {
        console.error("Unable to read stored user:", error);
        return {};
    }
};

const Internmonthlycard = () => {
    const { takeMyMonthlyCard } = UserService();

    const [InternmonthlycardStudentData, setInternmonthlycardStudentData] =
        useState(null);

    const [InternmonthlycardEvaluationData, setInternmonthlycardEvaluationData] =
        useState([]);

    const [InternmonthlycardAverages, setInternmonthlycardAverages] =
        useState({
            technical: 0,
            aptitude: 0,
            logical: 0,
            communication: 0,
        });

    const [InternmonthlycardAttendance, setInternmonthlycardAttendance] =
        useState(0);

    const [InternmonthlycardLoading, setInternmonthlycardLoading] =
        useState(true);

    const [InternmonthlycardError, setInternmonthlycardError] =
        useState("");

    // =============================================
    // FETCH MONTHLY CARD
    // =============================================
    const InternmonthlycardFetchData = async () => {
        try {
            setInternmonthlycardLoading(true);
            setInternmonthlycardError("");

            const userQuery = getStoredUserQuery();

            if (!userQuery.internId && !userQuery.email) {
                throw new Error(
                    "Intern ID or email not found in login data."
                );
            }

            const response = await takeMyMonthlyCard(userQuery);

            console.log("Monthly Card Response:", response);

            if (!response?.success) {
                throw new Error(
                    response?.message || "Failed to fetch monthly card."
                );
            }

            // Intern details
            setInternmonthlycardStudentData(response.student || null);

            // Monthly evaluations
            setInternmonthlycardEvaluationData(
                Array.isArray(response.evaluations)
                    ? response.evaluations
                    : []
            );

            // Average scores
            setInternmonthlycardAverages({
                technical: Number(response.averages?.technical) || 0,
                aptitude: Number(response.averages?.aptitude) || 0,
                logical: Number(response.averages?.logical) || 0,
                communication:
                    Number(response.averages?.communication) || 0,
            });

            // Overall attendance
            setInternmonthlycardAttendance(
                Number(response.attendance) || 0
            );

        } catch (error) {
            console.error("Monthly Card Error:", error);

            setInternmonthlycardError(
                error.message || "Failed to load monthly evaluation card."
            );
        } finally {
            setInternmonthlycardLoading(false);
        }
    };

    useEffect(() => {
        InternmonthlycardFetchData();
    }, []);

    // =============================================
    // TABLE HEADINGS
    // =============================================
    const InternmonthlycardTableHeadings = [
        "MONTH",
        "APTITUDE",
        "LOGICAL",
        "TECHNICAL",
        "COMMUNICATION",
        "ATTENDANCE",
        "MENTOR NOTE",
        "MENTOR",
    ];

    // =============================================
    // FORMAT SCORE
    // =============================================
    const InternmonthlycardFormatScore = (value) => {
        return value !== null && value !== undefined
            ? Number(value).toFixed(2)
            : "-";
    };

    // =============================================
    // LOADING
    // =============================================
    if (InternmonthlycardLoading) {
        return (
            <div className="wk-card-container">
                <div className="wk-card-body">
                    <p className="wk-card-table-status">
                        Loading monthly evaluation card...
                    </p>
                </div>
            </div>
        );
    }

    // =============================================
    // ERROR
    // =============================================
    if (InternmonthlycardError) {
        return (
            <div className="wk-card-container">
                <div className="wk-card-body">
                    <p className="wk-card-table-status">
                        {InternmonthlycardError}
                    </p>
                </div>
            </div>
        );
    }

    // =============================================
    // UI
    // =============================================
    return (
        <div className="wk-card-container">
            <div className="wk-card-body">

                {/* Intern Identity Banner */}
                <section className="wk-card-identity-card">

                    <div className="int-monthly-avatar-square">
                        {InternmonthlycardStudentData?.initial || (
                            <LuUser />
                        )}
                    </div>

                    <div className="wk-card-identity-details">

                        <h2 className="wk-card-intern-title">
                            {InternmonthlycardStudentData?.name || "-"}
                        </h2>

                        <div className="wk-card-badges-row">

                            <span className="int-monthly-badge int-monthly-badge--fulltime">
                                {InternmonthlycardStudentData?.mode || "-"}
                            </span>

                            <span className="int-monthly-badge int-monthly-badge--batch">
                                {InternmonthlycardStudentData?.batch || "-"}
                            </span>

                            <span className="int-monthly-badge int-monthly-badge--id">
                                {InternmonthlycardStudentData?.studentId || "-"}
                            </span>

                            {InternmonthlycardStudentData?.course && (
                                <span className="int-monthly-badge int-monthly-badge--course">
                                    {InternmonthlycardStudentData.course}
                                </span>
                            )}

                        </div>
                    </div>
                </section>

                {/* 5 Metric Summary Cards */}
                <section className="int-monthly-metrics-grid">

                    {/* Technical */}
                    <div className="wk-card-metric-box int-monthly-metric--technical">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">
                                AVG TECHNICAL
                            </span>
                            <span className="int-monthly-score-tag">
                                AVG
                            </span>
                        </div>

                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardFormatScore(
                                    InternmonthlycardAverages.technical
                                )}
                            </span>
                            <span className="wk-card-metric-denom">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Aptitude */}
                    <div className="wk-card-metric-box int-monthly-metric--aptitude">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">
                                AVG APTITUDE
                            </span>
                            <span className="int-monthly-score-tag">
                                AVG
                            </span>
                        </div>

                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardFormatScore(
                                    InternmonthlycardAverages.aptitude
                                )}
                            </span>
                            <span className="wk-card-metric-denom">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Logical */}
                    <div className="wk-card-metric-box int-monthly-metric--logical">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">
                                AVG LOGICAL
                            </span>
                            <span className="int-monthly-score-tag">
                                AVG
                            </span>
                        </div>

                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardFormatScore(
                                    InternmonthlycardAverages.logical
                                )}
                            </span>
                            <span className="wk-card-metric-denom">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Communication */}
                    <div className="wk-card-metric-box int-monthly-metric--communication">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">
                                AVG COMMUNICATION
                            </span>
                            <span className="int-monthly-score-tag">
                                AVG
                            </span>
                        </div>

                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardFormatScore(
                                    InternmonthlycardAverages.communication
                                )}
                            </span>
                            <span className="wk-card-metric-denom">
                                / 100
                            </span>
                        </div>
                    </div>

                    {/* Attendance */}
                    <div className="wk-card-metric-box int-monthly-metric--attendance">
                        <div className="wk-card-metric-top">
                            <span className="wk-card-metric-label">
                                ATTENDANCE
                            </span>
                        </div>

                        <div className="wk-card-metric-value-row">
                            <span className="wk-card-metric-num">
                                {InternmonthlycardFormatScore(
                                    InternmonthlycardAttendance
                                )}
                            </span>
                            <span className="wk-card-metric-percent">
                                %
                            </span>
                        </div>

                        <span className="wk-card-metric-subtext">
                            Overall
                        </span>
                    </div>

                </section>

                {/* Evaluation Table */}
                <section className="wk-card-table-card">
                    <div className="wk-card-table-scroll">

                        <table className="wk-card-table">

                            <thead>
                                <tr>
                                    {InternmonthlycardTableHeadings.map(
                                        (heading) => (
                                            <th key={heading}>
                                                {heading}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>

                            <tbody>

                                {InternmonthlycardEvaluationData.length > 0 ? (

                                    InternmonthlycardEvaluationData.map(
                                        (item) => (

                                            <tr key={item.id}>

                                                <td>
                                                    {item.monthName || item.month}{" "}
                                                    {item.year || ""}
                                                </td>

                                                <td>
                                                    {InternmonthlycardFormatScore(
                                                        item.aptitudePercentage
                                                    )}
                                                </td>

                                                <td>
                                                    {InternmonthlycardFormatScore(
                                                        item.logicalPercentage
                                                    )}
                                                </td>

                                                <td>
                                                    {InternmonthlycardFormatScore(
                                                        item.technicalPercentage
                                                    )}
                                                </td>

                                                <td>
                                                    {InternmonthlycardFormatScore(
                                                        item.communicationPercentage
                                                    )}
                                                </td>

                                                <td>
                                                    {InternmonthlycardFormatScore(
                                                        item.attendancePercentage
                                                    )}%
                                                </td>

                                                <td className="int-monthly-mentor-note">
                                                    {item.note || "-"}
                                                </td>

                                                <td>
                                                    {item.mentor || "-"}
                                                </td>

                                            </tr>
                                        )
                                    )

                                ) : (

                                    <tr>
                                        <td
                                            colSpan={
                                                InternmonthlycardTableHeadings.length
                                            }
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
