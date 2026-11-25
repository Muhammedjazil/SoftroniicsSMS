
import React, { useEffect, useState } from "react";
import {
  LuClipboardList,
  LuEye,
  LuSend,
  LuFileText,
} from "react-icons/lu";

import "./interntask.css";
import UserService from "../../services/user-api-services/UserService";

export const Intrentask = () => {
  const { takealltask, takemysubmissions } = UserService();

  const [activeTab, setActiveTab] = useState("assigned");
  const [alltask, setAlltask] = useState([]);
  const [allsubmissions, setAllsubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalType, setModalType] = useState("");

  // Format date
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Fetch assigned tasks and submissions
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
      setError(error.message || "Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskData();
  }, []);

  // Open task details
  const handleViewTask = (task) => {
    setSelectedTask(task);
    setModalType("view");
  };

  // Open submit task information
  const handleSubmitTask = (task) => {
    setSelectedTask(task);
    setModalType("submit");
  };

  // Open submission details
  const handleViewSubmission = (submission) => {
    setSelectedTask(submission);
    setModalType("submission");
  };

  const closeModal = () => {
    setSelectedTask(null);
    setModalType("");
  };

  const getMentorName = (mentor) => {
    if (!mentor) return "-";

    return mentor.fullName || mentor.name || "-";
  };

  const getTaskTitle = (submission) => {
    return submission.task?.title || "Task unavailable";
  };

  return (
    <div className="wk-card-container">
      <div className="wk-card-body">

        {/* Tabs */}
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

        {/* Content */}
        <div className="int-task-card">

          {loading ? (
            <div className="int-task-message">
              Loading task details...
            </div>
          ) : error ? (
            <div className="int-task-error">
              {error}
              <button type="button" onClick={fetchTaskData}>
                Try Again
              </button>
            </div>
          ) : activeTab === "assigned" ? (

            /* ASSIGNED TASKS TABLE */
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
                            {typeof task.module === "object"
                              ? task.module?.moduleName
                              : task.module || "-"}
                          </span>
                        </td>

                        <td>
                          {getMentorName(task.assignedMentor)}
                        </td>

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

                <h3 className="int-task-empty-title">
                  No tasks assigned
                </h3>

                <p className="int-task-empty-desc">
                  You currently have no tasks assigned to you.
                </p>
              </div>
            )

          ) : (

            /* MY SUBMISSIONS TABLE */
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
                          <strong>
                            {getTaskTitle(submission)}
                          </strong>

                          <span>
                            {submission.task?.module || "-"}
                          </span>
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
                            className={`int-submission-status ${
                              submission.status === "Graded"
                                ? "int-status-graded"
                                : submission.status === "Rejected"
                                ? "int-status-rejected"
                                : "int-status-submitted"
                            }`}
                          >
                            {submission.status || "Submitted"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="int-task-action-btn int-view-submission-btn"
                            onClick={() =>
                              handleViewSubmission(submission)
                            }
                          >
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

                <h3 className="int-task-empty-title">
                  No submissions yet
                </h3>

                <p className="int-task-empty-desc">
                  You haven't submitted any tasks yet. Go to Assigned
                  Tasks and click Submit Task to start.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Task / Submission Details Modal */}
      {selectedTask && (
        <div className="int-task-modal-overlay" onClick={closeModal}>
          <div
            className="int-task-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="int-task-modal-header">
              <h3>
                {modalType === "submission"
                  ? "Submission Details"
                  : modalType === "submit"
                  ? "Submit Task"
                  : "Task Details"}
              </h3>

              <button type="button" onClick={closeModal}>
                &times;
              </button>
            </div>

            <div className="int-task-modal-body">
              {modalType === "submission" ? (
                <>
                  <p>
                    <strong>Task:</strong> {getTaskTitle(selectedTask)}
                  </p>
                  <p>
                    <strong>Submitted Date:</strong>{" "}
                    {formatDate(selectedTask.createdAt)}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedTask.status}
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
                </>
              ) : (
                <>
                  <p>
                    <strong>Title:</strong> {selectedTask.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {selectedTask.description || "-"}
                  </p>
                  <p>
                    <strong>Task Type:</strong> {selectedTask.taskType || "-"}
                  </p>
                  <p>
                    <strong>Module:</strong>{" "}
                    {typeof selectedTask.module === "object"
                      ? selectedTask.module?.moduleName
                      : selectedTask.module || "-"}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {formatDate(selectedTask.dueDate)}
                  </p>

                  {modalType === "submit" && (
                    <p className="int-task-submit-note">
                      Submission form and submit API need to be connected
                      before you can send your work.
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="int-task-modal-footer">
              <button type="button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
