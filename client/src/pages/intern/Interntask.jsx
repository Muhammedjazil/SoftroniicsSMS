import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LuClipboardList,
  LuEye,
  LuFileText,
  LuInfo,
  LuX,
} from "react-icons/lu";

import "./interntask.css";
import UserService from "../../services/user-api-services/UserService";
import Loader from "../../components/common/Loader";
import { useToast } from "../../components/common/Toast";

export const Intrentask = () => {
  const { setHeaderMeta } = useOutletContext() || {};
  const { showToast, ToastContainer } = useToast();
  const { takealltask, takemysubmissions, createTaskSubmission } =
    UserService();

  // ==========================================
  // STATES
  // ==========================================

  const [activeTab, setActiveTab] = useState("assigned");

  useEffect(() => {
    if (!setHeaderMeta) return;
    const currentPath =
      activeTab === "submit"
        ? "Submit Task"
        : activeTab === "submissions"
          ? "My Submissions"
          : "Assigned Tasks";

    setHeaderMeta({
      title: "Task Submission",
      parentPath: "Tasks",
      currentPath,
      onParentClick: () => {
        setActiveTab("assigned");
        setSelectedTask(null);
        setModalType("");
      },
    });
  }, [activeTab, setHeaderMeta]);

  const [alltask, setAlltask] = useState([]);
  const [allsubmissions, setAllsubmissions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState("");

  const [submissionData, setSubmissionData] = useState({
    submissionText: "",
    githubRepository: "",
    liveDemoUrl: "",
    attachment: null,
  });

  const [submitting, setSubmitting] = useState(false);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-GB");
  };

  // Matches MM/DD/YYYY shown in the modal screenshot
  const formatModalDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-US");
  };

  // ==========================================
  // GET MODULE NAME
  // ==========================================

  const getModuleName = (module) => {
    if (!module) return "-";

    if (typeof module === "object") {
      return module.moduleName || module.name || "-";
    }

    return module;
  };

  // ==========================================
  // GET MENTOR NAME
  // ==========================================

  const getMentorName = (mentor) => {
    if (!mentor) return "-";

    if (typeof mentor === "string") return mentor;

    return mentor.fullName || mentor.name || "-";
  };

  // ==========================================
  // GET TASK TITLE
  // ==========================================

  const getTaskTitle = (submission) => {
    if (!submission?.task) return "Task unavailable";

    if (typeof submission.task === "object") {
      return submission.task.title || "Task unavailable";
    }

    return "Task unavailable";
  };

  // ==========================================
  // FETCH TASKS AND SUBMISSIONS
  // ==========================================

  const fetchTaskData = async () => {
    try {
      setLoading(true);
      setError("");

      const [taskResponse, submissionResponse] = await Promise.all([
        takealltask(),
        takemysubmissions(),
      ]);

      setAlltask(
        Array.isArray(taskResponse?.tasks) ? taskResponse.tasks : []
      );

      setAllsubmissions(
        Array.isArray(submissionResponse?.submissions)
          ? submissionResponse.submissions
          : []
      );
    } catch (error) {
      console.error("Fetch Task Error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load task details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, []);

  // ==========================================
  // VIEW TASK
  // ==========================================

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setModalType("view");
  };

  // ==========================================
  // SUBMIT TASK - FULL PAGE
  // ==========================================

  const handleSubmitTask = (task) => {
    if (!task) return;

    setSelectedTask(task);

    setSubmissionData({
      submissionText: "",
      githubRepository: "",
      liveDemoUrl: "",
      attachment: null,
    });

    setModalType("");
    setActiveTab("submit");
  };

  // ==========================================
  // VIEW SUBMISSION
  // ==========================================

  const handleViewSubmission = (submission) => {
    setSelectedTask(submission);
    setModalType("submission");
  };

  // ==========================================
  // CLOSE MODAL / CANCEL SUBMISSION
  // ==========================================

  const closeModal = () => {
    if (submitting) return;

    setSelectedTask(null);
    setModalType("");

    if (activeTab === "submit") {
      setActiveTab("assigned");
    }
  };

  // ==========================================
  // CHANGE SUBMISSION INPUTS
  // ==========================================

  const handleSubmissionChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "attachment") {
      const file = files?.[0];

      if (!file) return;

      const allowedExtensions = /\.(zip|png|pdf)$/i;

      if (!allowedExtensions.test(file.name)) {
        showToast("Only ZIP, PNG and PDF files are allowed.", "error");
        e.target.value = "";
        return;
      }

      setSubmissionData((prev) => ({
        ...prev,
        attachment: file,
      }));

      return;
    }

    setSubmissionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE TASK SUBMISSION
  // ==========================================

  const handleSaveSubmission = async (e) => {
    e.preventDefault();

    if (!selectedTask?._id) {
      showToast("Task information is missing.", "error");
      return;
    }

    if (!submissionData.submissionText.trim()) {
      showToast("Please enter submission description.", "error");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("task", selectedTask._id);
      formData.append("submissionText", submissionData.submissionText.trim());
      formData.append(
        "githubRepository",
        submissionData.githubRepository.trim()
      );
      formData.append("liveDemoUrl", submissionData.liveDemoUrl.trim());

      if (submissionData.attachment) {
        formData.append("attachments", submissionData.attachment);
      }

      const response = await createTaskSubmission(formData);

      showToast(response.message || "Task submitted successfully!", "success");

      setSubmissionData({
        submissionText: "",
        githubRepository: "",
        liveDemoUrl: "",
        attachment: null,
      });

      setSelectedTask(null);
      setModalType("");

      await fetchTaskData();

      setActiveTab("submissions");
    } catch (error) {
      console.error("Submission Error:", error);

      showToast(
        error.message ||
          error.response?.data?.message ||
          "Task submission failed.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Graded") {
      return "int-status-graded";
    }

    if (status === "Rejected") {
      return "int-status-rejected";
    }

    return "int-status-submitted";
  };

  // ==========================================
  // MAIN JSX
  // ==========================================

  return (
    <div className="wk-card-container">
      <ToastContainer />
      <div className="wk-card-body">
        {/* ==================================
            TABS
        ================================== */}

        {activeTab !== "submit" && (
          <div className="int-task-tabs-row">
            <button
              type="button"
              className={`int-task-tab-btn ${
                activeTab === "assigned" ? "int-task-tab-btn--active" : ""
              }`}
              onClick={() => setActiveTab("assigned")}
            >
              Assigned Tasks
            </button>

            <button
              type="button"
              className={`int-task-tab-btn ${
                activeTab === "submissions" ? "int-task-tab-btn--active" : ""
              }`}
              onClick={() => setActiveTab("submissions")}
            >
              My Submissions
            </button>
          </div>
        )}

        {/* ==================================
            MAIN CONTENT
        ================================== */}

        <div className="int-task-card">
          {loading ? (
            <Loader message="Loading task details..." minHeight="280px" />
          ) : error ? (
            <div className="int-task-error">
              <p>{error}</p>
              <button type="button" onClick={fetchTaskData}>
                Try Again
              </button>
            </div>
          ) : activeTab === "submit" ? (
            /* ==================================
               FULL PAGE SUBMISSION FORM
            ================================== */

            selectedTask && (
              <div className="int-submit-page">
                <div className="int-submit-page-header">
                  <div>
                    <h2>Task Submission</h2>
                    <p>Task &gt; Task Submission</p>
                  </div>

                  <button
                    type="button"
                    className="int-submit-back-btn"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    <LuX />
                    Cancel
                  </button>
                </div>

                {/* Mentor Instructions */}

                <div className="int-mentor-instructions">
                  <div className="int-mentor-instructions-header">
                    <div className="int-mentor-icon">
                      <LuFileText />
                    </div>

                    <div className="int-mentor-title-info">
                      <h3>{selectedTask.title}</h3>
                      <p>
                        Mentor: {getMentorName(selectedTask.assignedMentor)} •
                        Due: {formatDate(selectedTask.dueDate)} • Total Marks:{" "}
                        {selectedTask.totalMarks || 0} pts
                      </p>
                    </div>

                    <span className="int-mentor-label">
                      MENTOR'S INSTRUCTIONS
                    </span>
                  </div>

                  <div className="int-instruction-description">
                    <strong>ⓘ DESCRIPTION ADDED BY MENTOR</strong>
                    <p>
                      {selectedTask.description || "No instructions provided."}
                    </p>
                  </div>
                </div>

                {/* Submission Form */}

                <form
                  onSubmit={handleSaveSubmission}
                  className="int-submit-form"
                >
                  <div className="int-submit-grid">
                    <div className="int-submit-field">
                      <label>Task Title</label>
                      <input value={selectedTask.title || ""} readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Module</label>
                      <input
                        value={getModuleName(selectedTask.module)}
                        readOnly
                      />
                    </div>

                    <div className="int-submit-field">
                      <label>Status</label>
                      <input value="Submitted" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Submitted By</label>
                      <input value="Me" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Submitted Date</label>
                      <input value={formatDate(new Date())} readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Due Date</label>
                      <input
                        value={formatDate(selectedTask.dueDate)}
                        readOnly
                      />
                    </div>

                    <div className="int-submit-field int-submit-full">
                      <label>Submission Description</label>
                      <textarea
                        name="submissionText"
                        value={submissionData.submissionText}
                        onChange={handleSubmissionChange}
                        placeholder="Enter your submission description"
                        rows="5"
                        required
                      />
                    </div>

                    <div className="int-submit-field">
                      <label>GitHub Repository</label>
                      <input
                        type="url"
                        name="githubRepository"
                        value={submissionData.githubRepository}
                        onChange={handleSubmissionChange}
                        placeholder="Enter GitHub repository link"
                      />
                    </div>

                    <div className="int-submit-field">
                      <label>Live Demo URL (Optional)</label>
                      <input
                        type="url"
                        name="liveDemoUrl"
                        value={submissionData.liveDemoUrl}
                        onChange={handleSubmissionChange}
                        placeholder="Enter live demo URL"
                      />
                    </div>

                    <div className="int-submit-field">
                      <label>Total Marks</label>
                      <input value={selectedTask.totalMarks || 0} readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>
                        Attachments (Optional - ZIP/PNG/PDF only)
                      </label>
                      <input
                        type="file"
                        name="attachment"
                        accept=".zip,.png,.pdf"
                        onChange={handleSubmissionChange}
                      />
                      {submissionData.attachment && (
                        <small className="int-file-name">
                          {submissionData.attachment.name}
                        </small>
                      )}
                    </div>

                    <div className="int-submit-field">
                      <label>Achieved Marks</label>
                      <input value="N/A" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Feedback</label>
                      <input value="No feedback yet" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Submission Status</label>
                      <input value="Submitted" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Reviewed By</label>
                      <input value="Not reviewed yet" readOnly />
                    </div>

                    <div className="int-submit-field">
                      <label>Reviewed Date</label>
                      <input value="dd-mm-yyyy" readOnly />
                    </div>
                  </div>

                  <div className="int-submit-footer">
                    <button
                      type="button"
                      className="int-submit-cancel"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="int-submit-save"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            )
          ) : activeTab === "assigned" ? (
            /* ==================================
               ASSIGNED TASKS
            ================================== */

            alltask.length > 0 ? (
              <div className="int-task-table-wrapper">
                <table className="int-task-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Task Type</th>
                      <th>Module</th>
                      <th>Mentor</th>
                      <th>Due Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {alltask.map((task, index) => (
                      <tr key={task._id}>
                        <td>{index + 1}</td>

                        <td className="int-task-title-cell">
                          <strong>{task.title}</strong>
                          <span>
                            {task.description || "No description available"}
                          </span>
                        </td>

                        <td>
                          <span className="int-task-type-badge">
                            {task.taskType || "-"}
                          </span>
                        </td>

                        <td>
                          <span className="int-task-module-badge">
                            {getModuleName(task.module)}
                          </span>
                        </td>

                        <td>{getMentorName(task.assignedMentor)}</td>

                        <td>{formatDate(task.dueDate)}</td>

                        <td>
                          <div className="int-task-actions">
                            <button
                              type="button"
                              className="int-task-action-btn"
                              onClick={() => handleViewTask(task)}
                            >
                              <LuEye />
                              View Task
                            </button>

                            <button
                              type="button"
                              className="int-task-action-btn int-task-submit-btn"
                              onClick={() => handleSubmitTask(task)}
                            >
                              Submit Task
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="int-task-empty-box">
                <div className="int-task-empty-icon-circle">
                  <LuClipboardList />
                </div>

                <h3 className="int-task-empty-title">No tasks assigned</h3>

                <p className="int-task-empty-desc">
                  You currently have no tasks assigned to you.
                </p>
              </div>
            )
          ) : (
            /* ==================================
               MY SUBMISSIONS
            ================================== */

            allsubmissions.length > 0 ? (
              <div className="int-task-table-wrapper">
                <table className="int-task-table int-submission-table">
                  <thead>
                    <tr>
                      <th>Task Title</th>
                      <th>Submitted Date</th>
                      <th>Marks Obtained</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {allsubmissions.map((submission) => (
                      <tr key={submission._id}>
                        <td className="int-task-title-cell">
                          <strong>{getTaskTitle(submission)}</strong>
                          <span>{getModuleName(submission.task?.module)}</span>
                        </td>

                        <td>{formatDate(submission.createdAt)}</td>

                        <td>
                          {submission.status === "Graded"
                            ? `${submission.achievedMarks || 0} / ${
                                submission.task?.totalMarks ?? 0
                              }`
                            : `- / ${submission.task?.totalMarks ?? 0}`}
                        </td>

                        <td>
                          <span
                            className={`int-submission-status ${getStatusClass(
                              submission.status
                            )}`}
                          >
                            {submission.status || "Submitted"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="int-task-action-btn int-view-submission-btn"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <LuEye />
                            View Submission
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="int-task-empty-box">
                <div className="int-task-empty-icon-circle">
                  <LuFileText />
                </div>

                <h3 className="int-task-empty-title">No submissions yet</h3>

                <p className="int-task-empty-desc">
                  You haven't submitted any tasks yet. Go to Assigned Tasks and
                  click Submit Task to start.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* ==================================
          VIEW TASK / VIEW SUBMISSION MODAL
      ================================== */}

      {selectedTask && modalType !== "" && (
        <div className="int-task-modal-overlay" onClick={closeModal}>
          <div
            className={`int-task-modal ${
              modalType === "view" ? "int-task-modal--view" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "view" ? (
              /* ==================================
                 VIEW TASK MODAL (MATCHES IMAGE)
              ================================== */
              <>
                <div className="int-view-modal-header">
                  <div className="int-view-modal-icon-box">
                    <LuFileText />
                  </div>

                  <div className="int-view-modal-title-group">
                    <h3>{selectedTask.title}</h3>
                    {selectedTask.taskType && (
                      <span className="int-view-type-pill">
                        {selectedTask.taskType}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="int-view-modal-close"
                    onClick={closeModal}
                    aria-label="Close modal"
                  >
                    <LuX />
                  </button>
                </div>

                <div className="int-view-modal-body">
                  <div className="int-view-meta-card">
                    <div className="int-view-meta-item">
                      <span className="int-view-meta-label">MODULE</span>
                      <strong className="int-view-meta-value">
                        {getModuleName(selectedTask.module)}
                      </strong>
                    </div>

                    <div className="int-view-meta-item">
                      <span className="int-view-meta-label">
                        ASSIGNED MENTOR
                      </span>
                      <strong className="int-view-meta-value">
                        {getMentorName(selectedTask.assignedMentor)}
                      </strong>
                    </div>

                    <div className="int-view-meta-item">
                      <span className="int-view-meta-label">DUE DATE</span>
                      <strong className="int-view-meta-value int-view-due-date">
                        {formatModalDate(selectedTask.dueDate)}
                      </strong>
                    </div>

                    <div className="int-view-meta-item">
                      <span className="int-view-meta-label">TOTAL MARKS</span>
                      <strong className="int-view-meta-value">
                        {selectedTask.totalMarks ?? 0} pts
                      </strong>
                    </div>
                  </div>

                  <div className="int-view-desc-section">
                    <div className="int-view-desc-heading">
                      <LuInfo />
                      <span>TASK DESCRIPTION (FROM MENTOR)</span>
                    </div>

                    <div className="int-view-desc-box">
                      {selectedTask.description
                        ? selectedTask.description
                            .split("\n")
                            .map((line, idx) => <p key={idx}>{line}</p>)
                        : "No description provided."}
                    </div>
                  </div>
                </div>

                <div className="int-view-modal-footer">
                  <button
                    type="button"
                    className="int-view-btn-close"
                    onClick={closeModal}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    className="int-view-btn-submit"
                    onClick={() => handleSubmitTask(selectedTask)}
                  >
                    Submit Task
                  </button>
                </div>
              </>
            ) : (
              /* ==================================
                 SUBMISSION DETAILS MODAL
              ================================== */
              <>
                <div className="int-task-modal-header">
                  <h3>Submission Details</h3>
                  <button type="button" onClick={closeModal}>
                    &times;
                  </button>
                </div>

                <div className="int-task-modal-body">
                  <p>
                    <strong>Task:</strong> {getTaskTitle(selectedTask)}
                  </p>

                  <p>
                    <strong>Submitted Date:</strong>{" "}
                    {formatDate(selectedTask.createdAt)}
                  </p>

                  <p>
                    <strong>Status:</strong> {selectedTask.status || "Submitted"}
                  </p>

                  <p>
                    <strong>Submission Text:</strong>{" "}
                    {selectedTask.submissionText || "No text provided"}
                  </p>

                  <p>
                    <strong>GitHub:</strong>{" "}
                    {selectedTask.githubRepository || "-"}
                  </p>

                  <p>
                    <strong>Live Demo:</strong>{" "}
                    {selectedTask.liveDemoUrl || "-"}
                  </p>

                  <p>
                    <strong>Feedback:</strong>{" "}
                    {selectedTask.feedback || "No feedback yet"}
                  </p>

                  <p>
                    <strong>Achieved Marks:</strong>{" "}
                    {selectedTask.achievedMarks ?? "Not graded"}
                  </p>
                </div>

                <div className="int-task-modal-footer">
                  <button type="button" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Intrentask;