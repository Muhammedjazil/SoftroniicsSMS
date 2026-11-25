import React, { useEffect, useMemo, useState } from "react";

import {
  MdAssignment,
  MdFileDownload,
  MdSearch,
  MdClose,
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
    gradesubmission,
  } = AdminService();

  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedTask, setSelectedTask] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [activetab, setActivetab] = useState("submissionlist");

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [gradeForm, setGradeForm] = useState({
    taskTitle: "",
    module: "",
    status: "Submitted",
    submittedBy: "",
    submittedDate: "",
    dueDate: "",
    submissionDescription: "",
    githubRepo: "",
    liveDemoUrl: "",
    totalMarks: 0,
    attachmentName: "",
    achievedMarks: "",
    feedback: "",
    reviewedBy: "",
    reviewedDate: "",
  });

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-US");
  };

  // GET ATTACHMENT URL
  const getAttachmentUrl = (file) => {
    if (!file) return "";

    if (file.startsWith("http")) return file;

    const normalizedFile = file.replace(/\\/g, "/");

    return `${API_ORIGIN}${
      normalizedFile.startsWith("/") ? "" : "/"
    }${normalizedFile}`;
  };

  // DOWNLOAD ATTACHMENT
  const handleDownloadAttachment = async (file) => {
    const fileUrl = getAttachmentUrl(file);
    if (!fileUrl) return;

    const fileName = file.replace(/\\/g, "/").split("/").pop() || "attachment";

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

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
        console.error("Task Evaluation Initial Load Error:", error);

        alert(
          error.response?.data?.message ||
            error.message ||
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
    setSelectedSubmission(null);
    setSelectedTaskDetails(null);
    try {
      setLoading(true);

      const response = await takeevaluationtasks(module);

      setTasks(response.tasks || []);
    } catch (error) {
      console.error("Fetch Evaluation Tasks Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
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
    setSelectedTaskDetails(null);
    setSearch("");
    setSelectedSubmission(null);

    if (!taskId) return;

    try {
      setLoading(true);

      const response = await takesubmissions(taskId);

      setSelectedTaskDetails(response.task || null);
      setSubmissions(response.submissions || []);
    } catch (error) {
      console.error("SUBMISSIONS API ERROR:", error);
      console.error("ERROR RESPONSE:", error.response?.data);
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
        submission.status,
        submission.submissionText,
        submission.githubRepository,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(searchText);
    });
  }, [submissions, search]);

  // SELECTED TASK DATA
  const selectedTaskData = tasks.find(
    (task) => String(task._id) === String(selectedTask)
  );

  // OPEN GRADE SUBMISSION FORM
  const handleEvaluate = (submission) => {
    const task = selectedTaskDetails || selectedTaskData || {};
    const intern = submission.intern || {};

    setSelectedSubmission(submission);

    setGradeForm({
      taskTitle: task.title || "",
      module: task.module || "",
      status: submission.status || "Submitted",
      submittedBy: intern.fullName || "",
      submittedDate: formatDate(submission.createdAt),
      dueDate: formatDate(task.dueDate),
      submissionDescription: submission.submissionText || "",
      githubRepo: submission.githubRepository || "",
      liveDemoUrl: submission.liveDemoUrl || "",
      totalMarks: task.totalMarks ?? 0,
      attachmentName: submission.attachments?.length
        ? submission.attachments
            .map((file) => file.replace(/\\/g, "/").split("/").pop())
            .join(", ")
        : "No files uploaded",
      achievedMarks:
        submission.status === "Submitted"
          ? ""
          : submission.achievedMarks ?? "",
      feedback: submission.feedback || "",
      reviewedBy:
        submission.gradedBy?.fullName ||
        submission.gradedBy?.name ||
        "",
      reviewedDate: submission.gradedAt
        ? formatDate(submission.gradedAt)
        : "",
    });

    setActivetab("gradesubmission");
  };

  // HANDLE GRADE FORM INPUTS
  const handleGradeFieldChange = (e) => {
    const { name, value } = e.target;

    setGradeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SAVE INTERN EVALUATION
  const handleGradeSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSubmission?._id) {
      alert("Please select a submission.");
      return;
    }

    const marks = Number(gradeForm.achievedMarks);
    const totalMarks = Number(gradeForm.totalMarks);

    if (!["Submitted", "Graded", "Rejected"].includes(gradeForm.status)) {
      alert("Please select a valid evaluation status.");
      return;
    }

    if (
      gradeForm.status === "Graded" &&
      (gradeForm.achievedMarks === "" ||
        !Number.isFinite(marks) ||
        marks < 0 ||
        marks > totalMarks)
    ) {
      alert(`Enter marks between 0 and ${totalMarks}.`);
      return;
    }

    try {
      setLoading(true);

      const gradeData = {
        achievedMarks: gradeForm.status === "Rejected" ? 0 : marks,
        feedback: gradeForm.feedback,
        status: gradeForm.status,
      };

      const response = await gradesubmission(
        selectedSubmission._id,
        gradeData
      );

      const updatedResponse = await takesubmissions(selectedTask);

      setSubmissions(updatedResponse.submissions || []);
      setSelectedSubmission(null);

      alert(response.message || "Intern evaluation saved successfully!");

      setActivetab("submissionlist");
    } catch (error) {
      console.error("Grade Submission Error:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Unable to save evaluation."
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
      "Submission Description",
      "GitHub Repository",
      "Live Demo",
      "Submitted Date",
      "Status",
      "Marks",
      "Feedback",
    ];

    const rows = filteredSubmissions.map((submission) => {
      const intern = submission.intern || {};

      return [
        intern.fullName || "",
        intern.admissionNumber || intern._id || "",
        intern.email || "",
        submission.submissionText || "",
        submission.githubRepository || "",
        submission.liveDemoUrl || "",
        submission.createdAt
          ? new Date(submission.createdAt).toLocaleString()
          : "",
        submission.status || "",
        submission.achievedMarks ?? "",
        submission.feedback || "",
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

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "task-evaluation-submissions.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="tasks-evaluation-page">
      {/* TOP NAVIGATION */}
      <div className="tasks-evaluation-top-navigation">
        <div className="tasks-evaluation-tabs-group">
          <button
            type="button"
            onClick={() => setActivetab("submissionlist")}
            className={
              activetab === "submissionlist"
                ? "tasks-evaluation-tab-active"
                : "tasks-evaluation-tab"
            }
          >
            Submissions List
          </button>

          <button
            type="button"
            onClick={() => setActivetab("gradesubmission")}
            className={
              activetab === "gradesubmission"
                ? "tasks-evaluation-tab-active"
                : "tasks-evaluation-tab"
            }
          >
            Grade Submission
          </button>
        </div>

        {activetab === "submissionlist" && (
          <button
            type="button"
            className="tasks-evaluation-export-btn"
            onClick={handleExport}
            disabled={!filteredSubmissions.length}
          >
            <MdFileDownload />
            Export
          </button>
        )}
      </div>

      {/* ================================= */}
      {/* SUBMISSIONS LIST */}
      {/* ================================= */}

      {activetab === "submissionlist" && (
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

            {selectedTask && (
              <div className="tasks-evaluation-total-badge">
                Total Submissions: {submissions.length}
              </div>
            )}
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

              {/* LOADING */}
              {loading ? (
                <p>Loading submissions...</p>
              ) : filteredSubmissions.length > 0 ? (
                <div className="tasks-evaluation-table-wrapper">
                  <table className="tasks-evaluation-table">
                    <thead>
                      <tr>
                        <th>Intern</th>
                        <th>Submission Date</th>
                        <th>Attachment</th>
                        <th>Marks</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSubmissions.map((submission) => {
                        const intern = submission.intern || {};

                        return (
                          <tr key={submission._id}>
                            {/* INTERN */}
                            <td className="tasks-evaluation-intern-name">
                              <div className="tasks-evaluation-intern-cell">
                                <span className="tasks-evaluation-intern-avatar">
                                  {(intern.fullName || "U")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>

                                <div className="tasks-evaluation-intern-meta">
                                  <strong>
                                    {intern.fullName || "Unknown Intern"}
                                  </strong>
                                  <small>
                                    {intern.email || "-"}
                                  </small>
                                </div>
                              </div>
                            </td>

                            {/* SUBMISSION DATE */}
                            <td>{formatDate(submission.createdAt)}</td>

                            {/* ATTACHMENT */}
                            <td>
                              {submission.attachments?.length > 0 ? (
                                <div className="tasks-evaluation-attachments">
                                  {submission.attachments.map((file, fileIndex) => (
                                    <button
                                      type="button"
                                      key={fileIndex}
                                      className="tasks-evaluation-download-link"
                                      title={file.split("/").pop()}
                                      onClick={() => handleDownloadAttachment(file)}
                                    >
                                      <MdFileDownload />
                                      <span>Download</span>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </td>

                            {/* MARKS */}
                            <td>
                              <strong>
                                {submission.achievedMarks ?? 0}
                              </strong>
                              {" / "}
                              {selectedTaskData?.totalMarks ?? 0}
                            </td>

                            {/* STATUS */}
                            <td>
                              <span
                                className={`tasks-evaluation-status tasks-evaluation-status-${(
                                  submission.status || "submitted"
                                )
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                              >
                                {submission.status || "Submitted"}
                              </span>
                            </td>

                            {/* ACTIONS */}
                            <td>
                              <button
                                type="button"
                                className="tasks-evaluation-edit-grade-btn"
                                onClick={() => handleEvaluate(submission)}
                                disabled={loading}
                              >
                                Edit Grade
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
      )}

      {/* ================================= */}
      {/* GRADE SUBMISSION */}
      {/* ================================= */}

      {activetab === "gradesubmission" && (
        <div className="gradesubmission">
          <form
            onSubmit={handleGradeSubmit}
            className="gradesubmission-card"
          >
            <h2>
              Review &amp; Grade Submission
              {gradeForm.submittedBy
                ? ` for ${gradeForm.submittedBy}`
                : ""}
            </h2>

            <div className="gradesubmission-grid">
              <div className="gradesubmissionforminput">
                <label htmlFor="grade-task-title">Task Title</label>
                <input
                  id="grade-task-title"
                  name="taskTitle"
                  type="text"
                  value={gradeForm.taskTitle}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-module">Module</label>
                <input
                  id="grade-module"
                  name="module"
                  type="text"
                  value={gradeForm.module}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-status">Status</label>
                <select
                  id="grade-status"
                  name="status"
                  value={gradeForm.status}
                  onChange={handleGradeFieldChange}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Graded">Graded</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-submitted-by">Submitted By</label>
                <input
                  id="grade-submitted-by"
                  name="submittedBy"
                  type="text"
                  value={gradeForm.submittedBy}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-submitted-date">Submitted Date</label>
                <input
                  id="grade-submitted-date"
                  name="submittedDate"
                  type="text"
                  value={gradeForm.submittedDate}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-due-date">Due Date</label>
                <input
                  id="grade-due-date"
                  name="dueDate"
                  type="text"
                  value={gradeForm.dueDate}
                  readOnly
                />
              </div>
            </div>

            <div className="gradesubmissionforminput gradesubmission-full-width">
              <label htmlFor="grade-description">Submission Description</label>
              <textarea
                id="grade-description"
                name="submissionDescription"
                rows={4}
                value={gradeForm.submissionDescription}
                readOnly
              />
            </div>

            <div className="gradesubmission-grid">
              <div className="gradesubmissionforminput">
                <label htmlFor="grade-github-repo">GitHub Repository</label>
                <input
                  id="grade-github-repo"
                  name="githubRepo"
                  type="text"
                  value={gradeForm.githubRepo}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-live-demo">
                  Live Demo URL <span>(Optional)</span>
                </label>
                <input
                  id="grade-live-demo"
                  name="liveDemoUrl"
                  type="text"
                  value={gradeForm.liveDemoUrl}
                  placeholder="Enter live demo URL"
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-total-marks">Total Marks</label>
                <input
                  id="grade-total-marks"
                  name="totalMarks"
                  type="number"
                  value={gradeForm.totalMarks}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-attachment">
                  Attachment <span>(Optional - ZIP/PNG/PDF only)</span>
                </label>
                <input
                  id="grade-attachment"
                  name="attachmentName"
                  type="text"
                  value={gradeForm.attachmentName || "No files uploaded"}
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-achieved-marks">Achieved Marks</label>
                <input
                  id="grade-achieved-marks"
                  name="achievedMarks"
                  type="number"
                  min={0}
                  max={gradeForm.totalMarks}
                  value={gradeForm.achievedMarks}
                  onChange={handleGradeFieldChange}
                  required={gradeForm.status === "Graded"}
                  disabled={gradeForm.status === "Rejected"}
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-feedback">Feedback</label>
                <input
                  id="grade-feedback"
                  name="feedback"
                  type="text"
                  value={gradeForm.feedback}
                  onChange={handleGradeFieldChange}
                  placeholder="Enter feedback"
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-reviewed-by">Reviewed By</label>
                <input
                  id="grade-reviewed-by"
                  value={
                    gradeForm.reviewedBy ||
                    "Will be updated after evaluation"
                  }
                  readOnly
                />
              </div>

              <div className="gradesubmissionforminput">
                <label htmlFor="grade-reviewed-date">Reviewed Date</label>
                <input
                  id="grade-reviewed-date"
                  value={
                    gradeForm.reviewedDate ||
                    "Will be updated after evaluation"
                  }
                  readOnly
                />
              </div>
            </div>

            <div className="gradesubmission-actions">
              <button
                type="button"
                className="gradesubmission-cancel-btn"
                onClick={() => setActivetab("submissionlist")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="gradesubmission-submit-btn"
                disabled={loading || !selectedSubmission}
              >
                {loading ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Taskevaluation;