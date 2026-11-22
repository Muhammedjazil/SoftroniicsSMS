
import React from "react";
import { UserRound } from "lucide-react";

import "./Dashboard.css";

const Dashboard = () => {

  const reminders = [
    {
      category: "BIRTHDAY",
      title: "Today is Priyash's Birthday",
      color: "#096DCA"
    },
    {
      category: "HOLIDAY",
      title: "Indusua Closed Today - Onam Holiday",
      color: "#CD0000"
    },
    {
      category: "MEETING",
      title: "Staff Meeting today at 10 AM",
      color: "#096DCA"
    },
    {
      category: "ANNIVERSARY",
      title: "1 Year Milestone: Priyash at Softronics.",
      color: "#CE840C"
    }
  ];

  return (
    <div className="dashboard-layout">

      {/* Reusable Sidebar */}
    

      {/* Main Content */}
      <main className="dashboard-main">


        <section className="dashboard-content">

          <div className="reminder-section">
            <h3>Your Reminders For Today</h3>

            <div className="reminder-grid">

              {reminders.map((reminder, index) => (
                <div className="reminder-card" key={index}>

                  <span style={{ color: reminder.color }}>
                    {reminder.category}
                  </span>

                  <p>{reminder.title}</p>

                </div>
              ))}

            </div>
          </div>

        </section>

      </main>
    </div>
  );
};

export default Dashboard;
