
import { useState, useEffect } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";
import {
  FiUser,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiSearch
} from "react-icons/fi";

import "./Rolemanagement.css";
import axios from "axios";

// =====================================
// PERMISSION GROUPS
// =====================================

const privilegeGroups = [
  {
    id: "studentManagement",
    title: "Student Management",
    items: [
      { label: "Add Student", key: "addStudent" },
      { label: "View Student", key: "viewStudent" },
      { label: "Edit Student", key: "editStudent" },
      { label: "Delete Student", key: "deleteStudent" }
    ]
  },
  {
    id: "mentorManagement",
    title: "Mentor Management",
    items: [
      { label: "Add Mentor", key: "addMentor" },
      { label: "View Mentor", key: "viewMentor" },
      { label: "Edit Mentor", key: "editMentor" },
      { label: "Delete Mentor", key: "deleteMentor" }
    ]
  },
  {
    id: "mentorCard",
    title: "Mentor Card",
    items: [
      { label: "Add Mentor Card", key: "addMentorCard" },
      { label: "View Mentor Card", key: "viewMentorCard" },
      { label: "Edit Mentor Card", key: "editMentorCard" },
      { label: "Delete Mentor Card", key: "deleteMentorCard" }
    ]
  },
  {
    id: "courseManagement",
    title: "Course Management",
    items: [
      { label: "Add Course", key: "addCourse" },
      { label: "View Course", key: "viewCourse" },
      { label: "Edit Course", key: "editCourse" },
      { label: "Delete Course", key: "deleteCourse" }
    ]
  },
  {
    id: "categoryManagement",
    title: "Category Management",
    items: [
      { label: "Add Category", key: "addCategory" },
      { label: "View Category", key: "viewCategory" },
      { label: "Edit Category", key: "editCategory" },
      { label: "Delete Category", key: "deleteCategory" }
    ]
  },
  {
    id: "moduleManagement",
    title: "Module Management",
    items: [
      { label: "Add Module", key: "addModule" },
      { label: "View Module", key: "viewModule" },
      { label: "Edit Module", key: "editModule" },
      { label: "Delete Module", key: "deleteModule" }
    ]
  },
  {
    id: "topicManagement",
    title: "Topic Management",
    items: [
      { label: "Add Topic", key: "addTopic" },
      { label: "View Topic", key: "viewTopic" },
      { label: "Edit Topic", key: "editTopic" },
      { label: "Delete Topic", key: "deleteTopic" }
    ]
  },
  {
    id: "taskManagement",
    title: "Task Management",
    items: [
      { label: "Add Task", key: "addTask" },
      { label: "View Task", key: "viewTask" },
      { label: "Edit Task", key: "editTask" },
      { label: "Delete Task", key: "deleteTask" },
      { label: "Download Task", key: "downloadTask" }
    ]
  },
  {
    id: "materialManagement",
    title: "Material Management",
    items: [
      { label: "Add Material", key: "addMaterial" },
      { label: "View Material", key: "viewMaterial" },
      { label: "Edit Material", key: "editMaterial" },
      { label: "Delete Material", key: "deleteMaterial" }
    ]
  },
  {
    id: "weeklySchedule",
    title: "Weekly Schedule",
    items: [
      { label: "Add Schedule", key: "addSchedule" },
      { label: "View Schedule", key: "viewSchedule" },
      { label: "Edit Schedule", key: "editSchedule" },
      { label: "Delete Schedule", key: "deleteSchedule" }
    ]
  },
  {
    id: "scheduleTiming",
    title: "Schedule Timing",
    items: [
      { label: "Add Timing", key: "addTiming" },
      { label: "View Timing", key: "viewTiming" },
      { label: "Edit Timing", key: "editTiming" },
      { label: "Delete Timing", key: "deleteTiming" }
    ]
  },
  {
    id: "batchManagement",
    title: "Batch Management",
    items: [
      { label: "Add Batch", key: "addBatch" },
      { label: "View Batch", key: "viewBatch" },
      { label: "Edit Batch", key: "editBatch" },
      { label: "Delete Batch", key: "deleteBatch" }
    ]
  },
  {
    id: "staticPage",
    title: "Static Page",
    items: [
      { label: "Add Page", key: "addPage" },
      { label: "View Page", key: "viewPage" },
      { label: "Edit Page", key: "editPage" },
      { label: "Delete Page", key: "deletePage" }
    ]
  },
  {
    id: "roleManagement",
    title: "Role Management",
    items: [
      { label: "Add Role", key: "addRole" },
      { label: "View Role", key: "viewRole" },
      { label: "Edit Role", key: "editRole" },
      { label: "Delete Role", key: "deleteRole" }
    ]
  }
];

// =====================================
// CONVERT NESTED TO FLAT PERMISSIONS
// =====================================

const flattenPermissions = (savedPermissions = {}) => {
  const formatted = {};

  privilegeGroups.forEach((group) => {
    group.items.forEach((item) => {
      formatted[item.key] =
        !!savedPermissions?.[group.id]?.[item.key];
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
      formatted[group.id][item.key] =
        !!permissions[item.key];
    });
  });

  return formatted;
};

// =====================================
// ROLE MANAGEMENT COMPONENT
// =====================================

export const Rolemanagement = () => {

  const {
    newrolecreate,
    takeroles,
    Updaterole,
    roleremove,
    changestatus
  } = AdminService();

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

      console.log("Fetched roles:", response);

      setRoles(Array.isArray(response) ? response : []);

    } catch (error) {
      console.log(
        "Fetch roles error:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Unable to fetch roles"
      );

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

    setSelectedRole(value);
    setEditingRoleId(value._id);

    setRoleName(value.role || "");
    setDescription(value.description || "");

    const savedPermissions = flattenPermissions(
      value.permissions
    );

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
        [permission]: !prev[permission]
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

    const groupData = privilegeGroups.find(
      (item) => item.id === groupId
    );

    if (!groupData) return;

    const isEnabled = !enabledGroups[groupId];

    setEnabledGroups((prev) => ({
      ...prev,
      [groupId]: isEnabled
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
      alert("Please enter role name and description");
      return;
    }

    try {
      setLoading(true);

      const roleData = {
        role: roleName.trim(),
        description: description.trim(),
        permissions: formatPermissions(permissions)
      };

      if (editingRoleId !== null) {

        await Updaterole(editingRoleId, roleData);

        alert("Role updated successfully!");

      } else {

        await newrolecreate(roleData);

        alert("Role created successfully");

      }

      await fetchRoles();

      handleCancel();

    } catch (error) {

      console.log("Create / Update role error:", error);

      alert(
        error.response?.data?.message ||
        "Failed to save role"
      );

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

  const totalPages = Math.ceil(
    filteredRoles.length / rolesPerPage
  );

  const startIndex = (currentPage - 1) * rolesPerPage;

  const endIndex = startIndex + rolesPerPage;

  const currentRoles = filteredRoles.slice(
    startIndex,
    endIndex
  );

  // =====================================
  // RESET PAGE WHEN SEARCH / FILTER CHANGES
  // =====================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // =====================================
  // CORRECT PAGE AFTER DELETING ROLE
  // =====================================

  useEffect(() => {

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

  }, [currentPage, totalPages]);

  // =====================================
  // EXPORT CSV
  // =====================================

  const handleExport = () => {

    const headers = [
      "Role",
      "Description",
      "Status",
      "Created At"
    ];

    const rows = filteredRoles.map((role) => [
      role.role,
      role.description,
      role.isActive ? "Active" : "Inactive",
      role.createdAt
        ? new Date(role.createdAt).toLocaleDateString()
        : "-"
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
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

    try {

      await roleremove(id);

      alert("Role removed successfully!");

      await fetchRoles();

    } catch (error) {

      console.log("Delete role error:", error);

      alert(
        error.response?.data?.message ||
        "Role not deleted!"
      );

    }
  };

  // =====================================
  // CHANGE ROLE STATUS
  // =====================================

  const handlestatus = async (id) => {

    try {

      await changestatus(id);

      await fetchRoles();

    } catch (error) {

      console.log("Status update error:", error);

      alert(
        error.response?.data?.message ||
        "Status not updated!"
      );

    }
  };



  // =====================================
  // JSX
  // =====================================

  return (

    <div className="Rolemanagement">

      {/* HEADER */}

      <div className="Rolemanagement-role">

        <div className="Rolemanagement-name">

          <h2>Role Management</h2>

          <p>
            Role Management
            <FiChevronRight />

            {activeTab === "Roles"
              ? "Roles"
              : activeTab === "View Role"
                ? "View Role"
                : editingRoleId !== null
                  ? "Edit Role"
                  : "New Role"
            }

          </p>

        </div>

        {/* PROFILE */}

        <div className="Rolemanagement-profile">

          <div className="Rolemanagement-profile-icon">
            <FiUser />
          </div>

          <div className="Rolemanagement-profiledetails">
            <h5>Priyesh</h5>
            <p>Super Admin</p>
          </div>

        </div>

      </div>

      {/* MAIN CARD */}

      <div className="Rolemanagement-hero">

        {/* TOP TABS */}

        <div className="Rolemanagement-hero0">

          <div className="Rolemanagement-hero1">

            <button
              className={activeTab === "Roles" ? "active" : ""}
              onClick={handleCancel}
            >
              Roles
            </button>

            <button
              className={activeTab === "New Role" ? "active" : ""}
              onClick={handleNewRole}
            >
              New Role
            </button>

          </div>

        </div>

        {/* =====================================
              ROLES TABLE
        ===================================== */}

        {activeTab === "Roles" && (

          <>

            {/* TABLE CONTROLS */}

            <div className="Rolemanagement-table-controls">

              <div className="Rolemanagement-search">

                <FiSearch />

                <input
                  type="text"
                  placeholder="Search Roles"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

              </div>

              <select
                className="Rolemanagement-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >

                <option value="All Roles">All Roles</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>

              </select>

              <button
                className="Rolemanagement-export"
                onClick={handleExport}
              >
                <FiDownload />
                Export
              </button>

            </div>

            {/* TABLE */}

            <div className="Rolemanagement-hero-table">

              <table>

                <thead>

                  <tr>
                    <th>#</th>
                    <th>ROLE</th>
                    <th>DESCRIPTION</th>
                    <th>STATUS</th>
                    <th>CREATED AT</th>
                    <th>ACTIONS</th>
                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>
                      <td colSpan="6" className="Rolemanagement-empty">
                        Loading roles...
                      </td>
                    </tr>

                  ) : filteredRoles.length > 0 ? (

                    currentRoles.map((value, index) => (

                      <tr key={value._id}>

                        <td>
                          {startIndex + index + 1}
                        </td>

                        <td className="role-name">
                          {value.role}
                        </td>

                        <td>
                          {value.description}
                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              value.isActive
                                ? "Rolemanagement-status active-status"
                                : "Rolemanagement-status inactive-status"
                            }
                          >

                            <button
                              onClick={() => handlestatus(value._id)}
                            >
                              {value.isActive ? "Active" : "Inactive"}
                            </button>

                          </span>

                        </td>

                        {/* CREATED DATE */}

                        <td>
                          {value.createdAt
                            ? new Date(value.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="Rolemanagement-actions">

                            <button
                              type="button"
                              className="view-action"
                              onClick={() => handleView(value)}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className="edit-action"
                              onClick={() => handleEdit(value)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handledelete(value._id)}
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    <tr>
                      <td colSpan="6" className="Rolemanagement-empty">
                        No Roles Found
                      </td>
                    </tr>

                  )}

                </tbody>

              </table>

            </div>

            {/* PAGINATION */}

            <div className="Rolemanagement-pagination">

              <span>
                Showing{" "}
                {filteredRoles.length === 0 ? 0 : startIndex + 1}
                {" - "}
                {Math.min(endIndex, filteredRoles.length)}
                {" of "}
                {filteredRoles.length} Roles
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>

              <span>
                Page {currentPage} of {Math.max(totalPages, 1)}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={
                  totalPages === 0 || currentPage >= totalPages
                }
              >
                <FiChevronRight />
              </button>

            </div>

          </>

        )}

        {/* =====================================
              VIEW ROLE SECTION
        ===================================== */}

        {activeTab === "View Role" && selectedRole && (

          <div className="Rolemanagement-newtask">

            {/* VIEW HEADING */}

            <div className="Rolemanagement-create-heading">

              <h3>View Role</h3>

              <p>
                View role details and assigned permissions
              </p>

            </div>

            {/* ROLE DETAILS */}

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

            {/* STATUS AND CREATED DATE */}

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

            {/* ALL PERMISSIONS */}

            <h3 className="Rolemanagement-newtask-heading">
              All Permissions
            </h3>

            {/* READ ONLY PERMISSION GRID */}

            <div className="Rolemanagement-newtask-grid">

              {privilegeGroups.map((group) => (

                <div
                  className="Rolemanagement-newtask-card"
                  key={group.id}
                >

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

            {/* VIEW BUTTONS */}

            <div className="Rolemanagement-newtask-buttons">

              <button
                className="Rolemanagement-newtask-cancel"
                onClick={handleCancel}
              >
                Back
              </button>

              <button
                className="Rolemanagement-newtask-create"
                onClick={() => handleEdit(selectedRole)}
              >
                Edit Role
              </button>

            </div>

          </div>

        )}

        {/* =====================================
              CREATE / EDIT ROLE SECTION
        ===================================== */}

        {activeTab === "New Role" && (

          <div className="Rolemanagement-newtask">

            {/* FORM HEADING */}

            <div className="Rolemanagement-create-heading">

              <h3>
                {editingRoleId !== null
                  ? "Edit Role"
                  : "Create New Role"
                }
              </h3>

              <p>
                Set permissions for a specific role
              </p>

            </div>

            {/* ROLE AND DESCRIPTION */}

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

            {/* ALL PERMISSIONS */}

            <h3 className="Rolemanagement-newtask-heading">
              All Permissions
            </h3>

            {/* PERMISSION GRID */}

            <div className="Rolemanagement-newtask-grid">

              {privilegeGroups.map((group) => (

                <div
                  className="Rolemanagement-newtask-card"
                  key={group.id}
                >

                  <div className="Rolemanagement-newtask-cardheader">

                    <h4>{group.title}</h4>

                    {/* GROUP SWITCH */}

                    <label className="Rolemanagement-newtask-switch">

                      <input
                        type="checkbox"
                        checked={!!enabledGroups[group.id]}
                        onChange={() => handleGroupToggle(group.id)}
                      />

                      <span className="Rolemanagement-newtask-slider"></span>

                    </label>

                  </div>

                  {/* PERMISSION CHECKBOXES */}

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

            {/* BOTTOM BUTTONS */}

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
                    : "Create Role"
                }
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};
