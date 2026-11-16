
import React, { useMemo, useState } from "react";
import {
    MdPersonOutline
} from "react-icons/md";

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


/* =========================================
   MONTHLY EVALUATION DATA

   Keep empty to display the empty state
   exactly as shown in the screenshot.

   Example record:
   {
      id: 1,
      month: "November 2026",
      aptitude: 80,
      logical: 75,
      technical: 85,
      communication: 70,
      attendance: 90,
      mentorNote: "Good performance",
      mentor: "Priyesh"
   }
========================================= */

const InternmonthlycardInitialData = [];


const Internmonthlycard = () => {

    /* =====================================
       STATE
    ===================================== */

    const [InternmonthlycardStudentData] =
        useState(InternmonthlycardStudent);

    const [InternmonthlycardEvaluationData] =
        useState(InternmonthlycardInitialData);


    /* =====================================
       CALCULATE AVERAGES
    ===================================== */

    const InternmonthlycardCalculateAverage = (field) => {

        if (InternmonthlycardEvaluationData.length === 0) {
            return 0;
        }

        const total = InternmonthlycardEvaluationData.reduce(
            (sum, item) => sum + (Number(item[field]) || 0),
            0
        );

        return (
            total / InternmonthlycardEvaluationData.length
        ).toFixed(2);

    };


    /* =====================================
       AVERAGE VALUES
    ===================================== */

    const InternmonthlycardAverages = useMemo(() => {

        return {
            technical:
                InternmonthlycardCalculateAverage("technical"),

            aptitude:
                InternmonthlycardCalculateAverage("aptitude"),

            logical:
                InternmonthlycardCalculateAverage("logical"),

            communication:
                InternmonthlycardCalculateAverage("communication"),

            attendance:
                InternmonthlycardCalculateAverage("attendance")
        };

    }, [InternmonthlycardEvaluationData]);


    /* =====================================
       EVALUATION TABLE HEADINGS
    ===================================== */

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


    /* =====================================
       RENDER
    ===================================== */

    return (

        <div
            className="Internmonthlycard-page"
            id="Internmonthlycard-page"
        >


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div
                className="Internmonthlycard-header"
                id="Internmonthlycard-header"
            >

                <div className="Internmonthlycard-heading">

                    <h2>My Monthly Evaluation</h2>

                    <p>
                        My Monthly Evaluation
                        <span>&gt;</span>
                        Monthly Card
                    </p>

                </div>


                {/* STUDENT PROFILE */}

                <div
                    className="Internmonthlycard-profile"
                    id="Internmonthlycard-profile"
                >

                    <div className="Internmonthlycard-profile-icon">

                        <MdPersonOutline />

                    </div>

                    <div className="Internmonthlycard-profile-details">

                        <h4>{InternmonthlycardStudentData.name}</h4>

                        <p>Intern</p>

                    </div>

                </div>

            </div>


            {/* =================================
                MAIN CONTENT
            ================================= */}

            <div
                className="Internmonthlycard-content"
                id="Internmonthlycard-content"
            >


                {/* =================================
                    STUDENT INFORMATION CARD
                ================================= */}

                <div
                    className="Internmonthlycard-student-card"
                    id="Internmonthlycard-student-card"
                >

                    {/* STUDENT INITIALS */}

                    <div className="Internmonthlycard-avatar">

                        {InternmonthlycardStudentData.initials}

                    </div>


                    {/* STUDENT DETAILS */}

                    <div className="Internmonthlycard-student-info">

                        <h1>
                            {InternmonthlycardStudentData.name}
                        </h1>

                        <div className="Internmonthlycard-tags">

                            <span className="Internmonthlycard-tag Internmonthlycard-tag-fulltime">
                                {InternmonthlycardStudentData.internshipType}
                            </span>

                            <span className="Internmonthlycard-tag Internmonthlycard-tag-batch">
                                {InternmonthlycardStudentData.batch}
                            </span>

                            <span className="Internmonthlycard-tag Internmonthlycard-tag-id">
                                {InternmonthlycardStudentData.studentId}
                            </span>

                            <span className="Internmonthlycard-tag Internmonthlycard-tag-course">
                                {InternmonthlycardStudentData.course}
                            </span>

                        </div>

                    </div>

                </div>


                {/* =================================
                    EVALUATION STATISTICS
                ================================= */}

                <div
                    className="Internmonthlycard-stats"
                    id="Internmonthlycard-stats"
                >


                    {/* AVG TECHNICAL */}

                    <div className="Internmonthlycard-stat-card Internmonthlycard-technical">

                        <div className="Internmonthlycard-stat-top">

                            <p>AVG TECHNICAL</p>

                            <span>AVG</span>

                        </div>

                        <div className="Internmonthlycard-stat-value">

                            <h2>
                                {InternmonthlycardAverages.technical}
                            </h2>

                            <span>/ 100</span>

                        </div>

                    </div>


                    {/* AVG APTITUDE */}

                    <div className="Internmonthlycard-stat-card Internmonthlycard-aptitude">

                        <div className="Internmonthlycard-stat-top">

                            <p>AVG APTITUDE</p>

                            <span>AVG</span>

                        </div>

                        <div className="Internmonthlycard-stat-value">

                            <h2>
                                {InternmonthlycardAverages.aptitude}
                            </h2>

                            <span>/ 100</span>

                        </div>

                    </div>


                    {/* AVG LOGICAL */}

                    <div className="Internmonthlycard-stat-card Internmonthlycard-logical">

                        <div className="Internmonthlycard-stat-top">

                            <p>AVG LOGICAL</p>

                            <span>AVG</span>

                        </div>

                        <div className="Internmonthlycard-stat-value">

                            <h2>
                                {InternmonthlycardAverages.logical}
                            </h2>

                            <span>/ 100</span>

                        </div>

                    </div>


                    {/* AVG COMMUNICATION */}

                    <div className="Internmonthlycard-stat-card Internmonthlycard-communication">

                        <div className="Internmonthlycard-stat-top">

                            <p>AVG COMMUNICATION</p>

                            <span>AVG</span>

                        </div>

                        <div className="Internmonthlycard-stat-value">

                            <h2>
                                {InternmonthlycardAverages.communication}
                            </h2>

                            <span>/ 100</span>

                        </div>

                    </div>


                    {/* ATTENDANCE */}

                    <div className="Internmonthlycard-stat-card Internmonthlycard-attendance">

                        <div className="Internmonthlycard-stat-top">

                            <p>ATTENDANCE</p>

                        </div>

                        <div className="Internmonthlycard-stat-value">

                            <h2>
                                {InternmonthlycardAverages.attendance}
                            </h2>

                            <span>%</span>

                        </div>

                        <p className="Internmonthlycard-overall">
                            Overall
                        </p>

                    </div>

                </div>


                {/* =================================
                    MONTHLY EVALUATION TABLE
                ================================= */}

                <div
                    className="Internmonthlycard-table-card"
                    id="Internmonthlycard-table-card"
                >

                    <div className="Internmonthlycard-table-wrapper">

                        <table className="Internmonthlycard-table">

                            {/* TABLE HEADER */}

                            <thead>

                                <tr>

                                    {InternmonthlycardTableHeadings.map(
                                        (heading, index) => (

                                            <th key={index}>
                                                {heading}
                                            </th>

                                        )
                                    )}

                                </tr>

                            </thead>


                            {/* TABLE BODY */}

                            <tbody>

                                {InternmonthlycardEvaluationData.length > 0 ? (

                                    InternmonthlycardEvaluationData.map(
                                        (item) => (

                                            <tr key={item.id}>

                                                <td>
                                                    {item.month}
                                                </td>

                                                <td>
                                                    {item.aptitude}
                                                </td>

                                                <td>
                                                    {item.logical}
                                                </td>

                                                <td>
                                                    {item.technical}
                                                </td>

                                                <td>
                                                    {item.communication}
                                                </td>

                                                <td>
                                                    {item.attendance}%
                                                </td>

                                                <td className="Internmonthlycard-mentor-note">
                                                    {item.mentorNote || "-"}
                                                </td>

                                                <td>
                                                    {item.mentor || "-"}
                                                </td>

                                            </tr>

                                        )

                                    )

                                ) : (

                                    <tr className="Internmonthlycard-empty-row">

                                        <td colSpan="8">

                                            <div className="Internmonthlycard-empty-state">

                                                No monthly evaluation details are currently available for you.

                                            </div>

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


            </div>

        </div>

    );

};


export default Internmonthlycard;
