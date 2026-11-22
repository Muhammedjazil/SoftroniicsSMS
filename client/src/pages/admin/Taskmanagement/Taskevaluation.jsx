
import React, { useEffect, useMemo, useState } from "react";

import {
  MdAssignment,
  MdFileDownload,
  MdSearch,
  MdVisibility,
  MdClose
} from "react-icons/md";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Taskevaluation.css";

const API_ORIGIN =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:7000";

const Taskevaluation = () => {
  const {
    takeevaluationmodules,
    takeevaluationtasks,
    takesubmissions,
    gradesubmission
  } = AdminService();

  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedTask, setSelectedTask] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // LOAD MODULES AND TASKS
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);

        const response = await takeevaluationmodules();
        setModules(response.modules || []);

        const taskResponse = await takeevaluationtasks("all");
        setTasks(taskResponse.tasks || []);
      } catch (error) {
        console.error(
          "Task Evaluation Initial Load Error:",
          error.response?.data || error
        );

        alert(
          error.response?.data?.message ||
          "Unable to load evaluation data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  // MODULE CHANGE
  const handleModuleChange = async (e) => {
    const module = e.target.value;

    setSelectedModule(module);
    setSelectedTask("");
    setSubmissions([]);
    setSearch("");

    try {
      setLoading(true);

      const response = await takeevaluationtasks(module);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error(
        "Fetch Evaluation Tasks Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  // TASK CHANGE
  const handleTaskChange = async (e) => {
    const taskId = e.target.value;

    setSelectedTask(taskId);
    setSubmissions([]);
    setSearch("");

    if (!taskId) return;

    try {
      setLoading(true);

      const response = await takesubmissions(taskId);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error(
        "Fetch Submissions Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to load submissions"
      );
    } finally {
      setLoading(false);
    }
  };

  // SEARCH FILTER
  const filteredSubmissions = useMemo(() => {
    const searchText = search.toLowerCase();

    return submissions.filter((submission) => {
      const intern = submission.intern || {};

      const text = [
        intern.fullName,
        intern.admissionNumber,
        intern.email,
        submission.status
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });
  }, [submissions, search]);

  // OPEN SUBMISSION FILE
  const handleView = (submission) => {
    const file = submission.attachments?.[0];

    if (!file) {
      alert("No submission attachment available.");
      return;
    }

    const fileUrl = file.startsWith("http")
      ? file
      : `${API_ORIGIN}${file.startsWith("/") ? "" : "/"}${file}`;

    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  // EVALUATE SUBMISSION
  const handleEvaluate = async (submission) => {
    const task = tasks.find(
      (item) => item._id === selectedTask
    );

    const marksInput = window.prompt(
      `Enter marks (out of ${task?.totalMarks ?? 0}):`,
      submission.achievedMarks ?? 0
    );

    if (marksInput === null) return;

    const marks = Number(marksInput);

    if (
      !Number.isFinite(marks) ||
      marks < 0 ||
      marks > Number(task?.totalMarks ?? 0)
    ) {
      alert(`Enter marks between 0 and ${task?.totalMarks ?? 0}.`);
      return;
    }

    const feedback = window.prompt(
      "Enter feedback for the intern:",
      submission.feedback || ""
    );

    if (feedback === null) return;

    try {
      setLoading(true);

      await gradesubmission(submission._id, {
        achievedMarks: marks,
        feedback,
        status: "Graded"
      });

      const response = await takesubmissions(selectedTask);
      setSubmissions(response.submissions || []);

      alert("Submission evaluated successfully.");
    } catch (error) {
      console.error(
        "Evaluate Submission Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to evaluate submission"
      );
    } finally {
      setLoading(false);
    }
  };

  // EXPORT CSV
  const handleExport = () => {
    if (!filteredSubmissions.length) {
      alert("No submissions available to export.");
      return;
    }

    const headers = [
      "Intern Name",
      "Intern ID",
      "Email",
      "Submitted Date",
      "Status",
      "Marks",
      "Feedback"
    ];

    const rows = filteredSubmissions.map((submission) => {
      const intern = submission.intern || {};

      return [
        intern.fullName || "",
        intern.admissionNumber || intern._id || "",
        intern.email || "",
        submission.createdAt
          ? new Date(submission.createdAt).toLocaleString()
          : "",
        submission.status || "",
        submission.achievedMarks ?? "",
        submission.feedback || ""
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

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

  const selectedTaskData = tasks.find(
    (task) => task._id === selectedTask
  );

  return (
    <div className="tasks-evaluation-page">

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
          onClick={handleExport}
          disabled={!filteredSubmissions.length}
        >
          <MdFileDownload />
          Export
        </button>
      </div>

      <div className="tasks-evaluation-content-container">

        {/* FILTERS */}
        <div className="tasks-evaluation-filter-container">

          <div className="tasks-evaluation-filter-group">
            <label htmlFor="tasks-evaluation-module">
              FILTER BY MODULE
            </label>

            <select
              id="tasks-evaluation-module"
              value={selectedModule}
              onChange={handleModuleChange}
            >
              <option value="all">All Modules</option>

              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>

          <div className="tasks-evaluation-filter-group">
            <label htmlFor="tasks-evaluation-task">
              SELECT TASK TO VIEW SUBMISSIONS
            </label>

            <select
              id="tasks-evaluation-task"
              value={selectedTask}
              onChange={handleTaskChange}
            >
              <option value="">Choose Task</option>

              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* NO TASK SELECTED */}
        {!selectedTask && (
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

        {/* SELECTED TASK */}
        {selectedTask && (
          <div className="tasks-evaluation-submissions-container">

            <div className="tasks-evaluation-submissions-header">
              <div>
                <h3>{selectedTaskData?.title}</h3>
                <p>{selectedTaskData?.module}</p>
                <p>
                  Total Marks: {selectedTaskData?.totalMarks ?? 0}
                </p>
              </div>
            </div>

            {/* SEARCH */}
            <div className="tasks-evaluation-search-container">
              <div className="tasks-evaluation-search-box">
                <MdSearch />

                <input
                  type="text"
                  placeholder="Search Interns"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <p>Loading submissions...</p>
            ) : filteredSubmissions.length > 0 ? (

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
                    {filteredSubmissions.map((submission, index) => {
                      const intern = submission.intern || {};

                      return (
                        <tr key={submission._id}>
                          <td>{index + 1}</td>

                          <td className="tasks-evaluation-intern-name">
                            {intern.fullName || "Unknown Intern"}
                          </td>

                          <td>
                            {intern.admissionNumber || intern._id || "-"}
                          </td>

                          <td>
                            {submission.createdAt
                              ? new Date(
                                  submission.createdAt
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td>
                            <span
                              className={`tasks-evaluation-status tasks-evaluation-status-${(
                                submission.status || ""
                              ).toLowerCase().replace(/\s+/g, "-")}`}
                            >
                              {submission.status}
                            </span>
                          </td>

                          <td>
                            {submission.achievedMarks ?? 0}
                            {" / "}
                            {selectedTaskData?.totalMarks ?? 0}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="tasks-evaluation-view-btn"
                              title="View Submission"
                              onClick={() => handleView(submission)}
                            >
                              <MdVisibility />
                            </button>

                            <button
                              type="button"
                              className="tasks-evaluation-view-btn"
                              title="Evaluate Submission"
                              onClick={() => handleEvaluate(submission)}
                              disabled={loading}
                            >
                              Evaluate
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
