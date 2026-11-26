import { useState, useEffect } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";
import usePermission from "../../../hooks/usePermission";
import Loader from "../../../components/common/Loader";
import { useToast } from "../../../components/common/Toast";
import {
  FiUser,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiSearch,
  FiArrowLeft,
} from "react-icons/fi";

import "./Rolemanagement.css";

// =====================================
// PERMISSION GROUPS (MATCHES roleModel.js)
// =====================================

const privilegeGroups = [
  {
    id: "studentManagement",
    title: "Student Management",
    items: [
      { label: "Add Student", key: "addStudent" },
      { label: "View Student", key: "viewStudent" },
      { label: "Edit Student", key: "editStudent" },
      { label: "Delete Student", key: "deleteStudent" },
    ],
  },
  {
    id: "staffManagement",
    title: "Staff Management",
    items: [
      { label: "Add Staff", key: "addStaff" },
      { label: "View Staff", key: "viewStaff" },
      { label: "Edit Staff", key: "editStaff" },
      { label: "Delete Staff", key: "deleteStaff" },
    ],
  },
  {
    id: "mentorManagement",
    title: "Mentor Management",
    items: [
      { label: "Add Mentor", key: "addMentor" },
      { label: "View Mentor", key: "viewMentor" },
      { label: "Edit Mentor", key: "editMentor" },
      { label: "Delete Mentor", key: "deleteMentor" },
    ],
  },
  {
    id: "mentorCard",
    title: "Mentor Card",
    items: [
      { label: "Add Mentor Card", key: "addMentorCard" },
      { label: "View Mentor Card", key: "viewMentorCard" },
      { label: "Edit Mentor Card", key: "editMentorCard" },
      { label: "Delete Mentor Card", key: "deleteMentorCard" },
    ],
  },
  {
    id: "courseManagement",
    title: "Course Management",
    items: [
      { label: "Add Course", key: "addCourse" },
      { label: "View Course", key: "viewCourse" },
      { label: "Edit Course", key: "editCourse" },
      { label: "Delete Course", key: "deleteCourse" },
    ],
  },
  {
    id: "categoryManagement",
    title: "Category Management",
    items: [
      { label: "Add Category", key: "addCategory" },
      { label: "View Category", key: "viewCategory" },
      { label: "Edit Category", key: "editCategory" },
      { label: "Delete Category", key: "deleteCategory" },
    ],
  },
  {
    id: "moduleManagement",
    title: "Module Management",
    items: [
      { label: "Add Module", key: "addModule" },
      { label: "View Module", key: "viewModule" },
      { label: "Edit Module", key: "editModule" },
      { label: "Delete Module", key: "deleteModule" },
    ],
  },
  {
    id: "topicManagement",
    title: "Topic Management",
    items: [
      { label: "Add Topic", key: "addTopic" },
      { label: "View Topic", key: "viewTopic" },
      { label: "Edit Topic", key: "editTopic" },
      { label: "Delete Topic", key: "deleteTopic" },
    ],
  },
  {
    id: "taskManagement",
    title: "Task Management",
    items: [
      { label: "Add Task", key: "addTask" },
      { label: "View Task", key: "viewTask" },
      { label: "Edit Task", key: "editTask" },
      { label: "Delete Task", key: "deleteTask" },
      { label: "Download Task", key: "downloadTask" },
    ],
  },
  {
    id: "materialManagement",
    title: "Material Management",
    items: [
      { label: "Add Material", key: "addMaterial" },
      { label: "View Material", key: "viewMaterial" },
      { label: "Edit Material", key: "editMaterial" },
      { label: "Delete Material", key: "deleteMaterial" },
    ],
  },
  {
    id: "weeklySchedule",
    title: "Weekly Schedule",
    items: [
      { label: "Add Schedule", key: "addSchedule" },
      { label: "View Schedule", key: "viewSchedule" },
      { label: "Edit Schedule", key: "editSchedule" },
      { label: "Delete Schedule", key: "deleteSchedule" },
    ],
  },
  {
    id: "scheduleTiming",
    title: "Schedule Timing",
    items: [
      { label: "Add Timing", key: "addTiming" },
      { label: "View Timing", key: "viewTiming" },
      { label: "Edit Timing", key: "editTiming" },
      { label: "Delete Timing", key: "deleteTiming" },
    ],
  },
  {
    id: "batchManagement",
    title: "Batch Management",
    items: [
      { label: "Add Batch", key: "addBatch" },
      { label: "View Batch", key: "viewBatch" },
      { label: "Edit Batch", key: "editBatch" },
      { label: "Delete Batch", key: "deleteBatch" },
    ],
  },
  {
    id: "attendanceManagement",
    title: "Student Attendance",
    items: [
      { label: "Add Attendance", key: "addAttendance" },
      { label: "View Attendance", key: "viewAttendance" },
      { label: "Edit Attendance", key: "editAttendance" },
      { label: "Delete Attendance", key: "deleteAttendance" },
    ],
  },
  {
    id: "leaveManagement",
    title: "Leave Request",
    items: [
      { label: "Add Leave", key: "addLeave" },
      { label: "View Leave", key: "viewLeave" },
      { label: "Edit Leave", key: "editLeave" },
      { label: "Delete Leave", key: "deleteLeave" },
    ],
  },
  {
    id: "branchManagement",
    title: "Branch Management",
    items: [
      { label: "Add Branch", key: "addBranch" },
      { label: "View Branch", key: "viewBranch" },
      { label: "Edit Branch", key: "editBranch" },
      { label: "Delete Branch", key: "deleteBranch" },
    ],
  },
  {
    id: "notificationManagement",
    title: "Notification Management",
    items: [
      { label: "Add Notification", key: "addNotification" },
      { label: "View Notification", key: "viewNotification" },
      { label: "Edit Notification", key: "editNotification" },
      { label: "Delete Notification", key: "deleteNotification" },
    ],
  },
  {
    id: "staticPage",
    title: "Static Page",
    items: [
      { label: "Add Page", key: "addPage" },
      { label: "View Page", key: "viewPage" },
      { label: "Edit Page", key: "editPage" },
      { label: "Delete Page", key: "deletePage" },
    ],
  },
  {
    id: "roleManagement",
    title: "Role Management",
    items: [
      { label: "Add Role", key: "addRole" },
      { label: "View Role", key: "viewRole" },
      { label: "Edit Role", key: "editRole" },
      { label: "Delete Role", key: "deleteRole" },
    ],
  },
];

// =====================================
// CONVERT NESTED TO FLAT PERMISSIONS
// =====================================

const flattenPermissions = (savedPermissions = {}) => {
  const formatted = {};

  privilegeGroups.forEach((group) => {
    group.items.forEach((item) => {
      formatted[item.key] = !!savedPermissions?.[group.id]?.[item.key];
    });
  });

  return formatted;
};

// =====================================
// CONVERT FLAT TO NESTED PERMISSIONS
// =====================================

const formatPermissions = (permissions = {}) => {
  const formatted = {};

  privilegeGroups.forEach((group) => {
    formatted[group.id] = {};

    group.items.forEach((item) => {
      formatted[group.id][item.key] = !!permissions[item.key];
    });
  });

  return formatted;
};

// =====================================
// ROLE MANAGEMENT COMPONENT
// =====================================

export const Rolemanagement = () => {
  const { showToast, ToastContainer } = useToast();

  const {
    newrolecreate,
    takeroles,
    Updaterole,
    roleremove,
    changestatus,
  } = AdminService();

  const { user, can } = usePermission();
  const canAddRole = can("roleManagement", "addRole");
  const canEditRole = can("roleManagement", "editRole");
  const canDeleteRole = can("roleManagement", "deleteRole");

  // =====================================
  // STATES
  // =====================================

  const [activeTab, setActiveTab] = useState("Roles");
  const [roles, setRoles] = useState([]);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const [permissions, setPermissions] = useState({});
  const [enabledGroups, setEnabledGroups] = useState({});

  const [selectedRole, setSelectedRole] = useState(null);
  const [editingRoleId, setEditingRoleId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Roles");
  const [loading, setLoading] = useState(false);

  // =====================================
  // PAGINATION STATE
  // =====================================

  const [currentPage, setCurrentPage] = useState(1);
  const rolesPerPage = 6;

  // =====================================
  // FETCH ALL ROLES
  // =====================================

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await takeroles();
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.log("Fetch roles error:", error.response?.data || error);
      showToast(error.response?.data?.message || "Unable to fetch roles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // =====================================
  // RESET FORM
  // =====================================

  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setPermissions({});
    setEnabledGroups({});
    setEditingRoleId(null);
  };

  // =====================================
  // OPEN NEW ROLE
  // =====================================

  const handleNewRole = () => {
    if (!canAddRole) return;
    resetForm();
    setSelectedRole(null);
    setActiveTab("New Role");
  };

  // =====================================
  // BACK TO ROLES
  // =====================================

  const handleCancel = () => {
    resetForm();
    setSelectedRole(null);
    setActiveTab("Roles");
  };

  // =====================================
  // VIEW ROLE
  // =====================================

  const handleView = (value) => {
    setSelectedRole(value);
    setActiveTab("View Role");
  };

  // =====================================
  // EDIT ROLE
  // =====================================

  const handleEdit = (value) => {
    if (!canEditRole) return;

    setSelectedRole(value);
    setEditingRoleId(value._id);

    setRoleName(value.role || "");
    setDescription(value.description || "");

    const savedPermissions = flattenPermissions(value.permissions);
    setPermissions(savedPermissions);

    const groupStatus = {};
    privilegeGroups.forEach((group) => {
      groupStatus[group.id] = group.items.every(
        (item) => !!savedPermissions[item.key]
      );
    });

    setEnabledGroups(groupStatus);
    setActiveTab("New Role");
  };

  // =====================================
  // INDIVIDUAL PERMISSION
  // =====================================

  const handlePermission = (permission) => {
    setPermissions((prev) => {
      const updated = {
        ...prev,
        [permission]: !prev[permission],
      };

      const groupStatus = {};
      privilegeGroups.forEach((group) => {
        groupStatus[group.id] = group.items.every(
          (item) => !!updated[item.key]
        );
      });

      setEnabledGroups(groupStatus);
      return updated;
    });
  };

  // =====================================
  // GROUP SWITCH
  // =====================================

  const handleGroupToggle = (groupId) => {
    const groupData = privilegeGroups.find((item) => item.id === groupId);
    if (!groupData) return;

    const isEnabled = !enabledGroups[groupId];

    setEnabledGroups((prev) => ({
      ...prev,
      [groupId]: isEnabled,
    }));

    setPermissions((prev) => {
      const updated = { ...prev };
      groupData.items.forEach((item) => {
        updated[item.key] = isEnabled;
      });
      return updated;
    });
  };

  // =====================================
  // CREATE / UPDATE ROLE
  // =====================================

  const handleCreateRole = async () => {
    if (!roleName.trim() || !description.trim()) {
      showToast("Please enter role name and description", "warning");
      return;
    }

    if (editingRoleId !== null && !canEditRole) {
      showToast("You do not have permission to edit roles.", "error");
      return;
    }

    if (editingRoleId === null && !canAddRole) {
      showToast("You do not have permission to create roles.", "error");
      return;
    }

    try {
      setLoading(true);

      const roleData = {
        role: roleName.trim(),
        description: description.trim(),
        permissions: formatPermissions(permissions),
      };

      if (editingRoleId !== null) {
        await Updaterole(editingRoleId, roleData);
        showToast("Role updated successfully!", "success");
      } else {
        await newrolecreate(roleData);
        showToast("Role created successfully", "success");
      }

      await fetchRoles();
      handleCancel();
    } catch (error) {
      console.log("Create / Update role error:", error);
      showToast(error.response?.data?.message || "Failed to save role", "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.role?.toLowerCase().includes(search.toLowerCase()) ||
      role.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Roles" ||
      (statusFilter === "Active" && role.isActive === true) ||
      (statusFilter === "Inactive" && role.isActive === false);

    return matchesSearch && matchesStatus;
  });

  // =====================================
  // PAGINATION CALCULATIONS
  // =====================================

  const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
  const startIndex = (currentPage - 1) * rolesPerPage;
  const endIndex = startIndex + rolesPerPage;
  const currentRoles = filteredRoles.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================
  // EXPORT CSV
  // =====================================

  const handleExport = () => {
    const headers = ["Role", "Description", "Status", "Created At"];

    const rows = filteredRoles.map((role) => [
      role.role,
      role.description,
      role.isActive ? "Active" : "Inactive",
      role.createdAt ? new Date(role.createdAt).toLocaleDateString() : "-",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roles.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // =====================================
  // DELETE ROLE
  // =====================================

  const handledelete = async (id) => {
    if (!canDeleteRole) return;
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await roleremove(id);
      showToast("Role removed successfully!", "success");
      await fetchRoles();
    } catch (error) {
      console.log("Delete role error:", error);
      showToast(error.response?.data?.message || "Role not deleted!", "error");
    }
  };

  // =====================================
  // CHANGE ROLE STATUS
  // =====================================

  const handlestatus = async (id) => {
    if (!canEditRole) return;

    try {
      await changestatus(id);
      showToast("Role status updated", "success");
      await fetchRoles();
    } catch (error) {
      console.log("Status update error:", error);
      showToast(error.response?.data?.message || "Status not updated!", "error");
    }
  };

  // =====================================
  // JSX
  // =====================================

  return (
    <div className="syl-mgmt-container Rolemanagement">
      <ToastContainer />

      {/* Outer Toolbar */}
      <div className="syl-mgmt-toolbar">
        <div className="syl-mgmt-tab-group">
          <button
            type="button"
            className={`syl-mgmt-tab-btn ${activeTab === "Roles" ? "syl-mgmt-tab-btn--active" : ""}`}
            onClick={handleCancel}
          >
            Roles List
          </button>

          {(canAddRole || editingRoleId !== null) && (
            <button
              type="button"
              className={`syl-mgmt-tab-btn ${activeTab === "New Role" ? "syl-mgmt-tab-btn--active" : ""}`}
              onClick={handleNewRole}
            >
              {editingRoleId !== null ? "Edit Role" : "New Role"}
            </button>
          )}
        </div>

        {activeTab === "Roles" && (
          <button
            type="button"
            className="syl-mgmt-export-btn"
            onClick={handleExport}
          >
            <FiDownload className="syl-mgmt-export-icon" />
            <span>Export</span>
          </button>
        )}
      </div>

      {/* Main White Card Panel */}
      <main className="syl-mgmt-panel">
        {/* =====================================
              ROLES TABLE
        ===================================== */}
        {activeTab === "Roles" && (
          <>
            {/* Filter Bar */}
            <div className="syl-mgmt-filter-bar">
              <div className="syl-mgmt-search-wrapper">
                <FiSearch className="syl-mgmt-search-icon" />
                <input
                  type="text"
                  className="syl-mgmt-search-input"
                  placeholder="Search Roles"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="syl-mgmt-filter-select-wrapper">
                <select
                  className="syl-mgmt-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All Roles">All Roles</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <FiChevronDown className="syl-mgmt-select-arrow" />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <Loader message="Loading roles..." minHeight="320px" />
            ) : filteredRoles.length === 0 ? (
              <div className="syl-mgmt-content-area">
                <p className="syl-mgmt-empty-message">No Roles Found</p>
              </div>
            ) : (
              <div className="syl-mgmt-table-wrapper">
                <div
                  className="syl-mgmt-table-header-row"
                  style={{ gridTemplateColumns: "50px 2fr 2.5fr 1fr 1.2fr 1.3fr" }}
                >
                  <div className="syl-mgmt-th">#</div>
                  <div className="syl-mgmt-th">ROLE NAME</div>
                  <div className="syl-mgmt-th">DESCRIPTION</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">STATUS</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">CREATED</div>
                  <div className="syl-mgmt-th syl-mgmt-th-center">ACTIONS</div>
                </div>

                <div className="syl-mgmt-table-body">
                  {currentRoles.map((value, index) => {
                    const initial = (value.role || "R").charAt(0).toUpperCase();

                    return (
                      <div
                        key={value._id}
                        className="syl-mgmt-table-row"
                        style={{ gridTemplateColumns: "50px 2fr 2.5fr 1fr 1.2fr 1.3fr" }}
                      >
                        <div className="syl-mgmt-td">{startIndex + index + 1}</div>

                        <div className="syl-mgmt-td">
                          <div className="syl-mgmt-module-cell">
                            <span className="syl-mgmt-module-avatar">{initial}</span>
                            <span className="syl-mgmt-module-name-text">{value.role}</span>
                          </div>
                        </div>

                        <div className="syl-mgmt-td" style={{ color: "#4b5563" }}>
                          {value.description || "—"}
                        </div>

                        <div className="syl-mgmt-td syl-mgmt-td-center">
                          <button
                            type="button"
                            disabled={!canEditRole}
                            style={{
                              border: "none",
                              padding: 0,
                              background: "none",
                              cursor: canEditRole ? "pointer" : "default",
                            }}
                            onClick={() => handlestatus(value._id)}
                          >
                            <span
                              className="syl-mgmt-topic-badge"
                              style={
                                value.isActive
                                  ? { backgroundColor: "#ecfdf5", color: "#10b981" }
                                  : { backgroundColor: "#fef2f2", color: "#dc2626" }
                              }
                            >
                              {value.isActive ? "Active" : "Inactive"}
                            </span>
                          </button>
                        </div>

                        <div className="syl-mgmt-td syl-mgmt-td-center">
                          <span className="syl-mgmt-date-text">
                            {value.createdAt ? new Date(value.createdAt).toLocaleDateString() : "-"}
                          </span>
                        </div>

                        <div className="syl-mgmt-td syl-mgmt-col-actions">
                          <button
                            type="button"
                            className="syl-mgmt-text-action syl-mgmt-text-action--view"
                            onClick={() => handleView(value)}
                          >
                            View
                          </button>

                          {canEditRole && (
                            <button
                              type="button"
                              className="syl-mgmt-text-action syl-mgmt-text-action--edit"
                              onClick={() => handleEdit(value)}
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteRole && (
                            <button
                              type="button"
                              className="syl-mgmt-text-action syl-mgmt-text-action--delete"
                              onClick={() => handledelete(value._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="syl-mgmt-pagination-bar">
              <span className="syl-mgmt-pagination-text">
                {filteredRoles.length === 0
                  ? "0 of 0"
                  : `${currentPage} of ${Math.max(totalPages, 1)}`}
              </span>

              <div className="syl-mgmt-pagination-controls">
                <button
                  type="button"
                  className="syl-mgmt-page-btn"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                  style={currentPage === 1 ? {} : { cursor: "pointer", color: "#374151", backgroundColor: "#fff" }}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="syl-mgmt-page-btn"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={totalPages === 0 || currentPage >= totalPages}
                  style={
                    totalPages === 0 || currentPage >= totalPages
                      ? {}
                      : { cursor: "pointer", color: "#374151", backgroundColor: "#fff" }
                  }
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        {/* =====================================
              VIEW ROLE SECTION
        ===================================== */}

        {activeTab === "View Role" && selectedRole && (
          <div className="Rolemanagement-newtask">
            <div className="Rolemanagement-create-heading">
              <h3>View Role</h3>
              <p>View role details and assigned permissions</p>
            </div>

            <div className="Rolemanagement-newtask-details">
              <div className="Rolemanagement-newtask-field">
                <label>Role</label>
                <input
                  type="text"
                  value={selectedRole.role || ""}
                  readOnly
                />
              </div>

              <div className="Rolemanagement-newtask-field">
                <label>Description</label>
                <input
                  type="text"
                  value={selectedRole.description || ""}
                  readOnly
                />
              </div>
            </div>

            <div className="Rolemanagement-view-details">
              <div>
                <strong>Status:</strong>{" "}
                {selectedRole.isActive ? "Active" : "Inactive"}
              </div>

              <div>
                <strong>Created At:</strong>{" "}
                {selectedRole.createdAt
                  ? new Date(selectedRole.createdAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <h3 className="Rolemanagement-newtask-heading">All Permissions</h3>

            <div className="Rolemanagement-newtask-grid">
              {privilegeGroups.map((group) => (
                <div className="Rolemanagement-newtask-card" key={group.id}>
                  <div className="Rolemanagement-newtask-cardheader">
                    <h4>{group.title}</h4>
                  </div>

                  <div className="Rolemanagement-newtask-options">
                    {group.items.map((item) => (
                      <label
                        className="Rolemanagement-newtask-option"
                        key={item.key}
                      >
                        <input
                          type="checkbox"
                          checked={
                            !!selectedRole.permissions?.[group.id]?.[item.key]
                          }
                          readOnly
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="Rolemanagement-newtask-buttons">
              <button
                className="Rolemanagement-newtask-cancel"
                onClick={handleCancel}
              >
                Back
              </button>

              {canEditRole && (
                <button
                  className="Rolemanagement-newtask-create"
                  onClick={() => handleEdit(selectedRole)}
                >
                  Edit Role
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================
              CREATE / EDIT ROLE SECTION
        ===================================== */}

        {activeTab === "New Role" && (
          <div className="Rolemanagement-newtask">
            <div className="Rolemanagement-create-heading">
              <h3>
                {editingRoleId !== null ? "Edit Role" : "Create New Role"}
              </h3>
              <p>Set permissions for a specific role</p>
            </div>

            <div className="Rolemanagement-newtask-details">
              <div className="Rolemanagement-newtask-field">
                <label>
                  Role <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Role Name"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>

              <div className="Rolemanagement-newtask-field">
                <label>
                  Description <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <h3 className="Rolemanagement-newtask-heading">All Permissions</h3>

            <div className="Rolemanagement-newtask-grid">
              {privilegeGroups.map((group) => (
                <div className="Rolemanagement-newtask-card" key={group.id}>
                  <div className="Rolemanagement-newtask-cardheader">
                    <h4>{group.title}</h4>

                    <label className="Rolemanagement-newtask-switch">
                      <input
                        type="checkbox"
                        checked={!!enabledGroups[group.id]}
                        onChange={() => handleGroupToggle(group.id)}
                      />
                      <span className="Rolemanagement-newtask-slider"></span>
                    </label>
                  </div>

                  <div className="Rolemanagement-newtask-options">
                    {group.items.map((item) => (
                      <label
                        className="Rolemanagement-newtask-option"
                        key={item.key}
                      >
                        <input
                          type="checkbox"
                          checked={!!permissions[item.key]}
                          onChange={() => handlePermission(item.key)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="Rolemanagement-newtask-buttons">
              <button
                className="Rolemanagement-newtask-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                className="Rolemanagement-newtask-create"
                onClick={handleCreateRole}
                disabled={loading}
              >
                {loading
                  ? "Please Wait..."
                  : editingRoleId !== null
                  ? "Update Role"
                  : "Create Role"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};export default Rolemanagement;