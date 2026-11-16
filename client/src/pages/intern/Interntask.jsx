
import { useState } from "react";

import {
  FiUser,
  FiClipboard
} from "react-icons/fi";

import "./interntask.css";

export const Intrentask = () => {

  const [activeTab, setActiveTab] = useState("assigned");

  return (
    <div className="intrentask">

      {/* HEADER SECTION */}
      <div className="intrentask-header">

        <div className="intrentask-heading">
          <h2>Task</h2>

          <p>
            Task <span>&gt;</span> Task Submission
          </p>
        </div>

        {/* USER PROFILE */}
        <div className="intrentask-profile">

          <div className="intrentask-profile-icon">
            <FiUser />
          </div>

          <div className="intrentask-profile-details">
            <h3>MUHAMMED JAZIL K</h3>
            <p>Intern</p>
          </div>

        </div>

      </div>


      {/* TAB SECTION */}
      <div className="intrentask-tab-section">

        <button
          className={`intrentask-tab ${
            activeTab === "assigned" ? "intrentask-active" : ""
          }`}
          onClick={() => setActiveTab("assigned")}
        >
          Assigned Tasks
        </button>

        <button
          className={`intrentask-tab ${
            activeTab === "submissions" ? "intrentask-active" : ""
          }`}
          onClick={() => setActiveTab("submissions")}
        >
          My Submissions
        </button>

      </div>


      {/* CONTENT SECTION */}
      <div className="intrentask-content">

        <div className="intrentask-empty-container">

          <div className="intrentask-empty-content">

            <FiClipboard className="intrentask-empty-icon" />

            {activeTab === "assigned" ? (

              <>
                <h3>No tasks assigned</h3>

                <p>
                  You currently have no tasks assigned to you.
                </p>
              </>

            ) : (

              <>
                <h3>No submissions yet</h3>

                <p>
                  You haven't submitted any tasks yet. Go to
                  "Assigned Tasks" and click "Submit Task" to start.
                </p>
              </>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};
