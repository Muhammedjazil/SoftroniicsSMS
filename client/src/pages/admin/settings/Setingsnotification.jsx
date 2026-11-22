
import { useState } from "react";

import {
  FiUser,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiFileText
} from "react-icons/fi";

import "./Settingsnotification.css";

// =====================================
// SAMPLE DROPDOWN DATA
// =====================================

const batchOptions = [
  "John - UI/UX Designing 3M",
  "React Batch 2026",
  "MERN Stack 2026",
  "Python Batch 2026",
  "Data Analytics 2026"
];

const stackOptions = [
  "React",
  "MERN Stack",
  "Python",
  "UI/UX Designing",
  "Data Analytics"
];

const internOptions = [
  "John",
  "Thomson",
  "Muhammed",
  "Rahul",
  "Anjali"
];

const initialForm = {
  title: "",
  content: "",
  type: "",
  branch: "",
  audience: "",
  selectedAudience: [],
  pushNotification: false
};

export const Notification = () => {

  // =====================================
  // STATES
  // =====================================

  const [isactive, setIsactive] = useState("Notification");

  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState(initialForm);

  const [selectedIndex, setSelectedIndex] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const isView = isactive === "show";

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handleChange = (e) => {

    const { name, value, type, checked } = e.target;

    if (name === "audience") {

      setFormData((prev) => ({
        ...prev,
        audience: value,
        selectedAudience: []
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

  };

  // =====================================
  // ADD SELECTED AUDIENCE
  // =====================================

  const handleAddAudience = (e) => {

    const value = e.target.value;

    if (!value) return;

    setFormData((prev) => {

      if (prev.selectedAudience.includes(value)) {
        return prev;
      }

      return {
        ...prev,
        selectedAudience: [
          ...prev.selectedAudience,
          value
        ]
      };

    });

    e.target.value = "";

  };

  // =====================================
  // REMOVE SELECTED AUDIENCE
  // =====================================

  const handleRemoveAudience = (value) => {

    setFormData((prev) => ({
      ...prev,
      selectedAudience: prev.selectedAudience.filter(
        (item) => item !== value
      )
    }));

  };

  // =====================================
  // GET AUDIENCE OPTIONS
  // =====================================

  const getAudienceOptions = () => {

    if (formData.audience === "By Batch") {
      return batchOptions;
    }

    if (formData.audience === "By Stack") {
      return stackOptions;
    }

    if (formData.audience === "Individual Interns") {
      return internOptions;
    }

    return [];

  };

  // =====================================
  // GET SELECTED AUDIENCE TEXT
  // =====================================

  const getSelectedAudience = (item) => {

    if (item.audience === "All Interns") {
      return "All Interns";
    }

    return item.selectedAudience.join(", ");

  };

  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {

    setFormData({ ...initialForm });

    setSelectedIndex(null);

  };

  // =====================================
  // OPEN NEW NOTIFICATION
  // =====================================

  const handleNew = () => {

    resetForm();

    setIsactive("Newnotification");

  };

  // =====================================
  // PUBLISH / UPDATE
  // =====================================

  const handlePublish = () => {

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.type ||
      !formData.branch ||
      !formData.audience
    ) {

      alert("Please fill all required fields");

      return;

    }

    if (
      formData.audience !== "All Interns" &&
      formData.selectedAudience.length === 0
    ) {

      alert("Please select at least one audience");

      return;

    }

    if (selectedIndex !== null) {

      // UPDATE EXISTING NOTIFICATION

      setNotifications((prev) =>
        prev.map((item, index) =>
          index === selectedIndex
            ? { ...formData, id: item.id }
            : item
        )
      );

      alert("Notification updated successfully!");

    } else {

      // ADD NEW NOTIFICATION

      const newNotification = {
        ...formData,
        id: Date.now()
      };

      setNotifications((prev) => [
        ...prev,
        newNotification
      ]);

      alert("Notification published successfully!");

    }

    resetForm();

    setIsactive("Notification");

  };

  // =====================================
  // VIEW NOTIFICATION
  // =====================================

  const handleView = (index) => {

    setFormData({
      ...notifications[index],
      selectedAudience: [
        ...notifications[index].selectedAudience
      ]
    });

    setSelectedIndex(index);

    setIsactive("show");

  };

  // =====================================
  // EDIT NOTIFICATION
  // =====================================

  const handleEdit = (index) => {

    setFormData({
      ...notifications[index],
      selectedAudience: [
        ...notifications[index].selectedAudience
      ]
    });

    setSelectedIndex(index);

    setIsactive("Newnotification");

  };

  // =====================================
  // EDIT FROM VIEW PAGE
  // =====================================

  const handleViewEdit = () => {

    setIsactive("Newnotification");

  };

  // =====================================
  // DELETE NOTIFICATION
  // =====================================

  const handleDelete = (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this notification?"
    );

    if (!confirmDelete) return;

    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );

    if (selectedIndex !== null) {
      resetForm();
      setIsactive("Notification");
    }

  };

  // =====================================
  // BACK / CANCEL
  // =====================================

  const handleBack = () => {

    resetForm();

    setIsactive("Notification");

  };

  // =====================================
  // EXPORT CSV
  // =====================================

  const handleExport = () => {

    if (notifications.length === 0) {

      alert("No notifications available to export");

      return;

    }

    const headers = [
      "Title",
      "Content",
      "Type",
      "Branch",
      "Audience",
      "Selected Audience",
      "Push Notification"
    ];

    const rows = notifications.map((item) => [

      item.title,
      item.content,
      item.type,
      item.branch,
      item.audience,
      getSelectedAudience(item),
      item.pushNotification ? "Yes" : "No"

    ]);

    const csv = [
      headers,
      ...rows
    ].map((row) =>
      row.map((value) =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "notifications.csv";

    link.click();

    URL.revokeObjectURL(url);

  };

  // =====================================
  // PAGINATION
  // =====================================

  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / itemsPerPage)
  );

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentNotifications = notifications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =====================================
  // RENDER
  // =====================================

  return (

    <div className="notification">

     

      {/* =====================================
          MAIN CONTAINER
      ===================================== */}

      <div className="notificationherosection">

        {/* =====================================
            TOP TABS
        ===================================== */}

        <div className="notificationtopbar">

          <div className="notfibutton">

            <button
              className={
                isactive === "Notification"
                  ? "active"
                  : ""
              }
              onClick={() => {
                resetForm();
                setIsactive("Notification");
              }}
            >
              Notifications
            </button>

            <button
              className={
                isactive !== "Notification"
                  ? "active"
                  : ""
              }
              onClick={handleNew}
            >
              New Notification
            </button>

          </div>

          {isactive === "Notification" && (

            <button
              className="notificationexport"
              onClick={handleExport}
            >
              Export <FiDownload />
            </button>

          )}

        </div>

        {/* =====================================
            NOTIFICATION TABLE
        ===================================== */}

        {isactive === "Notification" && (

          <>

            <div className="notificationtable">

              <table>

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Title</th>

                    <th>Type</th>

                    <th>Branch</th>

                    <th>Audience</th>

                    <th>Selected Audience</th>

                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {currentNotifications.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="notificationempty"
                      >

                        <FiFileText />

                        <p>No notifications available</p>

                      </td>

                    </tr>

                  ) : (

                    currentNotifications.map((item, index) => {

                      const actualIndex = startIndex + index;

                      return (

                        <tr key={item.id}>

                          <td>{actualIndex + 1}</td>

                          <td>{item.title}</td>

                          <td>{item.type}</td>

                          <td>{item.branch}</td>

                          <td>{item.audience}</td>

                          <td className="selectedaudience">

                            {getSelectedAudience(item)}

                          </td>

                          <td className="notificationactions">

                            <button
                              className="viewaction"
                              title="View"
                              onClick={() => handleView(actualIndex)}
                            >
                              <FiEye />
                            </button>

                            <button
                              className="editaction"
                              title="Edit"
                              onClick={() => handleEdit(actualIndex)}
                            >
                              <FiEdit />
                            </button>

                            <button
                              className="deleteaction"
                              title="Delete"
                              onClick={() => handleDelete(item.id)}
                            >
                              <FiTrash2 />
                            </button>

                          </td>

                        </tr>

                      );

                    })

                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="notificationpagination">

              <span>
                {notifications.length === 0 ? 0 : currentPage}
                {" "}of{" "}
                {totalPages}
              </span>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <FiChevronLeft />
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                <FiChevronRight />
              </button>

            </div>

          </>

        )}

        {/* =====================================
            NEW / EDIT / VIEW FORM
        ===================================== */}

        {(isactive === "Newnotification" || isactive === "show") && (

          <div className="Newnotification">

            {/* FORM HEADER */}

            <div className="Newnotificationsect1">

              <div className="Newnotificationsect2">

                <h2>

                  {isView
                    ? "Notification Details"
                    : selectedIndex !== null
                    ? "Edit Notification"
                    : "New Notification"}

                </h2>

              </div>

              <button
                className="notificationback"
                onClick={handleBack}
              >
                <FiArrowLeft /> Back
              </button>

            </div>

            {/* TITLE */}

            <div className="notificationfield">

              <label>Notification Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter Notification Title"
                readOnly={isView}
              />

            </div>

            {/* CONTENT */}

            <div className="notificationfield">

              <label>Notification Content</label>

              <textarea
                rows="3"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Enter The Details Of The Notification"
                readOnly={isView}
              />

            </div>

            {/* TYPE / BRANCH / AUDIENCE */}

            <div className="newnotificationforminput">

              {/* TYPE */}

              <div className="newnotifi1">

                <label>Type of Notification</label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isView}
                >

                  <option value="">Choose Type</option>

                  <option value="Reminder">Reminder</option>

                  <option value="Common">Common</option>

                  <option value="Announcement">Announcement</option>

                  <option value="Alert">Alert</option>

                  <option value="Event">Event</option>

                </select>

              </div>

              {/* BRANCH */}

              <div className="newnotifi1">

                <label>Branch</label>

                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  disabled={isView}
                >

                  <option value="">Choose Branch</option>

                  <option value="Calicut">Calicut</option>

                  <option value="Perinthalmanna">Perinthalmanna</option>

                  <option value="Kochi">Kochi</option>

                  <option value="Thrissur">Thrissur</option>

                  <option value="Palakkad">Palakkad</option>

                </select>

              </div>

              {/* AUDIENCE */}

              <div className="newnotifi1">

                <label>Select Audience</label>

                <select
                  name="audience"
                  value={formData.audience}
                  onChange={handleChange}
                  disabled={isView}
                >

                  <option value="">Choose Audience</option>

                  <option value="All Interns">
                    All Interns
                  </option>

                  <option value="By Batch">
                    By Batch
                  </option>

                  <option value="By Stack">
                    By Stack
                  </option>

                  <option value="Individual Interns">
                    Individual Interns
                  </option>

                </select>

              </div>

            </div>

            {/* =====================================
                BATCH / STACK / INTERN SELECTION
            ===================================== */}

            {formData.audience !== "" &&
              formData.audience !== "All Interns" && (

              <div className="audienceinput">

                <label>

                  {formData.audience === "By Batch"
                    ? "Choose Batch"
                    : formData.audience === "By Stack"
                    ? "Choose Stack"
                    : "Search Interns"}

                </label>

                <select
                  className="audienceSelect"
                  value=""
                  onChange={handleAddAudience}
                  disabled={isView}
                >

                  <option value="">

                    {formData.audience === "By Batch"
                      ? "Select Batch"
                      : formData.audience === "By Stack"
                      ? "Select Stack"
                      : "Select Intern"}

                  </option>

                  {getAudienceOptions().map((option) => (

                    <option
                      key={option}
                      value={option}
                      disabled={formData.selectedAudience.includes(option)}
                    >
                      {option}
                    </option>

                  ))}

                </select>

                {/* SELECTED AUDIENCE CHIPS */}

                {formData.selectedAudience.length > 0 && (

                  <div className="addedAudience">

                    <h3>

                      Added {formData.audience === "By Batch"
                        ? "Batch's"
                        : formData.audience === "By Stack"
                        ? "Stack's"
                        : "Interns"}

                    </h3>

                    <div className="audiencechips">

                      {formData.selectedAudience.map((item) => (

                        <div
                          className="audiencechip"
                          key={item}
                        >

                          <span>{item}</span>

                          {!isView && (

                            <button
                              type="button"
                              onClick={() => handleRemoveAudience(item)}
                            >
                              <FiX />
                            </button>

                          )}

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>

            )}

            {/* =====================================
                PUSH NOTIFICATION
            ===================================== */}

            <div className="pushnotification">

              <input
                type="checkbox"
                id="pushNotification"
                name="pushNotification"
                checked={formData.pushNotification}
                onChange={handleChange}
                disabled={isView}
              />

              <label htmlFor="pushNotification">
                Push Notification
              </label>

            </div>

            {/* =====================================
                FORM BUTTONS
            ===================================== */}

            <div className="newnotificationbutton">

              <button
                className="notificationcancel"
                onClick={handleBack}
              >
                Cancel
              </button>

              {isView ? (

                <button
                  className="notificationpublish"
                  onClick={handleViewEdit}
                >
                  Edit
                </button>

              ) : (

                <button
                  className="notificationpublish"
                  onClick={handlePublish}
                >

                  {selectedIndex !== null
                    ? "Update"
                    : "Publish"}

                </button>

              )}

            </div>

          </div>

        )}

      </div>

    </div>

  );

};
