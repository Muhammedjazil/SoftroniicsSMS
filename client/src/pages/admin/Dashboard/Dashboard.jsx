import React, { useEffect, useState } from "react";
import AdminService from "../../../services/admin-api-services/AdminService"; 
import "./Dashboard.css";

const Dashboard = () => {
  const { takenotifications } = AdminService();
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await takenotifications();
        const list = Array.isArray(res)
          ? res
          : res?.notifications || res?.data || [];

        const mapped = list.map((item) => ({
          id: item._id || item.id,
          category: (item.type || "REMINDER").toUpperCase(),
          title: item.title || item.content || "",
          color: "#096DCA",
        }));

        setReminders(mapped);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

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
                <div className="reminder-card" key={reminder.id || index}>
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