import React, { useEffect, useState } from "react";
import { LuUser, LuSearch, LuRotateCw, LuBell } from "react-icons/lu";
import "./Internnotification.css";
import UserService from "../../services/user-api-services/UserService";
import Loader from "../../components/common/Loader";
import { useToast } from "../../components/common/Toast";

export const Internnotification = () => {
  const { showToast, ToastContainer } = useToast();
  const {takeallnotification}=UserService()
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [notifications,setNotification] = useState([]);
  const [loading, setLoading] = useState(true);
 
  // Notification categories
  const tabs = [
    "All",
    "Task",
    "Reminder",
    "Announcement",
    "Schedule",
    "Common",
  ];

  // Filter notifications
 const filteredNotifications = notifications.filter((item) => {
  const matchesTab =
    activeTab === "All" ||
    (activeTab === "Task" && item.type === "Task Notification") ||
    (activeTab === "Schedule" && item.type === "Weekly Schedule") ||
    (activeTab === "Common" && item.type === "Common Notification") ||
    item.type === activeTab;

  const matchesSearch =
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.content?.toLowerCase().includes(search.toLowerCase());

  return matchesTab && matchesSearch;
});

  // Get notification count
 const getCount = (tab) => {
  if (tab === "All") return notifications.length;

  const typeMapping = {
    Task: "Task Notification",
    Schedule: "Weekly Schedule",
    Common: "Common Notification",
  };

  const backendType = typeMapping[tab] || tab;

  return notifications.filter(
    (item) => item.type === backendType
  ).length;
};

  // Refresh notifications
  const handleRefresh = () => {
    setSearch("");
    setActiveTab("All");
    fetchnotification();
  };

const fetchnotification = async () => {
  try {
    setLoading(true);
    const response = await takeallnotification();

    console.log("Notification API response:", response);

    setNotification(response.notifications || []);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    setNotification([]);
    showToast("Failed to load notifications", "error");
  } finally {
    setLoading(false);
  }
};
  useEffect(()=>{
    fetchnotification()
  },[])

  return (
    <div className="wk-card-container">
      <ToastContainer />
      {/* Main Content Body */}
      <div className="wk-card-body">
        {/* Filter and Search Bar */}
        <div className="int-notif-toolbar">
          <div className="int-notif-tabs">
            {tabs.map((tab) => {
              const count = getCount(tab);
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  className={`int-notif-tab-btn ${
                    isActive ? "int-notif-tab-btn--active" : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <span>{tab}</span>
                  <span
                    className={`int-notif-count-badge ${
                      isActive ? "int-notif-count-badge--active" : ""
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="int-notif-actions">
            <button
              type="button"
              className="int-notif-main-btn"
            >
              My Notifications
            </button>

            <div className="int-notif-search-box">
              <LuSearch className="int-notif-search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="int-notif-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="int-notif-refresh-btn"
              onClick={handleRefresh}
              title="Refresh notifications"
              aria-label="Refresh notifications"
            >
              <LuRotateCw />
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="int-notif-card">
          {loading ? (
            <Loader message="Loading notifications..." minHeight="260px" />
          ) : filteredNotifications.length > 0 ? (
            <div className="int-notif-list">
              {filteredNotifications.map((item) => (
                <div className="int-notif-item" key={item._id || item.id}>
                  <div className="int-notif-item-left">
                    <div className="int-notif-item-icon">
                      <LuBell />
                    </div>
                    <div className="int-notif-item-details">
                      <h3 className="int-notif-item-title">{item.title}</h3>
                     <p className="int-notif-item-msg">{item.content}</p>
                    </div>
                  </div>
                  <span className="int-notif-tag">
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="int-notif-empty-box">
              <div className="int-notif-empty-icon-circle">
                <LuBell />
              </div>
              <h3 className="int-notif-empty-title">No notifications found</h3>
              <p className="int-notif-empty-desc">
                {search
                  ? "No notifications match your search query."
                  : "You're all caught up! There are no notifications to show right now."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internnotification;
