
import { useState } from "react";

import {
  FiUser,
  FiDownload,
  FiChevronRight,
  FiChevronLeft,
  FiSearch
} from "react-icons/fi";

import "./Rolemanagement.css";

// =====================================
// INITIAL ROLE DATA
// =====================================

const initialRoles = [
  {
    id: 1,
    role: "course coordinator",
    description: "Course Coordinator",
    status: "Active",
    createdAt: "8/9/2026",
    permissions: {}
  },
  {
    id: 2,
    role: "internship coordinator",
    description: "Coordinate student",
    status: "Active",
    createdAt: "5/19/2026",
    permissions: {}
  },
  {
    id: 3,
    role: "sub admin",
    description: "sub admin",
    status: "Active",
    createdAt: "3/29/2026",
    permissions: {}
  },
  {
    id: 4,
    role: "front office staff",
    description: "Front office staff",
    status: "Active",
    createdAt: "10/19/2025",
    permissions: {}
  },
  {
    id: 5,
    role: "placement coordinator",
    description: "Placement coordinator",
    status: "Active",
    createdAt: "10/19/2025",
    permissions: {}
  }
];

// =====================================
// PERMISSION GROUPS
// =====================================

const privilegeGroups = [
  {
    id: "student",
    title: "Student Management",
    items: [
      "Add Student",
      "View Student",
      "Edit Student",
      "Delete Student"
    ]
  },
  {
    id: "staff",
    title: "Staff Management",
    items: [
      "Add Staff",
      "View Staff",
      "Edit Staff",
      "Delete Staff"
    ]
  },
  {
    id: "mentor",
    title: "Mentor Card",
    items: [
      "Add Mentor Card",
      "View Mentor Card",
      "Edit Mentor Card",
      "Delete Mentor Card"
    ]
  },
  {
    id: "course",
    title: "Course Management",
    items: [
      "Add Course",
      "View Course",
      "Edit Course",
      "Delete Course"
    ]
  },
  {
    id: "category",
    title: "Category Management",
    items: [
      "Add Category",
      "View Category",
      "Edit Category",
      "Delete Category"
    ]
  },
  {
    id: "module",
    title: "Module Management",
    items: [
      "Add Module",
      "View Module",
      "Edit Module",
      "Delete Module"
    ]
  },
  {
    id: "report",
    title: "Report Management",
    items: [
      "Add Report",
      "View Report",
      "Edit Report",
      "Delete Report"
    ]
  },
  {
    id: "attendance",
    title: "Attendance Management",
    items: [
      "Add Attendance",
      "View Attendance",
      "Edit Attendance",
      "Delete Attendance"
    ]
  },
  {
    id: "leave",
    title: "Leave Request Management",
    items: [
      "Add Leave Request",
      "View Leave Request",
      "Edit Leave Request",
      "Delete Leave Request"
    ]
  },
  {
    id: "branch",
    title: "Branch Management",
    items: [
      "Add Branch",
      "View Branch",
      "Edit Branch",
      "Delete Branch"
    ]
  }
];

// =====================================
// ROLE MANAGEMENT COMPONENT
// =====================================

export const Rolemanagement = () => {

  const [activeTab, setActiveTab] = useState("Roles");

  const [roles, setRoles] = useState(initialRoles);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");

  const [permissions, setPermissions] = useState({});
  const [enabledGroups, setEnabledGroups] = useState({});

  // Selected role for View and Edit
  const [selectedRole, setSelectedRole] = useState(null);

  const [editingRoleId, setEditingRoleId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Roles");


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

    // Save selected role
    setSelectedRole(value);

    setEditingRoleId(value.id);

    // Fill existing role details
    setRoleName(value.role);

    setDescription(value.description);

    // Fill existing permissions
    const savedPermissions = {
      ...value.permissions
    };

    setPermissions(savedPermissions);

    // Calculate group switches
    const groupStatus = {};

    privilegeGroups.forEach((group) => {

      groupStatus[group.id] = group.items.every(
        (item) => !!savedPermissions[item]
      );

    });

    setEnabledGroups(groupStatus);

    // Open edit section
    setActiveTab("New Role");
  };


  // =====================================
  // INDIVIDUAL PERMISSION
  // =====================================

  const handlePermission = (permission) => {

    const updated = {
      ...permissions,
      [permission]: !permissions[permission]
    };

    setPermissions(updated);

    const groupStatus = {};

    privilegeGroups.forEach((group) => {

      groupStatus[group.id] = group.items.every(
        (item) => !!updated[item]
      );

    });

    setEnabledGroups(groupStatus);
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
        updated[item] = isEnabled;
      });

      return updated;
    });
  };


  // =====================================
  // CREATE / UPDATE ROLE
  // =====================================

  const handleCreateRole = () => {

    if (!roleName.trim() || !description.trim()) {

      alert("Please enter role name and description");

      return;
    }

    // UPDATE EXISTING ROLE
    if (editingRoleId !== null) {

      const updatedRole = {
        ...selectedRole,
        role: roleName.trim(),
        description: description.trim(),
        permissions: { ...permissions }
      };

      setRoles((prev) =>
        prev.map((role) =>
          role.id === editingRoleId
            ? updatedRole
            : role
        )
      );

      alert("Role updated successfully");
    }

    // CREATE NEW ROLE
    else {

      const newRole = {

        id: Date.now(),

        role: roleName.trim(),

        description: description.trim(),

        status: "Active",

        createdAt: new Date().toLocaleDateString("en-US"),

        permissions: { ...permissions }
      };

      setRoles((prev) => [...prev, newRole]);

      alert("Role created successfully");
    }

    handleCancel();
  };


  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredRoles = roles.filter((role) => {

    const matchesSearch =
      role.role.toLowerCase().includes(search.toLowerCase()) ||
      role.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Roles" ||
      role.status === statusFilter;

    return matchesSearch && matchesStatus;
  });


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
      role.status,
      role.createdAt
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
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

                  {filteredRoles.length > 0 ? (

                    filteredRoles.map((value, index) => (

                      <tr key={value.id}>

                        <td>{index + 1}</td>

                        <td className="role-name">
                          {value.role}
                        </td>

                        <td>{value.description}</td>

                        <td>

                          <span
                            className={
                              value.status === "Active"
                                ? "Rolemanagement-status active-status"
                                : "Rolemanagement-status inactive-status"
                            }
                          >
                            {value.status}
                          </span>

                        </td>

                        <td>{value.createdAt}</td>

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
                              className="delete-action"
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
                {filteredRoles.length} Roles
              </span>

              <button disabled>
                <FiChevronLeft />
              </button>

              <button disabled>
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

              <p>View role details and assigned permissions</p>

            </div>


            {/* ROLE DETAILS */}

            <div className="Rolemanagement-newtask-details">

              <div className="Rolemanagement-newtask-field">

                <label>Role</label>

                <input
                  type="text"
                  value={selectedRole.role}
                  readOnly
                />

              </div>


              <div className="Rolemanagement-newtask-field">

                <label>Description</label>

                <input
                  type="text"
                  value={selectedRole.description}
                  readOnly
                />

              </div>

            </div>


            {/* STATUS AND CREATED DATE */}

            <div className="Rolemanagement-view-details">

              <div>
                <strong>Status:</strong> {selectedRole.status}
              </div>

              <div>
                <strong>Created At:</strong> {selectedRole.createdAt}
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
                        key={item}
                      >

                        <input
                          type="checkbox"
                          checked={!!selectedRole.permissions?.[item]}
                          readOnly
                        />

                        <span>{item}</span>

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

              <p>Set permissions for a specific role</p>

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
                        key={item}
                      >

                        <input
                          type="checkbox"
                          checked={!!permissions[item]}
                          onChange={() => handlePermission(item)}
                        />

                        <span>{item}</span>

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
              >
                Cancel
              </button>


              <button
                className="Rolemanagement-newtask-create"
                onClick={handleCreateRole}
              >
                {editingRoleId !== null
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
