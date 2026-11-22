
import { useState, useEffect } from "react";

import {
  FiUser,
  FiSearch,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiX,
  FiUpload,
  FiChevronRight,
  FiChevronLeft
} from "react-icons/fi";

import "./internmanagement.css";
import AdminService from "../../../services/admin-api-services/AdminService";
// =====================================
// INITIAL FORM DATA
// =====================================

const initialForm = {
  fullName: "",
  dob: "",
  gender: "",
  email: "",
  phone: "",
  whatsapp: "",
  guardianName: "",
  fatherName: "",
  address: "",
  motherName: "",
  parentPhone: "",
  district: "",
  state: "",
  photo: "",
  course: "",
  branch: "",
  startDate: "",
  completionDate: "",
  batch: "",
  courseStatus: "",
  careerAdvisor: "",
  syllabusStatus: "",
  remarks: "",
  placementStatus: "",
  linkedin: "",
  portfolio: "",
  companyName: "",
  jobRole: "",
  resume: "",
  studentEmail: "",
  password: "",
  confirmPassword: ""
};

// =====================================
// SAMPLE STUDENTS
// =====================================

// const sampleStudents = [
//   {
//     id: 1,
//     fullName: "MUHAMMED RAFAN",
//     phone: "9946188074",
//     email: "rafan@gmail.com",
//     course: "DATA SCIENCE & AI ENGINEERING",
//     branch: "calicut",
//     batch: "PY-01",
//     courseStatus: "Ongoing",
//     gender: "Male",
//     studentEmail: "rafan@gmail.com"
//   },
//   {
//     id: 2,
//     fullName: "ASWIN M",
//     phone: "7736325109",
//     email: "aswin@gmail.com",
//     course: "DATA SCIENCE & AI ENGINEERING",
//     branch: "calicut",
//     batch: "PY-01",
//     courseStatus: "Ongoing",
//     gender: "Male",
//     studentEmail: "aswin@gmail.com"
//   },
//   {
//     id: 3,
//     fullName: "SUJITH KRISHNA",
//     phone: "9847503679",
//     email: "sujith@gmail.com",
//     course: "UI/UX DESIGNING",
//     branch: "calicut",
//     batch: "PY-01",
//     courseStatus: "Ongoing",
//     gender: "Male",
//     studentEmail: "sujith@gmail.com"
//   },
//   {
//     id: 4,
//     fullName: "ASHIDOSH",
//     phone: "7428719860",
//     email: "ashidosh@gmail.com",
//     course: "UI/UX DESIGNING",
//     branch: "calicut",
//     batch: "PY-01",
//     courseStatus: "Ongoing",
//     gender: "Male",
//     studentEmail: "ashidosh@gmail.com"
//   }
// ];

// =====================================
// INPUT FIELD COMPONENT
// IMPORTANT: KEEP OUTSIDE PARENT
// =====================================

const InputField = ({
  label,
  name,
  placeholder,
  type = "text",
  required = false,
  optional = false,
  formData,
  handleChange
}) => {
  return (
    <div className="intern-field">
      <label>
        {label}
        {required && <span className="intern-required"> *</span>}
        {optional && (
          <span className="intern-optional"> (Optional)</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={formData[name] || ""}
        placeholder={placeholder}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
};

// =====================================
// SELECT FIELD COMPONENT
// IMPORTANT: KEEP OUTSIDE PARENT
// =====================================

const SelectField = ({
  label,
  name,
  placeholder,
  options,
  required = false,
  formData,
  handleChange
}) => {
  return (
    <div className="intern-field">
      <label>
        {label}
        {required && <span className="intern-required"> *</span>}
      </label>

      <select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        required={required}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

// =====================================
// MAIN COMPONENT
// =====================================

export const Internmanagement = () => {

 const {takebranch,getallstaff,takebatches,takecourses,createintern,getallinterns,updateintern,handledeleteintern}=AdminService()

  const [activeTab, setActiveTab] = useState("list");

 const [students, setStudents] = useState([]);

  const [formData, setFormData] = useState({ ...initialForm });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [batchFilter, setBatchFilter] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const[branch,setBranch]=useState([])
  const[roles,setRoules]=useState([])
  const[course,setCourse]=useState([])
  const [batches, setBatches] = useState([]);
const [batchLoading, setBatchLoading] = useState(false);
  // =====================================
  // SAVE TO LOCAL STORAGE
  // =====================================

  const handleallbranch=async()=>{
    let response=await takebranch()
       setBranch(response)
       console.log(response);
       
  }

  const handleallstaff=async()=>{
    let response=await getallstaff();
    setRoules(response)
    console.log(response);
    

  }

 const handleallcourse = async () => {
  try {
    const response = await takecourses();

    const courseList = Array.isArray(response)
      ? response
      : response?.courses || [];

    setCourse(courseList);

    console.log("Courses fetched:", courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    setCourse([]);
  }
};
  // =====================================
// FETCH BATCHES BASED ON SELECTED BRANCH
// =====================================

useEffect(() => {
  if (!formData.branch) {
    setBatches([]);
    return;
  }

  const fetchBatches = async () => {
    try {
      setBatchLoading(true);

      console.log("Selected Branch ID:", formData.branch);

     console.log("Selected Branch ID:", formData.branch);
console.log("Branch type:", typeof formData.branch);

const response = await takebatches({
  branch: formData.branch
});

console.log("Batch API Response:", response);

      console.log("Batch API Response:", response);

      const batchList = Array.isArray(response)
        ? response
        : response?.batches || response?.data?.batches || [];

      setBatches(batchList);

    } catch (error) {
      console.error("Error fetching branch batches:", error);
      console.error("Backend error:", error.response?.data);
      setBatches([]);
    } finally {
      setBatchLoading(false);
    }
  };

  fetchBatches();
}, [formData.branch]);

  useEffect(()=>{
handleallbranch();
handleallstaff();
handleallcourse();
handleAllInterns();
  },[])

 

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "branch") {
    console.log("Selected branch value:", value);
  }

  setFormData((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "branch" ? { batch: "" } : {})
  }));
};

  // =====================================
  // HANDLE FILE UPLOAD
  // =====================================


const handleFileChange = (e) => {
  const { name, files } = e.target;

  if (!files || !files[0]) return;

  const file = files[0];

  if (name === "photo") {
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Please upload JPG or PNG image only");
      e.target.value = "";
      return;
    }
  }

  if (name === "resume") {
    if (file.type !== "application/pdf") {
      alert("Please upload PDF file only");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Resume must be less than 5MB");
      e.target.value = "";
      return;
    }
  }

  setFormData((prev) => ({
    ...prev,
    [name]: file
  }));
};


  // =====================================
  // OPEN NEW STUDENT
  // =====================================

  const openNewStudent = () => {
    setFormData({ ...initialForm });
    setEditingId(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setActiveTab("new");
  };

  // =====================================
  // OPEN STUDENT LIST
  // =====================================

  const openStudentList = () => {
    setActiveTab("list");
    setEditingId(null);
    setFormData({ ...initialForm });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // =====================================
  // CREATE / UPDATE STUDENT
  // =====================================


const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Password and Confirm Password do not match!");
    return;
  }

  try {
    const data = new FormData();

    data.append("fullName", formData.fullName.trim());
    data.append("dob", formData.dob);
    data.append("gender", formData.gender);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("whatsapp", formData.whatsapp);
    data.append("guardianName", formData.guardianName);
    data.append("fatherName", formData.fatherName);
    data.append("motherName", formData.motherName);
    data.append("parentPhone", formData.parentPhone);
    data.append("address", formData.address);
    data.append("district", formData.district);
    data.append("state", formData.state);

    data.append("course", formData.course);
    data.append("branch", formData.branch);
    data.append("startDate", formData.startDate);
    data.append("completionDate", formData.completionDate);
    data.append("batch", formData.batch);

    data.append("courseStatus", formData.courseStatus);
    data.append("careerAdvisor", formData.careerAdvisor);
    data.append("syllabusStatus", formData.syllabusStatus);
    data.append("remarks", formData.remarks);

    data.append("placementStatus", formData.placementStatus);
    data.append("linkedin", formData.linkedin);
    data.append("portfolio", formData.portfolio);
    data.append("companyName", formData.companyName);
    data.append("jobRole", formData.jobRole);

    data.append("studentEmail", formData.studentEmail);

    if (formData.password) {
      data.append("password", formData.password);
    }

    if (formData.photo instanceof File) {
      data.append("photo", formData.photo);
    }

    if (formData.resume instanceof File) {
      data.append("resume", formData.resume);
    }

    let response;

    if (editingId) {
      // UPDATE EXISTING INTERN IN DATABASE
      response = await updateintern(editingId, data);

      alert("Student updated successfully!");
    } else {
      // CREATE NEW INTERN IN DATABASE
      response = await createintern(data);

      alert("Student created successfully!");
    }

    // Refresh student list using latest backend data
    await handleAllInterns();

    setFormData({ ...initialForm });
    setEditingId(null);
    setActiveTab("list");

  } catch (error) {
    console.error("Save student error:", error);
    console.error("Backend error:", error.response?.data);

    alert(
      error.response?.data?.message ||
      "Unable to save student. Please try again."
    );
  }
};


const handleAllInterns = async () => {
  try {
    const response = await getallinterns();

    console.log("Intern API Response:", response);

    const internList = response.interns || response.data?.interns || [];

    const formattedStudents = internList.map((intern) => ({
      id: intern._id,

      // Basic Details
      fullName: intern.fullName || "",
      dob: intern.dateOfBirth?.split("T")[0] || "",
      gender: intern.gender || "",
      email: intern.email || "",
      phone: intern.internPhoneNumber || "",
      whatsapp: intern.internWhatsAppNumber || "",
      guardianName: intern.guardianName || "",
      fatherName: intern.fatherName || "",
      motherName: intern.motherName || "",
      parentPhone: intern.guardianParentPhone || "",
      address: intern.internPermanentAddress || "",
      district: intern.district || "",
      state: intern.state || "",
      photo: intern.photo || "",

      // Course
      course: intern.course?.courseName || "",
      courseId: intern.course?._id || "",

      // Branch
      branch: intern.branch?.branchName || "",
      branchId: intern.branch?._id || "",

      // Batch
      batch: intern.batch?.batchName || "",
      batchId: intern.batch?._id || "",

      // Academic Details
      startDate: intern.courseStartedDate?.split("T")[0] || "",
      completionDate: intern.completionDate?.split("T")[0] || "",
      courseStatus: intern.courseStatus || "",

      // Career Advisor
      careerAdvisor: intern.careerAdvisor?.fullName || "",
      careerAdvisorId: intern.careerAdvisor?._id || "",

      syllabusStatus: intern.internSyllabusStatus || "",
      remarks: intern.remarks || "",

      // Placement Details
      placementStatus: intern.placementStatus || "",
      linkedin: intern.linkedin || "",
      portfolio: intern.portfolio || "",
      companyName: intern.companyName || "",
      jobRole: intern.jobRole || "",
      resume: intern.resume || "",

      // Login Details
      studentEmail: intern.officialEmail || ""
    }));

    setStudents(formattedStudents);

  } catch (error) {
    console.error("Fetch Interns Error:", error);
    console.error("Error Response:", error.response?.data);
    console.error("Status:", error.response?.status);

    alert(error.response?.data?.message || error.message);
  }
};



  // =====================================
  // EDIT STUDENT
  // =====================================

 const handleEdit = (student) => {
  setFormData({
    ...initialForm,
    ...student,

    course: student.courseId || "",
    branch: student.branchId || "",
    batch: student.batchId || "",
    careerAdvisor: student.careerAdvisorId || "",

    password: "",
    confirmPassword: ""
  });

  setEditingId(student.id);
  setSelectedStudent(null);
  setActiveTab("new");
};

  // =====================================
  // DELETE STUDENT
  // =====================================

  const handleDelete = async(id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
      
      let response=await handledeleteintern(id)
      await handleAllInterns()

      setSelectedStudent(null);
    }
  };

  // =====================================
  // SEARCH AND FILTER
  // =====================================

  const filteredStudents = students.filter((student) => {

    const searchValue = search.toLowerCase().trim();

    const matchesSearch =
      student.fullName?.toLowerCase().includes(searchValue) ||
      student.phone?.toLowerCase().includes(searchValue) ||
      student.email?.toLowerCase().includes(searchValue) ||
      student.studentEmail?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "All" ||
      student.courseStatus === statusFilter;

    const matchesBranch =
      branchFilter === "All" ||
      student.branch === branchFilter;

    const matchesBatch =
      batchFilter === "All" ||
      student.batch === batchFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBranch &&
      matchesBatch
    );
  });

  // =====================================
  // EXPORT CSV
  // =====================================

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      alert("No students available to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Course",
      "Branch",
      "Batch",
      "Status"
    ];

    const rows = filteredStudents.map((student) => [
      student.fullName,
      student.email,
      student.phone,
      student.course,
      student.branch,
      student.batch,
      student.courseStatus
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) =>
          `"${String(value || "").replace(/"/g, '""')}"`
        ).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "students-list.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // =====================================
  // COMMON FIELD PROPS
  // =====================================

  const fieldProps = {
    formData,
    handleChange
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <div className="internmanagement">

      {/* HEADER */}

      
      {/* MAIN CARD */}

      <div className="intern-hero">

        {/* TOP TABS */}

        <div className="intern-hero0">

          <div className="intern-hero1">

            <button
              type="button"
              className={activeTab === "list" ? "active" : ""}
              onClick={openStudentList}
            >
              Students List
            </button>

            <button
              type="button"
              className={activeTab === "new" ? "active" : ""}
              onClick={openNewStudent}
            >
              {editingId ? "Edit Student" : "New Student"}
            </button>

          </div>

        </div>

        {/* =====================================
            STUDENT LIST
        ===================================== */}

        {activeTab === "list" && (

          <>

            {/* FILTER */}

          <div className="intern-filter">

            <div className="intern-search">
              <FiSearch />

              <input
                type="text"
                placeholder="Search Students"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Dropped">Dropped</option>
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="All">All Branches</option>

              {[...new Set(
                students.map((s) => s.branch).filter(Boolean)
              )].map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              <option value="All">All Batches</option>

              {[...new Set(
                students.map((s) => s.batch).filter(Boolean)
              )].map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="intern-export"
              onClick={handleExport}
            >
              <FiDownload />
              Export
            </button>

          </div>

          {/* TABLE */}

          <div className="intern-table-wrapper">

            <table className="intern-table">

              <thead>
                <tr>
                  <th>NAME</th>
                  <th>COURSE</th>
                  <th>BRANCH</th>
                  <th>BATCH</th>
                  <th>STATUS</th>
                  <th>MENTOR CARD</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredStudents.length > 0 ? (

                  filteredStudents.map((student) => (

                    <tr key={student.id}>

                      <td>
                        <div className="intern-student-name">

                          <div className="intern-avatar">
                            {student.fullName?.charAt(0) || "S"}
                          </div>

                          <div>
                            <strong>{student.fullName}</strong>
                            <span>{student.phone}</span>
                          </div>

                        </div>
                      </td>

                      <td>{student.course || "-"}</td>
                      <td>{student.branch || "-"}</td>
                      <td>{student.batch || "-"}</td>

                      <td>
                        <span
                          className={`intern-status ${
                            student.courseStatus?.toLowerCase() || ""
                          }`}
                        >
                          {student.courseStatus || "-"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="intern-card-link"
                          onClick={() => setSelectedStudent(student)}
                        >
                          View Card
                        </button>
                      </td>

                      <td>
                        <div className="intern-actions">

                          <button
                            type="button"
                            className="intern-view"
                            onClick={() => setSelectedStudent(student)}
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="intern-edit"
                            onClick={() => handleEdit(student)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="intern-delete"
                            onClick={() => handleDelete(student.id)}
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td colSpan="7" className="intern-empty">
                      No students found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="intern-pagination">

            <span>
              {filteredStudents.length} Students
            </span>

            <button type="button" disabled>
              <FiChevronLeft />
            </button>

            <button type="button" disabled>
              <FiChevronRight />
            </button>

          </div>

        </>

      )}

      {/* =====================================
          NEW STUDENT FORM
      ===================================== */}

      {activeTab === "new" && (

        <form
          className="intern-form-container"
          onSubmit={handleSubmit}
        >

          <div className="intern-create-heading">

            <h3>
              {editingId ? "Edit Student" : "Create New Student"}
            </h3>

            <p>Fill in the student enrollment and personal details below</p>

          </div>

          {/* BASIC DETAILS */}

          <h4>Basic Details</h4>

          <div className="intern-form-grid">

            <InputField
              {...fieldProps}
              label="Full Name"
              name="fullName"
              placeholder="Enter full name"
              required
            />

            <InputField
              {...fieldProps}
              label="Date of Birth"
              name="dob"
              type="date"
              required
            />

            <SelectField
              {...fieldProps}
              label="Gender"
              name="gender"
              placeholder="Choose Gender"
              options={["Male", "Female", "Other"]}
              required
            />

            <InputField
              {...fieldProps}
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter Email Address"
              required
            />

            <InputField
              {...fieldProps}
              label="Student Phone Number"
              name="phone"
              placeholder="Enter Student Phone Number"
              required
            />

            <InputField
              {...fieldProps}
              label="Student WhatsApp Number"
              name="whatsapp"
              placeholder="Enter Student WhatsApp Number"
            />

            <InputField
              {...fieldProps}
              label="Guardian's Name"
              name="guardianName"
              placeholder="Enter Student Guardian's Name"
            />

            <InputField
              {...fieldProps}
              label="Father's Name"
              name="fatherName"
              placeholder="Enter Father's Name"
            />

            <InputField
              {...fieldProps}
              label="Student Permanent Address"
              name="address"
              placeholder="Enter Student Permanent Address"
            />

            <InputField
              {...fieldProps}
              label="Mother's Name"
              name="motherName"
              placeholder="Enter Student Mother's Name"
            />

            <InputField
              {...fieldProps}
              label="Guardians/Parent Phone Number"
              name="parentPhone"
              placeholder="Enter Guardians/Parent Phone Number"
              optional
            />

            <InputField
              {...fieldProps}
              label="District"
              name="district"
              placeholder="Enter Student District"
            />

            <InputField
              {...fieldProps}
              label="State"
              name="state"
              placeholder="Enter Student State"
            />

            <div className="intern-field">
              <label>
                Photo{" "}
                <span className="intern-optional">
                  (Photo format: JPG/PNG only)
                </span>
              </label>

              <label className="intern-file-upload">
              <span>{formData.photo?.name || formData.photo || "Upload Photo"}</span>
                <FiUpload />

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  name="photo"
                  onChange={handleFileChange}
                />
              </label>
            </div>

          </div>

          {/* ACADEMIC DETAILS */}

          <h4>Academic Details</h4>

          <div className="intern-form-grid">

          <div className="intern-field">
  <label htmlFor="course">
    Course <span className="intern-required">*</span>
  </label>

  <select
    id="course"
    name="course"
    value={formData.course}
    onChange={handleChange}
    required
  >
    <option value="">Choose Course</option>

    {course.map((item) => (
      <option key={item._id} value={item._id}>
        {item.courseName}
      </option>
    ))}
  </select>
</div>

          <div className="intern-field">
  <label htmlFor="branch">Branch <span className="intern-required">*</span></label>

  <select
    id="branch"
    name="branch"
    value={formData.branch}
    onChange={handleChange}
    required
  >
    <option value="">Choose Branch</option>

    {branch.map((item) => (
      <option key={item._id} value={item._id}>
        {item.branchName}
      </option>
    ))}
  </select>
</div>

            <InputField
              {...fieldProps}
              label="Course Started Date"
              name="startDate"
              type="date"
              required
            />

            <InputField
              {...fieldProps}
              label="Completion Date"
              name="completionDate"
              type="date"
            />

           <div className="intern-field">
  <label htmlFor="batch">
    Batch <span className="intern-required">*</span>
  </label>

  <select
    id="batch"
    name="batch"
    value={formData.batch}
    onChange={handleChange}
    disabled={!formData.branch || batchLoading}
    required
  >
    <option value="">
      {!formData.branch
        ? "Select Branch First"
        : batchLoading
        ? "Loading Batches..."
        : batches.length === 0
        ? "No Batches Available"
        : "Choose Batch"}
    </option>

    {batches.map((item) => (
      <option key={item._id} value={item._id}>
        {item.batchName}
      </option>
    ))}
  </select>
</div>

            <SelectField
              {...fieldProps}
              label="Course Status"
              name="courseStatus"
              placeholder="Choose Course Status"
              options={[
                "Ongoing",
                "Completed",
                "Dropped"
              ]}
            />

            {/* <SelectField
              {...fieldProps}
              label="Career Advisor"
              name="careerAdvisor"
              placeholder="Choose Career Advisor"
              options={[
                "Vijitha",
                "Vinisha",
                "Rahul",
                "Anjali"
              ]}
            /> */}
      <div className="intern-field">
  <label htmlFor="careerAdvisor">Career Advisor</label>

  <select
    id="careerAdvisor"
    name="careerAdvisor"
    value={formData.careerAdvisor}
    onChange={handleChange}
  >
    <option value="">Choose Career Advisor</option>

    {roles.map((item) => (
      <option key={item._id} value={item._id}>
        {item.fullName}
      </option>
    ))}
  </select>
</div>

           <SelectField
  {...fieldProps}
  label="Student Syllabus Status"
  name="syllabusStatus"
  placeholder="Choose Syllabus Status"
  options={[
    "Not Started",
    "Learning",
    "mini Project",
    "Main Project"
  ]}
/>
            

            <InputField
              {...fieldProps}
              label="Remarks/Notes"
              name="remarks"
              placeholder="Enter Any Remarks or notes"
              optional
            />

          </div>

          {/* PLACEMENT INFORMATION */}

          <h4>
            Placement Information{" "}
            <span className="intern-optional">(Optional)</span>
          </h4>

          <div className="intern-form-grid">

            <SelectField
              {...fieldProps}
              label="Placement Status"
              name="placementStatus"
              placeholder="Choose Placement Status"
             options={[
  "To be started",
  "In Progress",
  "Offer Declined",
  "Placed",
  "Not Placed"
]}
            />

            <InputField
              {...fieldProps}
              label="LinkedIn"
              name="linkedin"
              placeholder="Enter LinkedIn Link"
            />

            <InputField
              {...fieldProps}
              label="Portfolio"
              name="portfolio"
              placeholder="Enter Portfolio Link"
            />

            <InputField
              {...fieldProps}
              label="Company Name"
              name="companyName"
              placeholder="Enter Company Name"
              optional
            />

            <InputField
              {...fieldProps}
              label="Job Role"
              name="jobRole"
              placeholder="Enter Job Role"
              optional
            />

            <div className="intern-field">
              <label>
                Resume{" "}
                <span className="intern-optional">
                  (Upload PDF only Max 5MB)
                </span>
              </label>

              <label className="intern-file-upload">
               <span>{formData.resume?.name || formData.resume || "Upload resume"}</span>
                <FiUpload />

                <input
                  type="file"
                  accept="application/pdf"
                  name="resume"
                  onChange={handleFileChange}
                />
              </label>
            </div>

          </div>

          {/* LOGIN & ACCESS */}

          <h4>Login & Access</h4>

          <div className="intern-form-grid">

            <InputField
              {...fieldProps}
              label="Student Email Address"
              name="studentEmail"
              type="email"
              placeholder="Enter Student Email Address"
              required
            />

            <div className="intern-field">
              <label>
                Create Password
                {!editingId && (
                  <span className="intern-required"> *</span>
                )}
              </label>

              <div className="intern-password">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create A Password"
                  required={!editingId}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <FiEye />
                </button>
              </div>
            </div>

            <div className="intern-field">
              <label>
                Confirm Password
                {!editingId && (
                  <span className="intern-required"> *</span>
                )}
              </label>

              <div className="intern-password">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-Enter The Password"
                  required={!editingId}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                >
                  <FiEye />
                </button>
              </div>
            </div>

          </div>

          {/* BUTTONS */}

          <div className="intern-form-buttons">

            <button
              type="button"
              className="intern-cancel"
              onClick={openStudentList}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="intern-submit"
            >
              {editingId ? "Update Student" : "Create Student"}
            </button>

          </div>

        </form>

      )}

      </div>

      {/* =====================================
          STUDENT DETAILS MODAL
      ===================================== */}

      {selectedStudent && (

        <div
          className="intern-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >

          <div
            className="intern-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="intern-modal-header">
              <h3>Student Details</h3>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
              >
                <FiX />
              </button>
            </div>

            <div className="intern-modal-profile">

              <div className="intern-modal-avatar">
                {selectedStudent.fullName?.charAt(0)}
              </div>

              <h3>{selectedStudent.fullName}</h3>
              <p>{selectedStudent.course}</p>

            </div>

            <div className="intern-modal-details">

              {[
                ["Phone Number", selectedStudent.phone],
                ["Email Address", selectedStudent.email],
                ["Gender", selectedStudent.gender],
                ["Date of Birth", selectedStudent.dob],
                ["WhatsApp", selectedStudent.whatsapp],
                ["Address", selectedStudent.address],
                ["Branch", selectedStudent.branch],
                ["Batch", selectedStudent.batch],
                ["Course Status", selectedStudent.courseStatus],
                ["Course Started", selectedStudent.startDate],
                ["Completion Date", selectedStudent.completionDate],
                ["Student Email", selectedStudent.studentEmail],
                ["Guardian Name", selectedStudent.guardianName],
                ["Father's Name", selectedStudent.fatherName],
                ["Mother's Name", selectedStudent.motherName],
                ["District", selectedStudent.district],
                ["State", selectedStudent.state],
                ["Career Advisor", selectedStudent.careerAdvisor],
                ["Syllabus Status", selectedStudent.syllabusStatus],
                ["Placement Status", selectedStudent.placementStatus],
                ["Company Name", selectedStudent.companyName],
                ["Job Role", selectedStudent.jobRole]
              ].map(([label, value]) => (

                <div className="intern-modal-row" key={label}>
                  <span>{label}</span>
                  <strong>{value || "-"}</strong>
                </div>

              ))}

            </div>

            <div className="intern-modal-buttons">

              <button
                type="button"
                onClick={() => handleEdit(selectedStudent)}
              >
                <FiEdit /> Edit
              </button>

              <button
                type="button"
                onClick={() => handleDelete(selectedStudent.id)}
              >
                <FiTrash2 /> Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Internmanagement;
