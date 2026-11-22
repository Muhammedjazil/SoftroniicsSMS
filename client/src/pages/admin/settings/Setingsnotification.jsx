
import { useEffect, useMemo, useState } from "react";

import {
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

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Settingsnotification.css";

const initialForm = {
  title: "",
  content: "",
  type: "",
  branch: [],
  audience: "",
  selectedAudience: [],
  pushNotification: true
};

const notificationTypes = [
  "Task Notification",
  "Weekly Schedule",
  "Common Notification",
  "Announcement",
  "Reminder"
];

const audienceTypes = [
  "All interns",
  "By batches",
  "By Courses",
  "By Category",
  "Individual interns"
];

// Supports populated documents and plain ObjectId values.
const getId = (item) => {
  if (!item) return "";
  return typeof item === "object" ? item._id || "" : item;
};

const getLabel = (item, fields = []) => {
  if (!item) return "";

  if (typeof item !== "object") return String(item);

  for (const field of fields) {
    if (item[field]) return item[field];
  }

  return item._id || "";
};

export const Notification = () => {
  const {
    takenotifications,
    takenotificationbyid,
    getnotificationdropdowns,
    createnotification,
    updatenotification,
    removenotification
  } = AdminService();

  // =====================================
  // STATES
  // =====================================

  const [isactive, setIsactive] = useState("Notification");

  const [notifications, setNotifications] = useState([]);

  const [formData, setFormData] = useState(initialForm);

  const [selectedId, setSelectedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [dropdowns, setDropdowns] = useState({
    branches: [],
    batches: [],
    categories: [],
    courses: [],
    interns: []
  });

  const [loading, setLoading] = useState(false);

  const itemsPerPage = 5;
  const isView = isactive === "show";

  // =====================================
  // LOAD NOTIFICATIONS
  // =====================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await takenotifications();

      setNotifications(response.notifications || []);
    } catch (error) {
      console.error(
        "Fetch Notifications Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // LOAD DROPDOWNS
  // =====================================

  const loadDropdowns = async () => {
    try {
      const response = await getnotificationdropdowns();

      setDropdowns({
        branches: response.branches || [],
        batches: response.batches || [],
        categories: response.categories || [],
        courses: response.courses || [],
        interns: response.interns || []
      });
    } catch (error) {
      console.error(
        "Notification Dropdown Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to load notification dropdown data"
      );
    }
  };

  useEffect(() => {
    loadNotifications();
    loadDropdowns();
  }, []);

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
  // GET AUDIENCE OPTIONS
  // =====================================

  const getAudienceOptions = () => {
    if (formData.audience === "By batches") {
      return dropdowns.batches;
    }

    if (formData.audience === "By Courses") {
      return dropdowns.courses;
    }

    if (formData.audience === "By Category") {
      return dropdowns.categories;
    }

    if (formData.audience === "Individual interns") {
      return dropdowns.interns;
    }

    return [];
  };

  const getAudienceId = (item) => getId(item);

  const getAudienceLabel = (item) => {
    if (formData.audience === "By batches") {
      return getLabel(item, ["batchName"]);
    }

    if (formData.audience === "By Courses") {
      return getLabel(item, ["courseName"]);
    }

    if (formData.audience === "By Category") {
      return getLabel(item, ["categoryName"]);
    }

    if (formData.audience === "Individual interns") {
      return getLabel(item, ["fullName", "email"]);
    }

    return "";
  };

  // =====================================
  // ADD AUDIENCE
  // =====================================

  const handleAddAudience = (e) => {
    const id = e.target.value;

    if (!id) return;

    setFormData((prev) => {
      if (prev.selectedAudience.includes(id)) {
        return prev;
      }

      return {
        ...prev,
        selectedAudience: [...prev.selectedAudience, id]
      };
    });

    e.target.value = "";
  };

  // =====================================
  // REMOVE AUDIENCE
  // =====================================

  const handleRemoveAudience = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedAudience: prev.selectedAudience.filter(
        (item) => item !== id
      )
    }));
  };

  // =====================================
  // ADD BRANCH
  // =====================================

  const handleAddBranch = (e) => {
    const id = e.target.value;

    if (!id) return;

    setFormData((prev) => {
      if (prev.branch.includes(id)) return prev;

      return {
        ...prev,
        branch: [...prev.branch, id]
      };
    });

    e.target.value = "";
  };

  // =====================================
  // REMOVE BRANCH
  // =====================================

  const handleRemoveBranch = (id) => {
    setFormData((prev) => ({
      ...prev,
      branch: prev.branch.filter((item) => item !== id)
    }));
  };

  // =====================================
  // GET SELECTED AUDIENCE TEXT
  // =====================================

  const getSelectedAudience = (item) => {
    if (item.audience === "All interns") {
      return "All interns";
    }

    let selected = [];

    if (item.audience === "By batches") {
      selected = item.batches || [];
      return selected
        .map((value) => getLabel(value, ["batchName"]))
        .join(", ");
    }

    if (item.audience === "By Courses") {
      selected = item.courses || [];
      return selected
        .map((value) => getLabel(value, ["courseName"]))
        .join(", ");
    }

    if (item.audience === "By Category") {
      selected = item.categories || [];
      return selected
        .map((value) => getLabel(value, ["categoryName"]))
        .join(", ");
    }

    if (item.audience === "Individual interns") {
      selected = item.individualInterns || [];
      return selected
        .map((value) => getLabel(value, ["fullName", "email"]))
        .join(", ");
    }

    return "-";
  };

  const getBranchText = (item) => {
    return (item.branch || [])
      .map((branch) => getLabel(branch, ["branchName"]))
      .join(", ");
  };

  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {
    setFormData({ ...initialForm });
    setSelectedId(null);
  };

  // =====================================
  // OPEN NEW NOTIFICATION
  // =====================================

  const handleNew = () => {
    resetForm();
    setIsactive("Newnotification");
  };

  // =====================================
  // CONVERT FORM TO API PAYLOAD
  // =====================================

  const getPayload = () => {
    const payload = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      type: formData.type,
      branch: formData.branch,
      audience: formData.audience,
      batches: [],
      courses: [],
      categories: [],
      individualInterns: [],
      pushNotification: formData.pushNotification
    };

    if (formData.audience === "By batches") {
      payload.batches = formData.selectedAudience;
    }

    if (formData.audience === "By Courses") {
      payload.courses = formData.selectedAudience;
    }

    if (formData.audience === "By Category") {
      payload.categories = formData.selectedAudience;
    }

    if (formData.audience === "Individual interns") {
      payload.individualInterns = formData.selectedAudience;
    }

    return payload;
  };

  // =====================================
  // PUBLISH / UPDATE
  // =====================================

  const handlePublish = async () => {
    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.type ||
      formData.branch.length === 0 ||
      !formData.audience
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (
      formData.audience !== "All interns" &&
      formData.selectedAudience.length === 0
    ) {
      alert("Please select at least one audience");
      return;
    }

    try {
      setLoading(true);

      const payload = getPayload();

      if (selectedId) {
        await updatenotification(selectedId, payload);
        alert("Notification updated successfully!");
      } else {
        await createnotification(payload);
        alert("Notification published successfully!");
      }

      await loadNotifications();

      resetForm();
      setIsactive("Notification");
    } catch (error) {
      console.error(
        "Save Notification Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to save notification"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // CONVERT API RECORD TO FORM
  // =====================================

  const mapNotificationToForm = (item) => {
    let selectedAudience = [];

    if (item.audience === "By batches") {
      selectedAudience = (item.batches || []).map(getId);
    } else if (item.audience === "By Courses") {
      selectedAudience = (item.courses || []).map(getId);
    } else if (item.audience === "By Category") {
      selectedAudience = (item.categories || []).map(getId);
    } else if (item.audience === "Individual interns") {
      selectedAudience = (item.individualInterns || []).map(getId);
    }

    return {
      title: item.title || "",
      content: item.content || "",
      type: item.type || "",
      branch: (item.branch || []).map(getId),
      audience: item.audience || "",
      selectedAudience,
      pushNotification: Boolean(item.pushNotification)
    };
  };

  // =====================================
  // VIEW NOTIFICATION
  // =====================================

  const handleView = async (id) => {
    try {
      setLoading(true);

      const response = await takenotificationbyid(id);
      const item = response.notification;

      setFormData(mapNotificationToForm(item));
      setSelectedId(item._id);
      setIsactive("show");
    } catch (error) {
      console.error(
        "View Notification Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to open notification"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // EDIT NOTIFICATION
  // =====================================

  const handleEdit = async (id) => {
    try {
      setLoading(true);

      const response = await takenotificationbyid(id);
      const item = response.notification;

      setFormData(mapNotificationToForm(item));
      setSelectedId(item._id);
      setIsactive("Newnotification");
    } catch (error) {
      console.error(
        "Edit Notification Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to edit notification"
      );
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this notification?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await removenotification(id);

      setNotifications((prev) =>
        prev.filter((item) => item._id !== id)
      );

      if (selectedId === id) {
        resetForm();
        setIsactive("Notification");
      }

      alert("Notification permanently deleted.");
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete notification"
      );
    } finally {
      setLoading(false);
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
      getBranchText(item),
      item.audience,
      getSelectedAudience(item),
      item.pushNotification ? "Yes" : "No"
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "notifications.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

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

      <div className="notificationherosection">

        {/* TOP TABS */}

        <div className="notificationtopbar">

          <div className="notfibutton">

            <button
              className={isactive === "Notification" ? "active" : ""}
              onClick={() => {
                resetForm();
                setIsactive("Notification");
              }}
            >
              Notifications
            </button>

            <button
              className={isactive !== "Notification" ? "active" : ""}
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

        {/* NOTIFICATION TABLE */}

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

                  {loading ? (
                    <tr>
                      <td colSpan="7" className="notificationempty">
                        Loading notifications...
                      </td>
                    </tr>
                  ) : currentNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="notificationempty">
                        <FiFileText />
                        <p>No notifications available</p>
                      </td>
                    </tr>
                  ) : (
                    currentNotifications.map((item, index) => {
                      const actualIndex = startIndex + index;

                      return (
                        <tr key={item._id}>

                          <td>{actualIndex + 1}</td>

                          <td>{item.title}</td>

                          <td>{item.type}</td>

                          <td>{getBranchText(item)}</td>

                          <td>{item.audience}</td>

                          <td className="selectedaudience">
                            {getSelectedAudience(item) || "-"}
                          </td>

                          <td className="notificationactions">

                            <button
                              className="viewaction"
                              title="View"
                              onClick={() => handleView(item._id)}
                            >
                              <FiEye />
                            </button>

                            <button
                              className="editaction"
                              title="Edit"
                              onClick={() => handleEdit(item._id)}
                            >
                              <FiEdit />
                            </button>

                            <button
                              className="deleteaction"
                              title="Delete"
                              onClick={() => handleDelete(item._id)}
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

        {/* NEW / EDIT / VIEW FORM */}

        {(isactive === "Newnotification" || isactive === "show") && (

          <div className="Newnotification">

            {/* FORM HEADER */}

            <div className="Newnotificationsect1">

              <div className="Newnotificationsect2">
                <h2>
                  {isView
                    ? "Notification Details"
                    : selectedId
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

                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}

                </select>

              </div>

              {/* BRANCH */}

              <div className="newnotifi1">

                <label>Branch</label>

                <select
                  value=""
                  onChange={handleAddBranch}
                  disabled={isView}
                >
                  <option value="">Choose Branch</option>

                  {dropdowns.branches.map((branch) => (
                    <option
                      key={branch._id}
                      value={branch._id}
                      disabled={formData.branch.includes(branch._id)}
                    >
                      {branch.branchName}
                    </option>
                  ))}

                </select>

                {formData.branch.length > 0 && (
                  <div className="addedAudience">

                    <h3>Selected Branches</h3>

                    <div className="audiencechips">

                      {formData.branch.map((id) => {
                        const branch = dropdowns.branches.find(
                          (item) => item._id === id
                        );

                        return (
                          <div className="audiencechip" key={id}>

                            <span>
                              {branch?.branchName || id}
                            </span>

                            {!isView && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBranch(id)}
                              >
                                <FiX />
                              </button>
                            )}

                          </div>
                        );
                      })}

                    </div>

                  </div>
                )}

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

                  {audienceTypes.map((audience) => (
                    <option key={audience} value={audience}>
                      {audience}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            {/* AUDIENCE SELECTION */}

            {formData.audience !== "" &&
              formData.audience !== "All interns" && (

              <div className="audienceinput">

                <label>
                  {formData.audience === "By batches"
                    ? "Choose Batches"
                    : formData.audience === "By Courses"
                    ? "Choose Courses"
                    : formData.audience === "By Category"
                    ? "Choose Categories"
                    : "Select Interns"}
                </label>

                <select
                  className="audienceSelect"
                  value=""
                  onChange={handleAddAudience}
                  disabled={isView}
                >

                  <option value="">
                    Select {formData.audience}
                  </option>

                  {getAudienceOptions().map((option) => {
                    const id = getAudienceId(option);

                    return (
                      <option
                        key={id}
                        value={id}
                        disabled={formData.selectedAudience.includes(id)}
                      >
                        {getAudienceLabel(option)}
                      </option>
                    );
                  })}

                </select>

                {/* SELECTED AUDIENCE CHIPS */}

                {formData.selectedAudience.length > 0 && (

                  <div className="addedAudience">

                    <h3>Selected Audience</h3>

                    <div className="audiencechips">

                      {formData.selectedAudience.map((id) => {

                        const option = getAudienceOptions().find(
                          (item) => getAudienceId(item) === id
                        );

                        const label = option
                          ? getAudienceLabel(option)
                          : id;

                        return (
                          <div className="audiencechip" key={id}>

                            <span>{label}</span>

                            {!isView && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAudience(id)}
                              >
                                <FiX />
                              </button>
                            )}

                          </div>
                        );
                      })}

                    </div>

                  </div>

                )}

              </div>
            )}

            {/* PUSH NOTIFICATION */}

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

            {/* FORM BUTTONS */}

            <div className="newnotificationbutton">

              <button
                className="notificationcancel"
                onClick={handleBack}
                disabled={loading}
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
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : selectedId
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
