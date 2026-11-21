import { useEffect, useState } from "react";

import {
  FiUser,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiArrowLeft,
  FiX,
  FiClock,
  FiDownload
} from "react-icons/fi";

import react from "../../../assets/react.svg";
import "./staffmanagement.css";
import AdminService from "../../../services/admin-api-services/AdminService";

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
  mentorTimings: []
};

// =====================================
// SAMPLE STAFF DATA
// =====================================

const sampleStaff = [
  {
    id: 1,
    fullname: "Ananya Sharma",
    dateofbirth: "1994-06-15",
    gender: "Female",
    email: "ananya.sharma@gmail.com",
    officialemail: "ananya@softroniics.com",
    phone: "9847123450",
    whatsapp: "9847123450",
    address: "Green Valley Apt 4B",
    district: "Kozhikode",
    state: "Kerala",
    photo: null,
    department: "uiux",
    branch: "calicut",
    allowAdditionalBranches: true,
    additionalBranches: ["kochi"],
    typeemply: "Senior UI/UX Mentor",
    experience: "5",
    joindate: "2023-01-10",
    status: "Active",
    resingnation: "",
    resume: null,
    remark: "Lead mentor for UI/UX batches",
    mentorRole: true,
    mentorTimings: ["09:30 AM - 12:00 PM", "02:00 PM - 05:00 PM"]
  },
  {
    id: 2,
    fullname: "Rahul Varma",
    dateofbirth: "1992-09-22",
    gender: "Male",
    email: "rahul.varma@gmail.com",
    officialemail: "rahul@softroniics.com",
    phone: "9746234561",
    whatsapp: "9746234561",
    address: "Civil Station Road",
    district: "Kozhikode",
    state: "Kerala",
    photo: null,
    department: "mern",
    branch: "calicut",
    allowAdditionalBranches: false,
    additionalBranches: [],
    typeemply: "Full Stack Developer",
    experience: "4",
    joindate: "2023-03-15",
    status: "Active",
    resingnation: "",
    resume: null,
    remark: "MERN Stack instructor",
    mentorRole: true,
    mentorTimings: ["11:00 AM - 01:30 PM"]
  },
  {
    id: 3,
    fullname: "Priya Nair",
    dateofbirth: "1995-12-05",
    gender: "Female",
    email: "priya.nair@gmail.com",
    officialemail: "priya@softroniics.com",
    phone: "9447345672",
    whatsapp: "9447345672",
    address: "Palakkad Town",
    district: "Palakkad",
    state: "Kerala",
    photo: null,
    department: "python",
    branch: "palakkad",
    allowAdditionalBranches: false,
    additionalBranches: [],
    typeemply: "Python Instructor",
    experience: "3",
    joindate: "2023-06-01",
    status: "Active",
    resingnation: "",
    resume: null,
    remark: "Django and Python lead",
    mentorRole: false,
    mentorTimings: []
  }
];

// =====================================
// MAIN COMPONENT
// =====================================

export const Staffmanagement = () => {
  const { takeroletitle,takebranch,taketiming,createstaff,getallstaff } = AdminService();

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

  const[branchOptions,setBranchOptions]=useState([])
  const[timingOptions,setTimingOptions]=useState([])
  // =====================================
  // HELPERS TO RESOLVE OBJECTS OR STRINGS
  // =====================================

const getBranchName = (branchVal) => {
  if (!branchVal) return "-";

  // If branch is a populated object
  if (typeof branchVal === "object") {
    return branchVal.branchName || branchVal.name || "-";
  }

  // If branch is only an ObjectId
  const found = branchOptions.find(
    (branch) => branch._id === branchVal
  );

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

    console.log("Role API Response:", response);

    setRoles(Array.isArray(response) ? response : []);

  } catch (error) {
    console.error("Error fetching roles:", error);
    setRoles([]);
  }
};
 const fetchbranch = async () => {
  try {
    const response = await takebranch();

    console.log("Branch API Response:", response);

    setBranchOptions(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error("Error fetching branches:", error);
    setBranchOptions([]);
  }
};

  const fetchtiming = async () => {
  try {
    const response = await taketiming();

    console.log("Fetched Timings:", response);

    setTimingOptions(Array.isArray(response) ? response : []);
  } catch (error) {
    console.error("Error fetching timings:", error);
    setTimingOptions([]);
  }
};

const fetchallstaff = async () => {
  try {
    const response = await getallstaff();

    console.log("All Staff API Response:", response);

    // Handle either a direct array or an array inside response.data
    const staffList = Array.isArray(response)
      ? response
      : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.data)
      ? response.data.data
      : [];

    const formattedStaff = staffList.map((staff) => ({
      ...staff,

      // ID
      id: staff._id,

      // Basic details
      fullname: staff.fullName || "",
      dateofbirth: staff.dateOfBirth
        ? staff.dateOfBirth.slice(0, 10)
        : "",
      phone: staff.staffPhoneNumber || "",
      whatsapp: staff.staffWhatsAppNumber || "",
      address: staff.staffPermanentAddress || "",

      // Login details
      officialemail: staff.officialEmail || "",

      // Role
      role:
        typeof staff.role === "object"
          ? staff.role?._id
          : staff.role || "",
      typeemply:
        typeof staff.role === "object"
          ? staff.role?.role || ""
          : "",

      // Branch
      branch: staff.branch,

      // Additional branches
      allowAdditionalBranches: staff.isMultipleBranch || false,
      additionalBranches: Array.isArray(staff.multipleBranches)
        ? staff.multipleBranches.map((item) =>
            typeof item === "object" ? item._id : item
          )
        : [],

      // Professional details
      experience: staff.yearsOfExperience || "",
      joindate: staff.dateOfJoining
        ? staff.dateOfJoining.slice(0, 10)
        : "",
      status: staff.employmentStatus || "",
      resingnation: staff.resignationDate
        ? staff.resignationDate.slice(0, 10)
        : "",
      remark: staff.remarks || "",

      // Mentor details
      mentorRole: staff.isMentor || false,
      mentorTimings: Array.isArray(staff.time)
        ? staff.time.map((item) =>
            typeof item === "object" ? item._id : item
          )
        : [],
    }));

    setAlldata(formattedStaff);

    console.log("Formatted Staff:", formattedStaff);
  } catch (error) {
    console.error("Error fetching all staff:", error);
    setAlldata([]);
  }
};

  useEffect(() => {
    fetchrole();
    fetchbranch();
    fetchtiming();
    fetchallstaff();
  }, []);

  // =====================================
  // FILTER STAFF
  // =====================================

 const filteredStaff = allData.filter((value) => {
  const matchesSearch = [
    value.fullname,
    value.email,
    value.typeemply,
    getBranchName(value.branch),
    value.phone
  ]
    .join(" ")
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesDept =
    departmentFilter === "all" ||
    value.department?.toLowerCase() === departmentFilter.toLowerCase();

  const branchId =
    typeof value.branch === "object"
      ? value.branch?._id
      : value.branch;

  const matchesBranch =
    branchFilter === "all" || branchId === branchFilter;

  const matchesStatus =
    statusFilter === "all" ||
    value.status?.toLowerCase() === statusFilter.toLowerCase();

  return matchesSearch && matchesDept && matchesBranch && matchesStatus;
});

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
      "Status"
    ];

    const rows = filteredStaff.map((staff) => [
      staff.fullname,
      staff.email,
      staff.officialemail,
      staff.phone,
      staff.typeemply || getRoleName(staff.role),
      staff.department,
      getBranchName(staff.branch),
      staff.status
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
  // RESET FORM
  // =====================================

  const resetForm = () => {
    setFormData({ ...initialForm });
    setSelectedTiming("");
  };

  // =====================================
  // STAFF LIST
  // =====================================

  const handlestafflist = () => {
    setActiveTab("stafflist");
    setView(null);
    setEditId(null);
    resetForm();
  };

  // =====================================
  // NEW STAFF
  // =====================================

  const handlenewstaff = () => {
    resetForm();
    setEditId(null);
    setView(null);
    setActiveTab("newstaff");
  };

  // =====================================
  // HANDLE INPUTS
  // =====================================

  const handlecreate = (e) => {
    const { name, value, type, files, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file"
          ? files[0]
          : type === "checkbox"
          ? checked
          : value
    }));
  };

  // =====================================
  // ADDITIONAL BRANCH TOGGLE
  // =====================================

  const handleAdditionalBranchToggle = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      allowAdditionalBranches: checked,
      additionalBranches: checked ? prev.additionalBranches : []
    }));
  };

  // =====================================
  // ADDITIONAL BRANCH SELECTION
  // =====================================

  const handleAdditionalBranchChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      const updatedBranches = checked
        ? [...prev.additionalBranches, value]
        : prev.additionalBranches.filter((branch) => branch !== value);

      return {
        ...prev,
        additionalBranches: updatedBranches
      };
    });
  };

  // =====================================
  // MENTOR ROLE
  // =====================================

  const handleMentorRole = (e) => {
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      mentorRole: checked,
      mentorTimings: checked ? prev.mentorTimings : []
    }));

    setSelectedTiming("");
  };

  // =====================================
  // ADD TIMING
  // =====================================

 const handleTimingChange = (e) => {
  const timingId = e.target.value;

  if (!timingId) return;

  setFormData((prev) => ({
    ...prev,
    mentorTimings: prev.mentorTimings.includes(timingId)
      ? prev.mentorTimings
      : [...prev.mentorTimings, timingId],
  }));

  setSelectedTiming("");
};

  // =====================================
  // REMOVE TIMING
  // =====================================

 const removeTiming = (timingId) => {
  setFormData((prev) => ({
    ...prev,
    mentorTimings: prev.mentorTimings.filter(
      (id) => id !== timingId
    ),
  }));
};

  // =====================================
  // CREATE / UPDATE STAFF
  // =====================================


const handleCreateStaff = async (e) => {
  e.preventDefault();

  // Validate password
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
    data.append(
      "allowAdditionalBranches",
      formData.allowAdditionalBranches
    );
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
    data.append(
      "mentorTimings",
      JSON.stringify(formData.mentorTimings)
    );

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

    // API call
   // API call - CREATE OR UPDATE

let response;

if (editId !== null) {
  // If editId has a value, UPDATE existing staff
  response = await updatestaff(editId, data);

  alert("Staff updated successfully!");
  await getallstaff()
} else {
  // If editId is null, CREATE new staff
  response = await createstaff(data);

    alert("Staff created successfully!");

    // Add returned staff to the list
    const savedStaff = response.data;

    setAlldata((prev) => [
      ...prev,
      {
        ...savedStaff,
        id: savedStaff._id,
        fullname: savedStaff.fullName,
        phone: savedStaff.staffPhoneNumber,
        officialemail: savedStaff.officialEmail,
        typeemply: savedStaff.role?.role || "",
        branch: savedStaff.branch?.branchName || "",
      },
    ]);

resetForm();
setEditId(null);
setView(null);
setActiveTab("stafflist");
}
  }
 catch (error) {
    console.error(
      "Create Staff Error:",
      error.response?.data || error
    );

    alert(
      error.response?.data?.message ||
      "Failed to create staff. Please try again."
    );
  }
};


  // =====================================
  // VIEW STAFF
  // =====================================

  const handleview = (value) => {
    setView(value);
    setActiveTab("staffview");
  };

  // =====================================
  // EDIT STAFF
  // =====================================

 const staffedit = () => {
  if (!view) return;

  setFormData({
    ...initialForm,
    ...view,

    photo: null,
    resume: null,

    role: view.role || "",
    additionalBranches: view.additionalBranches || [],
    allowAdditionalBranches: view.allowAdditionalBranches || false,
    mentorTimings: view.mentorTimings || [],

    password: "",
    conformpassword: ""
  });

  setSelectedTiming("");
  setEditId(view.id);
  setActiveTab("newstaff");
};

  // =====================================
  // DELETE STAFF
  // =====================================

  const handleDelete = async(id) => {
    
    const response=await staffremove(id)
    setAlldata((prev) => prev.filter((item) => item.id !== id));
    setView(null);
  };


   
  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="staffmanagement">

      {/* HEADER */}

      <div className="stafffirst">
        <div className="staffhead">
          <h2>Staff Management</h2>

          <p>
            Staff Management
            <FiChevronRight />

            {activetap === "stafflist"
              ? "Staff List"
              : activetap === "newstaff"
              ? editId !== null
                ? "Edit Staff"
                : "New Staff"
              : "Staff Details"}
          </p>
        </div>

        <div className="staffadminprofile">
          <div className="stafficon">
            <FiUser />
          </div>

          <div className="staffadminname">
            <h5>Vijitha</h5>
            <p>Super Admin</p>
          </div>
        </div>
      </div>

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

            <button
              type="button"
              className={activetap === "newstaff" ? "active" : ""}
              onClick={handlenewstaff}
            >
              {editId !== null ? "Edit Staff" : "New Staff"}
            </button>

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
                {/* <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {branchOptions.map((branch) => {
                    const bId = typeof branch === "object" ? branch._id : branch;
                    const bName = typeof branch === "object" ? branch.branchName : branch;
                    return (
                      <option key={bId} value={bId}>
                        {bName}
                      </option>
                    );
                  })}
                </select> */}
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
                  {filteredStaff.map((value) => (
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

                      <td>
                        {value.typeemply || getRoleName(value.role)}
                      </td>

                  <td className="staffbranchname">
  {getBranchName(value.branch)}
</td>

                      <td>
                        {value.mentorRole && (
                          <button
                            type="button"
                            className="staffbatches"
                          >
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

                          <button
                            type="button"
                            className="staffedit"
                            onClick={() => {
                              setView(value);
                              setFormData({
                                ...initialForm,
                                ...value,
                                role: value.role || "",
                                additionalBranches:
                                  value.additionalBranches || [],
                                mentorTimings: value.mentorTimings || []
                              });
                              setEditId(value.id);
                              setActiveTab("newstaff");
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="staffdelete"
                            onClick={() => handleDelete(value.id)}
                          >
                            Delete
                          </button>

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
                <span>{filteredStaff.length} Staff</span>

                <button type="button" disabled>
                  <FiChevronLeft />
                </button>

                <button type="button" disabled>
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}

        {/* =====================================
            NEW STAFF FORM
        ===================================== */}

        {activetap === "newstaff" && (
          <div className="newstaff">

            <div className="staff-create-heading">
              <h3>
                {editId !== null ? "Edit Staff" : "Create New Staff"}
              </h3>

              <p>
                Fill in staff details and configure permissions
              </p>
            </div>

            <form onSubmit={handleCreateStaff}>

              {/* BASIC DETAILS */}

              <h3>Basic Details</h3>

              <div className="staff-newstaff">

                <div className="stafffield">
                  <label>Full Name <span>*</span></label>

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
                  <label>Date of Birth <span>*</span></label>

                  <input
                    type="date"
                    name="dateofbirth"
                    value={formData.dateofbirth}
                    onChange={handlecreate}
                    required
                  />
                </div>

                <div className="stafffield">
                  <label>Gender <span>*</span></label>

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
                  <label>Email Address <span>*</span></label>

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
                  <label>Staff Phone Number <span>*</span></label>

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
  <label>Type of Employee <span>*</span></label>

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
        (Select all additional branches this staff member can access)
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
              checked={formData.additionalBranches.includes(branch._id)}
              onChange={handleAdditionalBranchChange}
            />

            <span>{branch.branchName}</span>
          </label>
        ))}
    </div>
  </div>
)}
                  {/* {formData.allowAdditionalBranches && (
                    <div
                      className="staff-additional-branches"
                      style={{ gridColumn: "1 / -1" }}
                    >
                      <div className="staff-additional-heading">
                        <strong>Additional Branches</strong>

                        <span>
                          (Select all additional branches this staff member can access)
                        </span>
                      </div>

                      <div className="staff-additional-options">
                        {branchOptions
                          .filter((branch) => {
                            const bId = typeof branch === "object" ? branch._id : branch;
                            return bId !== formData.branch;
                          })
                          .map((branch) => {
                            const bId = typeof branch === "object" ? branch._id : branch;
                            const bName = typeof branch === "object" ? branch.branchName : branch;
                            return (
                              <label
                                key={bId}
                                className="staff-additional-option"
                              >
                                <input
                                  type="checkbox"
                                  value={bId}
                                  checked={formData.additionalBranches.includes(bId)}
                                  onChange={handleAdditionalBranchChange}
                                />

                                <span>{bName}</span>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )} */}

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
                    <label>Date of Joining <span>*</span></label>

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
                    <label>Employment Status <span>*</span></label>

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

                    <label htmlFor="mentorRole">
                      Enable Mentor Role
                    </label>
                  </div>

                  {formData.mentorRole && (
                    <div className="staff-mentor-timings">

                      <div className="staff-timing-select">
                        <label>Select Timings</label>

                       <select
  value={selectedTiming}
  onChange={handleTimingChange}
>
  <option value="">
    -- Select a Timing --
  </option>

  {timingOptions.map((timing) => (
    <option
      key={timing._id}
      value={timing._id}
      disabled={formData.mentorTimings.includes(timing._id)}
    >
      {timing.timeSlot}
    </option>
  ))}
</select>
                        {/* <select
                          value={selectedTiming}
                          onChange={handleTimingChange}
                        >
                          <option value="">
                            -- Select a Timing --
                          </option>

                          {timingOptions.map((timing) => {
                            const tId = typeof timing === "object" ? timing._id : timing;
                            const tLabel = typeof timing === "object" ? timing.timeSlot : timing;
                            return (
                              <option
                                key={tId}
                                value={tId}
                                disabled={formData.mentorTimings.includes(tId)}
                              >
                                {tLabel}
                              </option>
                            );
                          })}
                        </select> */}
                      </div>

                      <div className="staff-selected-timings">
                        <label>Selected Timings</label>

                       {/* <div className="staff-timing-chips">
  {formData.mentorTimings.length > 0 ? (
    formData.mentorTimings.map((timingId) => {
      const timing = timingOptions.find(
        (item) => item._id === timingId
      );

      return (
        <div
          className="staff-timing-chip"
          key={timingId}
        >
          <FiClock />

          <span>
            {timing ? timing.timeSlot : timingId}
          </span>

          <button
            type="button"
            onClick={() => removeTiming(timingId)}
            aria-label="Remove timing"
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
</div> */}
                        <div className="staff-timing-chips">
                          {formData.mentorTimings.length > 0 ? (
                            formData.mentorTimings.map((timing) => {
                              const tKey = typeof timing === "object" ? timing._id : timing;
                              return (
                                <div
                                  className="staff-timing-chip"
                                  key={tKey}
                                >
                                  <FiClock />

                                  <span>{getTimingLabel(timing)}</span>

                                  <button
                                    type="button"
                                    onClick={() => removeTiming(timing)}
                                    aria-label={`Remove ${getTimingLabel(timing)}`}
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
                    <label>Staff Official Email Address <span>*</span></label>

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
                    <label>Create Password <span>*</span></label>

                    <input
                      type="password"
                      placeholder="Enter staff Password"
                      name="password"
                      value={formData.password}
                      onChange={handlecreate}
                      required={editId === null}
                    />
                  </div>

                  <div className="stafflog">
                    <label>Confirm Password <span>*</span></label>

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
                >
                  {editId !== null ? "Update" : "Create Staff"}
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

                <div className="staffper3">
                  <img
                    src={
                     `http://localhost:7000/uploads/${view.photo}`
                    }
                    alt="Staff"
                  />
                </div>
              </div>
            </div>

            {/* PROFESSIONAL DETAILS */}

            <div className="staffprofessionalview">
              <h3 className="staffviewtitle">
                Professional Details
              </h3>

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
                  <p>{view.branch || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Employee Type</h4>
                  <p>
                    {view.typeemply || getRoleName(view.role)}
                  </p>
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
                  <p className="staffviewstatus">
                    {view.status || "-"}
                  </p>
                </div>

                <div className="staffviewfield">
                  <h4>Remarks/Notes</h4>
                  <p>{view.remark || "-"}</p>
                </div>

              </div>

              {/* ADDITIONAL BRANCHES */}

              {view.allowAdditionalBranches && (
                <div className="staff-view-mentor">
                  <h3 className="staffviewtitle">
                    Additional Branches
                  </h3>

                  <div className="staff-additional-options">
                    {(view.additionalBranches || []).length > 0 ? (
                      view.additionalBranches.map((branch) => {
                        const bKey = typeof branch === "object" ? branch._id : branch;
                        return (
                          <div
                            className="staff-additional-option"
                            key={bKey}
                          >
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
                  <h3 className="staffviewtitle">
                    Mentor Role & Timings
                  </h3>

                  <p>
                    Mentor Role: <strong>Enabled</strong>
                  </p>

                  <div className="staff-timing-chips">
                    {(view.mentorTimings || []).length > 0 ? (
                      view.mentorTimings.map((timing) => {
                        const tKey = typeof timing === "object" ? timing._id : timing;
                        return (
                          <div
                            className="staff-timing-chip"
                            key={tKey}
                          >
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
              <button
                type="button"
                className="staffviewedit"
                onClick={staffedit}
              >
                Edit
              </button>

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