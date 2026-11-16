
import { useState } from "react";

import {
  FiUser,
  FiSearch,
  FiRefreshCw
} from "react-icons/fi";

import "./Internnotification.css";

export const Internnotification = () => {

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [notifications, setNotifications] = useState([]);

  // Notification categories
  const tabs = [
    "All",
    "Task",
    "Reminder",
    "Announcement",
    "Schedule",
    "Common"
  ];

  // Filter notifications
  const filteredNotifications = notifications.filter((item) => {

    const matchesTab =
      activeTab === "All" || item.type === activeTab;

    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Get notification count
  const getCount = (tab) => {
    if (tab === "All") {
      return notifications.length;
    }

    return notifications.filter(
      (item) => item.type === tab
    ).length;
  };

  // Refresh notifications
  const handleRefresh = () => {
    setSearch("");
    setActiveTab("All");
  };

  return (

    <div className="Internnotification">

      {/* HEADER SECTION */}

      <div className="Internnotificationsec1">

        <div className="Internnotificationsec2">

          <h2>Notifications</h2>

          <p>
            Notifications &gt; notifications
          </p>

        </div>

        {/* PROFILE SECTION */}

        <div className="Internnotificationsec3">

          <div className="Internnotificationsect4">
            <FiUser />
          </div>

          <div className="Internnotificationsect5">

            <h3>MUHAMMED JAZIL K</h3>

            <p>Intern</p>

          </div>

        </div>

        {/* MY NOTIFICATIONS BUTTON */}

        <div className="internnotificationtopbutton">

          <button>
            My Notifications
          </button>

        </div>

      </div>


      {/* NOTIFICATION HERO SECTION */}

      <div className="internnotificationhero">

        {/* CATEGORY BUTTONS */}

        <div className="notificationbuttons">

          {tabs.map((tab) => (

            <button
              key={tab}
              className={
                activeTab === tab
                  ? "notificationactive"
                  : ""
              }
              onClick={() => setActiveTab(tab)}
            >

              {tab}

              <span
                className={
                  activeTab === tab
                    ? "notificationcount activecount"
                    : "notificationcount"
                }
              >
                {getCount(tab)}
              </span>

            </button>

          ))}

        </div>


        {/* SEARCH AND REFRESH */}

        <div className="notificationsearch">

          <div className="notificationsearchbox">

            <FiSearch />

            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <button
            className="notificationrefresh"
            onClick={handleRefresh}
            title="Refresh notifications"
          >
            <FiRefreshCw />
          </button>

        </div>

      </div>


      {/* NOTIFICATION CONTENT */}

      <div className="notificationcontent">

        {filteredNotifications.length > 0 ? (

          <div className="notificationlist">

            {filteredNotifications.map((item) => (

              <div
                className="notificationitem"
                key={item._id}
              >

                <div className="notificationitemdetails">

                  <h3>{item.title}</h3>

                  <p>{item.message}</p>

                  <span>{item.type}</span>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="notificationempty">

            <p>No notifications found</p>

          </div>

        )}

      </div>

    </div>

  );
};
