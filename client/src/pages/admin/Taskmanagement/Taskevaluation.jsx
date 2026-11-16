
import React, { useMemo, useState } from "react";

import {
    MdPersonOutline,
    MdAssignment,
    MdFileDownload,
    MdSearch,
    MdVisibility,
    MdClose
} from "react-icons/md";

import "./Taskevaluation.css";


// =====================================================
// SAMPLE DATA
// Replace with backend API data later
// =====================================================

const tasksEvaluationModules = [
    {
        id: "module-1",
        name: "Frontend Development",
        tasks: [
            {
                id: "task-1",
                title: "HTML and CSS Assignment"
            },
            {
                id: "task-2",
                title: "JavaScript Assignment"
            },
            {
                id: "task-3",
                title: "React Project"
            }
        ]
    },
    {
        id: "module-2",
        name: "Backend Development",
        tasks: [
            {
                id: "task-4",
                title: "Node.js Assignment"
            },
            {
                id: "task-5",
                title: "Express.js Project"
            },
            {
                id: "task-6",
                title: "MongoDB Assignment"
            }
        ]
    },
    {
        id: "module-3",
        name: "Python Development",
        tasks: [
            {
                id: "task-7",
                title: "Python Basics"
            },
            {
                id: "task-8",
                title: "Python Mini Project"
            }
        ]
    }
];


// Initially empty.
// Replace with API submissions after integration.

const tasksEvaluationInitialSubmissions = [];


// =====================================================
// MAIN COMPONENT
// =====================================================

const Taskevaluation = () => {

    // -------------------------------------------------
    // STATES
    // -------------------------------------------------

    const [tasksEvaluationSelectedModule, setTasksEvaluationSelectedModule] =
        useState("all");

    const [tasksEvaluationSelectedTask, setTasksEvaluationSelectedTask] =
        useState("");

    const [tasksEvaluationSubmissions, setTasksEvaluationSubmissions] =
        useState(tasksEvaluationInitialSubmissions);

    const [tasksEvaluationSearch, setTasksEvaluationSearch] =
        useState("");


    // -------------------------------------------------
    // GET AVAILABLE TASKS
    // -------------------------------------------------

    const tasksEvaluationAvailableTasks = useMemo(() => {

        if (tasksEvaluationSelectedModule === "all") {

            return tasksEvaluationModules.flatMap(module =>
                module.tasks.map(task => ({
                    ...task,
                    moduleName: module.name,
                    moduleId: module.id
                }))
            );

        }

        const selectedModule = tasksEvaluationModules.find(
            module => module.id === tasksEvaluationSelectedModule
        );

        if (!selectedModule) return [];

        return selectedModule.tasks.map(task => ({
            ...task,
            moduleName: selectedModule.name,
            moduleId: selectedModule.id
        }));

    }, [tasksEvaluationSelectedModule]);


    // -------------------------------------------------
    // SELECTED TASK
    // -------------------------------------------------

    const tasksEvaluationCurrentTask =
        tasksEvaluationAvailableTasks.find(
            task => task.id === tasksEvaluationSelectedTask
        );


    // -------------------------------------------------
    // FILTER SUBMISSIONS
    // -------------------------------------------------

    const tasksEvaluationFilteredSubmissions = useMemo(() => {

        return tasksEvaluationSubmissions.filter(submission => {

            const searchText = [

                submission.internName,
                submission.internId,
                submission.taskName,
                submission.status

            ].join(" ").toLowerCase();

            return searchText.includes(
                tasksEvaluationSearch.toLowerCase()
            );

        });

    }, [
        tasksEvaluationSubmissions,
        tasksEvaluationSearch
    ]);


    // =================================================
    // MODULE CHANGE
    // =================================================

    const tasksEvaluationHandleModuleChange = (e) => {

        setTasksEvaluationSelectedModule(e.target.value);

        // Reset selected task when module changes
        setTasksEvaluationSelectedTask("");

        setTasksEvaluationSubmissions([]);

        setTasksEvaluationSearch("");

    };


    // =================================================
    // TASK CHANGE
    // =================================================

    const tasksEvaluationHandleTaskChange = (e) => {

        const taskId = e.target.value;

        setTasksEvaluationSelectedTask(taskId);

        setTasksEvaluationSearch("");

        // Clear previous task submissions.
        // Load the selected task's submissions from API here.

        setTasksEvaluationSubmissions([]);

    };


    // =================================================
    // EXPORT SUBMISSIONS
    // =================================================

    const tasksEvaluationHandleExport = () => {

        if (!tasksEvaluationFilteredSubmissions.length) {

            alert("No submissions available to export.");

            return;

        }

        const headers = [
            "Intern Name",
            "Intern ID",
            "Task",
            "Submitted Date",
            "Status",
            "Marks"
        ];

        const rows = tasksEvaluationFilteredSubmissions.map(
            submission => [

                submission.internName,
                submission.internId,
                submission.taskName,
                submission.submittedDate,
                submission.status,
                submission.marks ?? ""

            ]
        );

        const csv = [

            headers,
            ...rows

        ].map(row =>

            row.map(value =>
                `"${String(value ?? "").replace(/"/g, '""')}"`
            ).join(",")

        ).join("\n");


        const blob = new Blob(

            ["\uFEFF" + csv],

            { type: "text/csv;charset=utf-8;" }

        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "task-evaluation-submissions.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };


    // =================================================
    // VIEW SUBMISSION
    // =================================================

    const tasksEvaluationHandleView = (submission) => {

        if (submission.fileUrl) {

            window.open(
                submission.fileUrl,
                "_blank",
                "noopener,noreferrer"
            );

        } else {

            alert("Submission file is not available.");

        }

    };


    // =================================================
    // MAIN JSX
    // =================================================

    return (

        <div className="tasks-evaluation-page">


            {/* =========================================
                HEADER
            ========================================= */}

            <div className="tasks-evaluation-header">

                <div className="tasks-evaluation-header-title">

                    <h2>Task Evaluation</h2>

                    <p>
                        Task Evaluation
                        <span> &gt; </span>
                        submissions-list
                    </p>

                </div>


                {/* ADMIN PROFILE */}

                <div className="tasks-evaluation-admin-profile">

                    <div className="tasks-evaluation-admin-avatar">

                        <MdPersonOutline />

                    </div>

                    <div className="tasks-evaluation-admin-info">

                        <h4>vijitha</h4>

                        <p>super admin</p>

                    </div>

                </div>

            </div>


            {/* =========================================
                TOP NAVIGATION
            ========================================= */}

            <div className="tasks-evaluation-top-navigation">

                <button
                    type="button"
                    className="tasks-evaluation-tab-active"
                >
                    Submissions List
                </button>


                <button
                    type="button"
                    className="tasks-evaluation-export-btn"
                    onClick={tasksEvaluationHandleExport}
                    disabled={!tasksEvaluationFilteredSubmissions.length}
                >

                    <MdFileDownload />

                    Export

                </button>

            </div>


            {/* =========================================
                MAIN CONTENT
            ========================================= */}

            <div className="tasks-evaluation-content-container">


                {/* =====================================
                    FILTER SECTION
                ===================================== */}

                <div className="tasks-evaluation-filter-container">


                    {/* MODULE FILTER */}

                    <div className="tasks-evaluation-filter-group">

                        <label htmlFor="tasks-evaluation-module">

                            FILTER BY MODULE

                        </label>

                        <select
                            id="tasks-evaluation-module"
                            value={tasksEvaluationSelectedModule}
                            onChange={tasksEvaluationHandleModuleChange}
                        >

                            <option value="all">
                                All Modules
                            </option>

                            {tasksEvaluationModules.map(module => (

                                <option
                                    key={module.id}
                                    value={module.id}
                                >
                                    {module.name}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* TASK FILTER */}

                    <div className="tasks-evaluation-filter-group">

                        <label htmlFor="tasks-evaluation-task">

                            SELECT TASK TO VIEW SUBMISSIONS

                        </label>

                        <select
                            id="tasks-evaluation-task"
                            value={tasksEvaluationSelectedTask}
                            onChange={tasksEvaluationHandleTaskChange}
                        >

                            <option value="">
                                Choose Task
                            </option>

                            {tasksEvaluationAvailableTasks.map(task => (

                                <option
                                    key={task.id}
                                    value={task.id}
                                >
                                    {task.title}
                                </option>

                            ))}

                        </select>

                    </div>

                </div>


                {/* =====================================
                    NO TASK SELECTED
                ===================================== */}

                {!tasksEvaluationSelectedTask && (

                    <div className="tasks-evaluation-empty-container">

                        <div className="tasks-evaluation-empty-content">

                            <MdAssignment className="tasks-evaluation-empty-icon" />

                            <h3>No task selected</h3>

                            <p>
                                Please choose a task from the dropdown list above
                                to load its submissions.
                            </p>

                        </div>

                    </div>

                )}


                {/* =====================================
                    SELECTED TASK - SUBMISSIONS
                ===================================== */}

                {tasksEvaluationSelectedTask && (

                    <div className="tasks-evaluation-submissions-container">


                        {/* SELECTED TASK HEADER */}

                        <div className="tasks-evaluation-submissions-header">

                            <div>

                                <h3>
                                    {tasksEvaluationCurrentTask?.title}
                                </h3>

                                <p>
                                    {tasksEvaluationCurrentTask?.moduleName}
                                </p>

                            </div>

                        </div>


                        {/* SEARCH */}

                        <div className="tasks-evaluation-search-container">

                            <div className="tasks-evaluation-search-box">

                                <MdSearch />

                                <input
                                    id="tasks-evaluation-search"
                                    type="text"
                                    placeholder="Search Interns"
                                    value={tasksEvaluationSearch}
                                    onChange={e =>
                                        setTasksEvaluationSearch(
                                            e.target.value
                                        )
                                    }
                                />

                                {tasksEvaluationSearch && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTasksEvaluationSearch("")
                                        }
                                    >
                                        <MdClose />
                                    </button>

                                )}

                            </div>

                        </div>


                        {/* SUBMISSION TABLE */}

                        {tasksEvaluationFilteredSubmissions.length > 0 ? (

                            <div className="tasks-evaluation-table-wrapper">

                                <table className="tasks-evaluation-table">

                                    <thead>

                                        <tr>

                                            <th>#</th>

                                            <th>Intern Name</th>

                                            <th>Intern ID</th>

                                            <th>Submitted Date</th>

                                            <th>Status</th>

                                            <th>Marks</th>

                                            <th>Actions</th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {tasksEvaluationFilteredSubmissions.map(
                                            (submission, index) => (

                                                <tr key={submission.id}>

                                                    <td>{index + 1}</td>

                                                    <td className="tasks-evaluation-intern-name">
                                                        {submission.internName}
                                                    </td>

                                                    <td>
                                                        {submission.internId}
                                                    </td>

                                                    <td>
                                                        {submission.submittedDate}
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`tasks-evaluation-status tasks-evaluation-status-${submission.status?.toLowerCase().replace(/\s+/g, "-")}`}
                                                        >
                                                            {submission.status}
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {submission.marks ?? "-"}
                                                    </td>

                                                    <td>

                                                        <button
                                                            type="button"
                                                            className="tasks-evaluation-view-btn"
                                                            title="View Submission"
                                                            onClick={() =>
                                                                tasksEvaluationHandleView(
                                                                    submission
                                                                )
                                                            }
                                                        >

                                                            <MdVisibility />

                                                        </button>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        ) : (

                            <div className="tasks-evaluation-no-submissions">

                                <MdAssignment />

                                <h3>No submissions available</h3>

                                <p>
                                    There are currently no submissions for this task.
                                </p>

                            </div>

                        )}

                    </div>

                )}

            </div>

        </div>

    );

};

export default Taskevaluation;
