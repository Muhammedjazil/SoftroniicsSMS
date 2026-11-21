import { useEffect, useState } from "react";
import {
  FiUser,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiArrowLeft,
  FiX,
  FiClock,
  FiDownload,
} from "react-icons/fi";

import "./staffmanagement.css";
import AdminService from "../../../services/admin-api-services/AdminService";
import usePermission from "../../../hooks/usePermission";

const initialForm = {
  fullname: "",
  dateofbirth: "",
  gender: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  district: "",
  state: "",
  photo: null,

  department: "",
  branch: "",
  allowAdditionalBranches: false,
  additionalBranches: [],

  role: "",
  experience: "",
  joindate: "",
  status: "",
  resingnation: "",
  resume: null,
  remark: "",

  officialemail: "",
  password: "",
  conformpassword: "",

  mentorRole: false,
  mentorTimings: [],
};

// =====================================
// MAIN COMPONENT
// =====================================

export const Staffmanagement = () => {
  const {
    takeroletitle,
    takebranch,
    taketiming,
    createstaff,
    getallstaff,
    updatestaff,
    staffremove,
  } = AdminService();

  const { user, can } = usePermission();
  const canAddStaff = can("staffManagement", "addStaff");
  const canEditStaff = can("staffManagement", "editStaff");
  const canDeleteStaff = can("staffManagement", "deleteStaff");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [allData, setAlldata] = useState([]);
  const [roles, setRoles] = useState([]);

  const [formData, setFormData] = useState({ ...initialForm });

  const [activetap, setActiveTab] = useState("stafflist");
  const [view, setView] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedTiming, setSelectedTiming] = useState("");

  const [branchOptions, setBranchOptions] = useState([]);
  const [timingOptions, setTimingOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const staffPerPage = 8;

  // =====================================
  // HELPERS TO RESOLVE OBJECTS OR STRINGS
  // =====================================

  const getBranchName = (branchVal) => {
    if (!branchVal) return "-";

    if (typeof branchVal === "object") {
      return branchVal.branchName || branchVal.name || "-";
    }

    const found = branchOptions.find((branch) => branch._id === branchVal);
    return found?.branchName || found?.name || branchVal;
  };

  const getTimingLabel = (timingVal) => {
    if (!timingVal) return "-";
    if (typeof timingVal === "object") return timingVal.timeSlot || "-";
    const found = timingOptions.find((t) => t._id === timingVal);
    return found?.timeSlot || timingVal;
  };

  // =====================================
  // FETCH ROLES, BRANCHES & TIMINGS
  // =====================================

  const fetchrole = async () => {
    try {
      const response = await takeroletitle();
      setRoles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  const fetchbranch = async () => {
    try {
      const response = await takebranch();
      setBranchOptions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranchOptions([]);
    }
  };

  const fetchtiming = async (branchId) => {
    try {
      if (!branchId) {
        setTimingOptions([]);
        return;
      }

      const response = await taketiming(branchId);
      setTimingOptions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching timings:", error);
      setTimingOptions([]);
    }
  };

  const fetchallstaff = async () => {
    try {
      const response = await getallstaff();

      const staffList = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

      const formattedStaff = staffList.map((staff) => ({
        ...staff,
        id: staff._id,
        fullname: staff.fullName || "",
        dateofbirth: staff.dateOfBirth ? staff.dateOfBirth.slice(0, 10) : "",
        phone: staff.staffPhoneNumber || "",
        whatsapp: staff.staffWhatsAppNumber || "",
        address: staff.staffPermanentAddress || "",
        officialemail: staff.officialEmail || "",
        role:
          typeof staff.role === "object" ? staff.role?._id : staff.role || "",
        typeemply:
          typeof staff.role === "object" ? staff.role?.role || "" : "",
        branch: staff.branch,
        allowAdditionalBranches: staff.isMultipleBranch || false,
        additionalBranches: Array.isArray(staff.multipleBranches)
          ? staff.multipleBranches.map((item) =>
              typeof item === "object" ? item._id : item
            )
          : [],
        experience: staff.yearsOfExperience || "",
        joindate: staff.dateOfJoining ? staff.dateOfJoining.slice(0, 10) : "",
        status: staff.employmentStatus || "",
        resingnation: staff.resignationDate
          ? staff.resignationDate.slice(0, 10)
          : "",
        remark: staff.remarks || "",
        mentorRole: staff.isMentor || false,
        mentorTimings: Array.isArray(staff.time)
          ? staff.time.map((item) =>
              typeof item === "object" ? item._id : item
            )
          : [],
      }));

      setAlldata(formattedStaff);
    } catch (error) {
      console.error("Error fetching all staff:", error);
      setAlldata([]);
    }
  };

  useEffect(() => {
    fetchrole();
    fetchbranch();
    fetchallstaff();
  }, []);

  // =====================================
  // FILTER & PAGINATE STAFF
  // =====================================

  const filteredStaff = allData.filter((value) => {
    const matchesSearch = [
      value.fullname,
      value.email,
      value.officialemail,
      value.typeemply,
      getBranchName(value.branch),
      value.phone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDept =
      departmentFilter === "all" ||
      value.department?.toLowerCase() === departmentFilter.toLowerCase();

    const branchId =
      typeof value.branch === "object" ? value.branch?._id : value.branch;

    const matchesBranch =
      branchFilter === "all" || branchId === branchFilter;

    const matchesStatus =
      statusFilter === "all" ||
      value.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesBranch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStaff.length / staffPerPage);
  const startIndex = (currentPage - 1) * staffPerPage;
  const endIndex = startIndex + staffPerPage;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, departmentFilter, branchFilter, statusFilter]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================
  // GET ROLE NAME
  // =====================================

  const getRoleName = (roleId) => {
    const foundRole = roles.find((role) => role._id === roleId);
    return foundRole?.role || roleId || "-";
  };

  // =====================================
  // EXPORT CSV
  // =====================================

  const handleExport = () => {
    if (filteredStaff.length === 0) {
      alert("No staff available to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Official Email",
      "Phone",
      "Role",
      "Department",
      "Branch",
      "Status",
    ];

    const rows = filteredStaff.map((staff) => [
      staff.fullname,
      staff.email,
      staff.officialemail,
      staff.phone,
      staff.typeemply || getRoleName(staff.role),
      staff.department,
      getBranchName(staff.branch),
      staff.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "staff-list.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =====================================
  // RESET FORM & TAB SWITCHERS
  // =====================================

  const resetForm = () => {
    setFormData({ ...initialForm });
    setSelectedTiming("");
  };

  const handlestafflist = () => {
    setActiveTab("stafflist");
    setView(null);
    setEditId(null);
    resetForm();
  };

  const handlenewstaff = () => {
    if (!canAddStaff) return;
    resetForm();
    setEditId(null);
    setView(null);
    setActiveTab("newstaff");
  };

  // =====================================
  // HANDLE INPUTS
  // =====================================

  const handlecreate = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "branch") {
      setFormData((prev) => ({
        ...prev,
        branch: value,
        mentorTimings: [],
        additionalBranches: prev.additionalBranches.filter((id) => id !== value),
      }));

      setSelectedTiming("");
      fetchtiming(value);
      return;
    }

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================
  // ADDITIONAL BRANCHES & MENTOR ROLE
  // =====================================

  const handleAdditionalBranchToggle = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      allowAdditionalBranches: checked,
      additionalBranches: checked ? prev.additionalBranches : [],
    }));
  };

  const handleAdditionalBranchChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      const updatedBranches = checked
        ? [...prev.additionalBranches, value]
        : prev.additionalBranches.filter((branch) => branch !== value);

      return {
        ...prev,
        additionalBranches: updatedBranches,
      };
    });
  };

  const handleMentorRole = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      mentorRole: checked,
      mentorTimings: checked ? prev.mentorTimings : [],
    }));

    setSelectedTiming("");
  };

  // =====================================
  // TIMING VALIDATION & SELECTION
  // =====================================

  const getTimeRange = (timeSlot) => {
    if (!timeSlot) return null;

    const matches = timeSlot.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/gi);
    if (!matches || matches.length !== 2) return null;

    const convertToMinutes = (time) => {
      const match = time.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
      if (!match) return null;

      let hours = Number(match[1]);
      const minutes = Number(match[2] || 0);
      const period = match[3].toUpperCase();

      if (hours < 1 || hours > 12 || minutes > 59) return null;

      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const start = convertToMinutes(matches[0]);
    const end = convertToMinutes(matches[1]);

    if (start === null || end === null || end <= start) {
      return null;
    }

    return { start, end };
  };

  const handleTimingChange = (e) => {
    const timingId = e.target.value;
    if (!timingId) return;

    const selectedTime = timingOptions.find(
      (timing) => timing._id === timingId
    );
    if (!selectedTime) return;

    const newRange = getTimeRange(selectedTime.timeSlot);
    if (!newRange) {
      alert("Invalid timing format. Please check the timing.");
      setSelectedTiming("");
      return;
    }

    const hasConflict = formData.mentorTimings.some((existingId) => {
      const existingTime = timingOptions.find(
        (timing) => timing._id === existingId
      );
      if (!existingTime) return false;

      const existingRange = getTimeRange(existingTime.timeSlot);
      if (!existingRange) return false;

      return (
        newRange.start < existingRange.end &&
        newRange.end > existingRange.start
      );
    });

    if (hasConflict) {
      alert(
        `Time Conflict! ${selectedTime.timeSlot} overlaps with an already selected timing.`
      );
      setSelectedTiming("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      mentorTimings: [...prev.mentorTimings, timingId],
    }));

    setSelectedTiming("");
  };

  const removeTiming = (timingId) => {
    setFormData((prev) => ({
      ...prev,
      mentorTimings: prev.mentorTimings.filter((id) => id !== timingId),
    }));
  };

  // =====================================
  // CREATE / UPDATE STAFF
  // =====================================

  const handleCreateStaff = async (e) => {
    e.preventDefault();

    if (editId !== null && !canEditStaff) {
      alert("You do not have permission to edit staff.");
      return;
    }

    if (editId === null && !canAddStaff) {
      alert("You do not have permission to add staff.");
      return;
    }

    if (formData.password !== formData.conformpassword) {
      alert("Password and Confirm Password do not match!");
      return;
    }

    if (!formData.role) {
      alert("Please select a role");
      return;
    }

    if (formData.mentorRole && formData.mentorTimings.length === 0) {
      alert("Please select at least one mentor timing");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      // Basic Details
      data.append("fullname", formData.fullname);
      data.append("dateofbirth", formData.dateofbirth);
      data.append("gender", formData.gender);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("whatsapp", formData.whatsapp);
      data.append("address", formData.address);
      data.append("district", formData.district);
      data.append("state", formData.state);

      // Professional Details
      data.append("department", formData.department);
      data.append("branch", formData.branch);
      data.append("allowAdditionalBranches", formData.allowAdditionalBranches);
      data.append(
        "additionalBranches",
        JSON.stringify(formData.additionalBranches)
      );

      data.append("role", formData.role);
      data.append("experience", formData.experience);
      data.append("joindate", formData.joindate);
      data.append("status", formData.status);
      data.append("resingnation", formData.resingnation);
      data.append("remark", formData.remark);

      // Mentor Details
      data.append("mentorRole", formData.mentorRole);
      data.append("mentorTimings", JSON.stringify(formData.mentorTimings));

      // Login Details
      data.append("officialemail", formData.officialemail);
      data.append("password", formData.password);

      // File uploads
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      if (formData.resume) {
        data.append("resume", formData.resume);
      }

      if (editId !== null) {
        await updatestaff(editId, data);
        alert("Staff updated successfully!");
      } else {
        await createstaff(data);
        alert("Staff created successfully!");
      }

      await fetchallstaff();
      resetForm();
      setEditId(null);
      setView(null);
      setActiveTab("stafflist");
    } catch (error) {
      console.error("Create/Update Staff Error:", error.response?.data || error);
      alert(
        error.response?.data?.message ||
          "Failed to save staff. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================
  // VIEW, EDIT & DELETE STAFF
  // =====================================

  const handleview = (value) => {
    setView(value);
    setActiveTab("staffview");
  };

  const openEditForm = (staffRecord) => {
    if (!canEditStaff || !staffRecord) return;

    const branchId =
      typeof staffRecord.branch === "object"
        ? staffRecord.branch?._id
        : staffRecord.branch;

    setView(staffRecord);

    setFormData({
      ...initialForm,
      ...staffRecord,
      branch: branchId || "",
      role:
        typeof staffRecord.role === "object"
          ? staffRecord.role?._id
          : staffRecord.role || "",
      photo: null,
      resume: null,
      additionalBranches: staffRecord.additionalBranches || [],
      allowAdditionalBranches: staffRecord.allowAdditionalBranches || false,
      mentorTimings: staffRecord.mentorTimings || [],
      password: "",
      conformpassword: "",
    });

    setSelectedTiming("");

    if (branchId) {
      fetchtiming(branchId);
    }

    setEditId(staffRecord.id);
    setActiveTab("newstaff");
  };

  const handleDelete = async (id) => {
    if (!canDeleteStaff) return;
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }

    try {
      await staffremove(id);
      alert("Staff removed successfully!");
      setAlldata((prev) => prev.filter((item) => item.id !== id));
      setView(null);
    } catch (error) {
      console.error("Delete Staff Error:", error);
      alert(error.response?.data?.message || "Failed to delete staff.");
    }
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="staffmanagement">
      {/* HEADER */}
    

      {/* MAIN CARD */}
      <div className="stafffull">
        {/* TOP TABS */}
        <div className="staff-hero0">
          <div className="staff-hero1">
            <button
              type="button"
              className={activetap === "stafflist" ? "active" : ""}
              onClick={handlestafflist}
            >
              Staff List
            </button>

            {(canAddStaff || editId !== null) && (
              <button
                type="button"
                className={activetap === "newstaff" ? "active" : ""}
                onClick={handlenewstaff}
              >
                {editId !== null ? "Edit Staff" : "New Staff"}
              </button>
            )}
          </div>
        </div>

        {/* =====================================
            STAFF LIST
        ===================================== */}

        {activetap === "stafflist" && (
          <>
            <div className="staffherosection">
              <div className="staffsearch">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Search Staff"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="staffalldepartment">
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="uiux">UI/UX</option>
                  <option value="mern">MERN</option>
                  <option value="python">Python</option>
                  <option value="datascience">Data Science</option>
                </select>
              </div>

              <div className="staffbranch">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {branchOptions.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="staffactive">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pause">Pause</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="staffexport">
                <button
                  type="button"
                  className="staffexport-btn"
                  onClick={handleExport}
                >
                  <FiDownload />
                  Export
                </button>
              </div>
            </div>

            {/* STAFF TABLE */}
            <div className="stafftable">
              <table>
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>BRANCH</th>
                    <th>BATCHES</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="stafftabledetails">
                  {currentStaff.map((value) => (
                    <tr key={value.id}>
                      <td>
                        <div className="staffnamecell">
                          <div className="staffavatar">
                            {value.fullname?.charAt(0).toUpperCase()}
                          </div>

                          <div className="staffnamedetails">
                            <h5>{value.fullname}</h5>
                            <p>{value.phone}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="staffemail">
                          <p>{value.email}</p>
                          <span>{value.officialemail}</span>
                        </div>
                      </td>

                      <td>{value.typeemply || getRoleName(value.role)}</td>

                      <td className="staffbranchname">
                        {getBranchName(value.branch)}
                      </td>

                      <td>
                        {value.mentorRole && (
                          <button type="button" className="staffbatches">
                            View Batches
                          </button>
                        )}
                      </td>

                      <td>
                        <div className="staffactions">
                          <button
                            type="button"
                            className="staffviewbtn"
                            onClick={() => handleview(value)}
                          >
                            View
                          </button>

                          {canEditStaff && (
                            <button
                              type="button"
                              className="staffedit"
                              onClick={() => openEditForm(value)}
                            >
                              Edit
                            </button>
                          )}

                          {canDeleteStaff && (
                            <button
                              type="button"
                              className="staffdelete"
                              onClick={() => handleDelete(value.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan="6" className="staffnodata">
                        No staff found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="staffpagination">
                <span>
                  Showing{" "}
                  {filteredStaff.length === 0 ? 0 : startIndex + 1}
                  {" - "}
                  {Math.min(endIndex, filteredStaff.length)}
                  {" of "}
                  {filteredStaff.length} Staff
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>

                <span>
                  Page {currentPage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={totalPages === 0 || currentPage >= totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        {/* =====================================
            NEW / EDIT STAFF FORM
        ===================================== */}

        {activetap === "newstaff" && (
          <div className="newstaff">
            <div className="staff-create-heading">
              <h3>
                {editId !== null ? "Edit Staff" : "Create New Staff"}
              </h3>
              <p>Fill in staff details and assign a role & credentials</p>
            </div>

            <form onSubmit={handleCreateStaff}>
              {/* BASIC DETAILS */}
              <h3>Basic Details</h3>

              <div className="staff-newstaff">
                <div className="stafffield">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    placeholder="Enter full name"
                    onChange={handlecreate}
                    required
                  />
                </div>

                <div className="stafffield">
                  <label>
                    Date of Birth <span>*</span>
                  </label>
                  <input
                    type="date"
                    name="dateofbirth"
                    value={formData.dateofbirth}
                    onChange={handlecreate}
                    required
                  />
                </div>

                <div className="stafffield">
                  <label>
                    Gender <span>*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handlecreate}
                    required
                  >
                    <option value="">Choose Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="stafffield">
                  <label>
                    Email Address <span>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter Email Address"
                    onChange={handlecreate}
                    required
                  />
                </div>

                <div className="stafffield">
                  <label>
                    Staff Phone Number <span>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    placeholder="Enter Staff Phone Number"
                    onChange={handlecreate}
                    required
                  />
                </div>

                <div className="stafffield">
                  <label>Staff WhatsApp Number</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    placeholder="Enter Staff WhatsApp Number"
                    onChange={handlecreate}
                  />
                </div>

                <div className="stafffield">
                  <label>Staff Permanent Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    placeholder="Enter Staff Permanent Address"
                    onChange={handlecreate}
                  />
                </div>

                <div className="stafffield">
                  <label>District</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    placeholder="Enter Staff District"
                    onChange={handlecreate}
                  />
                </div>

                <div className="stafffield">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    placeholder="Enter Staff State"
                    onChange={handlecreate}
                  />
                </div>

                <div className="stafffield">
                  <label>
                    Photo{" "}
                    <span className="optional">
                      (Photo format: JPG/PNG only)
                    </span>
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept=".jpg,.jpeg,.png"
                    onChange={handlecreate}
                  />
                </div>
              </div>

              {/* PROFESSIONAL DETAILS */}
              <div className="staffpersonaldetails">
                <h3>Professional Details</h3>

                <div className="staffprofessionalgrid">
                  {/* DEPARTMENT */}
                  <div className="staffprofessionalfield">
                    <label>
                      Department <span>*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handlecreate}
                      required
                    >
                      <option value="">Choose Department</option>
                      <option value="uiux">UI/UX</option>
                      <option value="mern">MERN</option>
                      <option value="python">Python</option>
                      <option value="datascience">Data Science</option>
                    </select>
                  </div>

                  {/* ROLE */}
                  <div className="staffprofessionalfield">
                    <label>
                      Assigned Role <span>*</span>
                    </label>
                    <select
                      required
                      name="role"
                      value={formData.role}
                      onChange={handlecreate}
                    >
                      <option value="">Choose Role</option>
                      {roles.map((value) => (
                        <option key={value._id} value={value._id}>
                          {value.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* BRANCH */}
                  <div className="staffprofessionalfield">
                    <label>
                      Branch <span>*</span>
                    </label>
                    <select
                      required
                      name="branch"
                      value={formData.branch}
                      onChange={handlecreate}
                    >
                      <option value="">Choose Branch</option>
                      {branchOptions.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          {branch.branchName}
                        </option>
                      ))}
                    </select>

                    <div className="staffcheckbox">
                      <input
                        type="checkbox"
                        id="additionalBranch"
                        checked={formData.allowAdditionalBranches}
                        onChange={handleAdditionalBranchToggle}
                      />
                      <label htmlFor="additionalBranch">
                        Allow Additional Branches
                      </label>
                    </div>
                  </div>

                  {/* ADDITIONAL BRANCHES */}
                  {formData.allowAdditionalBranches && (
                    <div
                      className="staff-additional-branches"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="staff-additional-heading">
                        <strong>Additional Branches</strong>
                        <span>
                          (Select all additional branches this staff member can
                          access)
                        </span>
                      </div>

                      <div className="staff-additional-options">
                        {branchOptions
                          .filter((branch) => branch._id !== formData.branch)
                          .map((branch) => (
                            <label
                              key={branch._id}
                              className="staff-additional-option"
                            >
                              <input
                                type="checkbox"
                                value={branch._id}
                                checked={formData.additionalBranches.includes(
                                  branch._id
                                )}
                                onChange={handleAdditionalBranchChange}
                              />
                              <span>{branch.branchName}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* EXPERIENCE */}
                  <div className="staffprofessionalfield">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter years of experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handlecreate}
                    />
                  </div>

                  {/* JOINING DATE */}
                  <div className="staffprofessionalfield">
                    <label>
                      Date of Joining <span>*</span>
                    </label>
                    <input
                      type="date"
                      required
                      name="joindate"
                      value={formData.joindate}
                      onChange={handlecreate}
                    />
                  </div>

                  {/* EMPLOYMENT STATUS */}
                  <div className="staffprofessionalfield">
                    <label>
                      Employment Status <span>*</span>
                    </label>
                    <select
                      required
                      name="status"
                      value={formData.status}
                      onChange={handlecreate}
                    >
                      <option value="">Choose Employment Status</option>
                      <option value="Active">Active</option>
                      <option value="Pause">Pause</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* RESIGNATION DATE */}
                  <div className="staffprofessionalfield">
                    <label>
                      Resignation Date{" "}
                      <span className="optional">(Only If Inactive)</span>
                    </label>
                    <input
                      type="date"
                      name="resingnation"
                      value={formData.resingnation}
                      onChange={handlecreate}
                    />
                  </div>

                  {/* RESUME */}
                  <div className="staffprofessionalfield">
                    <label>
                      Resume{" "}
                      <span className="optional">
                        (Upload PDF only Max 5MB)
                      </span>
                    </label>
                    <input
                      type="file"
                      name="resume"
                      accept=".pdf"
                      onChange={handlecreate}
                    />
                  </div>

                  {/* REMARKS */}
                  <div className="staffprofessionalfield">
                    <label>
                      Remarks/Notes{" "}
                      <span className="optional">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Any Remarks or notes"
                      name="remark"
                      value={formData.remark}
                      onChange={handlecreate}
                    />
                  </div>
                </div>

                {/* MENTOR ROLE */}
                <div className="staffmentor-section">
                  <div className="staffcheckbox staffmentorcheck">
                    <input
                      type="checkbox"
                      id="mentorRole"
                      name="mentorRole"
                      checked={formData.mentorRole}
                      onChange={handleMentorRole}
                    />
                    <label htmlFor="mentorRole">Enable Mentor Role</label>
                  </div>

                  {formData.mentorRole && (
                    <div className="staff-mentor-timings">
                      <div className="staff-timing-select">
                        <label>Select Timings</label>
                        <select
                          value={selectedTiming}
                          onChange={handleTimingChange}
                        >
                          <option value="">-- Select a Timing --</option>
                          {timingOptions.map((timing) => (
                            <option
                              key={timing._id}
                              value={timing._id}
                              disabled={formData.mentorTimings.includes(
                                timing._id
                              )}
                            >
                              {timing.timeSlot}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="staff-selected-timings">
                        <label>Selected Timings</label>
                        <div className="staff-timing-chips">
                          {formData.mentorTimings.length > 0 ? (
                            formData.mentorTimings.map((timing) => {
                              const tKey =
                                typeof timing === "object"
                                  ? timing._id
                                  : timing;
                              return (
                                <div className="staff-timing-chip" key={tKey}>
                                  <FiClock />
                                  <span>{getTimingLabel(timing)}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeTiming(timing)}
                                    aria-label={`Remove ${getTimingLabel(
                                      timing
                                    )}`}
                                  >
                                    <FiX />
                                  </button>
                                </div>
                              );
                            })
                          ) : (
                            <p className="staff-no-timings">
                              No timings selected
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LOGIN DETAILS */}
              <div className="stafflogindetails">
                <div className="stafflogin">
                  <div className="stafflog">
                    <label>
                      Staff Official Email Address <span>*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter Staff Official Email Address"
                      name="officialemail"
                      value={formData.officialemail}
                      onChange={handlecreate}
                      required
                    />
                  </div>

                  <div className="stafflog">
                    <label>
                      Create Password {editId === null && <span>*</span>}
                    </label>
                    <input
                      type="password"
                      placeholder={
                        editId !== null
                          ? "Leave blank to keep current password"
                          : "Enter staff Password"
                      }
                      name="password"
                      value={formData.password}
                      onChange={handlecreate}
                      required={editId === null}
                    />
                  </div>

                  <div className="stafflog">
                    <label>
                      Confirm Password {editId === null && <span>*</span>}
                    </label>
                    <input
                      type="password"
                      placeholder="Enter Staff Confirm Password"
                      name="conformpassword"
                      value={formData.conformpassword}
                      onChange={handlecreate}
                      required={editId === null}
                    />
                  </div>
                </div>
              </div>

              {/* FORM BUTTONS */}
              <div className="staffformbutton">
                <button
                  type="button"
                  className="staffformbuttoncancel"
                  onClick={handlestafflist}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    editId !== null
                      ? "staffbtnupdate"
                      : "staffformbuttoncreate"
                  }
                  disabled={submitting}
                >
                  {submitting
                    ? "Please Wait..."
                    : editId !== null
                    ? "Update"
                    : "Create Staff"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =====================================
            STAFF VIEW
        ===================================== */}

        {activetap === "staffview" && view && (
          <div className="staffview">
            <div className="staffviewheader">
              <h1>{view.fullname}</h1>

              <button
                type="button"
                className="staffviewback"
                onClick={handlestafflist}
              >
                <FiArrowLeft /> Back
              </button>
            </div>

            {/* BASIC DETAILS */}
            <div className="staffbasicdetails">
              <h3 className="staffviewtitle">Basic Details</h3>

              <div className="staffpersonal">
                <div className="staffviewdetailsgrid">
                  <div className="staffviewfield">
                    <h4>Full Name</h4>
                    <p>{view.fullname || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Date of Birth</h4>
                    <p>{view.dateofbirth || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Gender</h4>
                    <p>{view.gender || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Email Address</h4>
                    <p>{view.email || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Official Login Email</h4>
                    <p>{view.officialemail || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Staff Phone Number</h4>
                    <p>{view.phone || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Staff WhatsApp Number</h4>
                    <p>{view.whatsapp || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>Permanent Address</h4>
                    <p>{view.address || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>District</h4>
                    <p>{view.district || "-"}</p>
                  </div>

                  <div className="staffviewfield">
                    <h4>State</h4>
                    <p>{view.state || "-"}</p>
                  </div>
                </div>

                {view.photo && (
                  <div className="staffper3">
                    <img
                      src={
                        view.photo.startsWith("http")
                          ? view.photo
                          : `http://localhost:7000/uploads/${view.photo}`
                      }
                      alt={view.fullname || "Staff"}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}
            <div className="staffprofessionalview">
              <h3 className="staffviewtitle">Professional Details</h3>

              <div className="staffviewdetailsgrid">
                <div className="staffviewfield">
                  <h4>ID</h4>
                  <p>{view.id || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Department</h4>
                  <p>{view.department || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Branch</h4>
                  <p>{getBranchName(view.branch)}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Assigned Role</h4>
                  <p>{view.typeemply || getRoleName(view.role)}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Years of Experience</h4>
                  <p>{view.experience || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Date of Joining</h4>
                  <p>{view.joindate || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Resignation Date</h4>
                  <p>{view.resingnation || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Employment Status</h4>
                  <p className="staffviewstatus">{view.status || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Remarks/Notes</h4>
                  <p>{view.remark || "-"}</p>
                </div>
              </div>

              {/* ADDITIONAL BRANCHES */}
              {view.allowAdditionalBranches && (
                <div className="staff-view-mentor">
                  <h3 className="staffviewtitle">Additional Branches</h3>

                  <div className="staff-additional-options">
                    {(view.additionalBranches || []).length > 0 ? (
                      view.additionalBranches.map((branch) => {
                        const bKey =
                          typeof branch === "object" ? branch._id : branch;
                        return (
                          <div className="staff-additional-option" key={bKey}>
                            <span>{getBranchName(branch)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p>No additional branches selected</p>
                    )}
                  </div>
                </div>
              )}

              {/* MENTOR TIMINGS */}
              {view.mentorRole && (
                <div className="staff-view-mentor">
                  <h3 className="staffviewtitle">Mentor Role & Timings</h3>

                  <p>
                    Mentor Role: <strong>Enabled</strong>
                  </p>

                  <div className="staff-timing-chips">
                    {(view.mentorTimings || []).length > 0 ? (
                      view.mentorTimings.map((timing) => {
                        const tKey =
                          typeof timing === "object" ? timing._id : timing;
                        return (
                          <div className="staff-timing-chip" key={tKey}>
                            <FiClock />
                            <span>{getTimingLabel(timing)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p>No timings selected</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM BUTTONS */}
            <div className="staffviewbuttons">
              {canEditStaff && (
                <button
                  type="button"
                  className="staffviewedit"
                  onClick={() => openEditForm(view)}
                >
                  Edit
                </button>
              )}

              <button
                type="button"
                className="staffviewprint"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Staffmanagement;