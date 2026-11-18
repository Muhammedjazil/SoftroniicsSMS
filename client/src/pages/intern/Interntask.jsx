import React, { useState } from "react";
import { LuUser, LuClipboardList } from "react-icons/lu";
import "./interntask.css";

export const Intrentask = () => {
  const [activeTab, setActiveTab] = useState("assigned");

  return (
    <div className="wk-card-container">
      {/* Header */}
      <header className="wk-card-header">
        <div className="wk-card-title-group">
          <h1 className="wk-card-heading">Task</h1>
          <nav className="wk-card-breadcrumb">
            <span>Task</span>
            <span className="wk-card-breadcrumb-sep">&gt;</span>
            <span>Task Submission</span>
          </nav>
        </div>

        <div className="wk-card-profile-card">
          <div className="wk-card-profile-avatar">
            <LuUser />
          </div>
          <div className="wk-card-profile-info">
            <span className="wk-card-username">MUHAMMED JAZIL K</span>
            <span className="wk-card-role">Intern</span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="wk-card-body">
        {/* Tab Selection Row */}
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

        {/* Task Content Card */}
        <div className="int-task-card">
          <div className="int-task-empty-box">
            <div className="int-task-empty-icon-circle">
              <LuClipboardList />
            </div>

            {activeTab === "assigned" ? (
              <>
                <h3 className="int-task-empty-title">No tasks assigned</h3>
                <p className="int-task-empty-desc">
                  You currently have no tasks assigned to you.
                </p>
              </>
            ) : (
              <>
                <h3 className="int-task-empty-title">No submissions yet</h3>
                <p className="int-task-empty-desc">
                  You haven't submitted any tasks yet. Go to "Assigned Tasks" and
                  click "Submit Task" to start.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
