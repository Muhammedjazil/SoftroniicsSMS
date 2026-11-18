import React, { useState } from "react";
import { LuUser, LuSearch, LuRotateCw, LuBell } from "react-icons/lu";
import "./Internnotification.css";

export const Internnotification = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [notifications] = useState([]);

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
    const matchesTab = activeTab === "All" || item.type === activeTab;
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.message?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Get notification count
  const getCount = (tab) => {
    if (tab === "All") {
      return notifications.length;
    }
    return notifications.filter((item) => item.type === tab).length;
  };

  // Refresh notifications
  const handleRefresh = () => {
    setSearch("");
    setActiveTab("All");
  };

  return (
    <div className="wk-card-container">
      {/* Header */}
      <header className="wk-card-header">
        <div className="wk-card-title-group">
          <h1 className="wk-card-heading">Notifications</h1>
          <nav className="wk-card-breadcrumb">
            <span>Notifications</span>
            <span className="wk-card-breadcrumb-sep">&gt;</span>
            <span>All Notifications</span>
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
          {filteredNotifications.length > 0 ? (
            <div className="int-notif-list">
              {filteredNotifications.map((item) => (
                <div className="int-notif-item" key={item._id || item.id}>
                  <div className="int-notif-item-left">
                    <div className="int-notif-item-icon">
                      <LuBell />
                    </div>
                    <div className="int-notif-item-details">
                      <h3 className="int-notif-item-title">{item.title}</h3>
                      <p className="int-notif-item-msg">{item.message}</p>
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
