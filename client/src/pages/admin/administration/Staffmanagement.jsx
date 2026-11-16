
import { useState } from "react";

import {
  FiUser,
  FiChevronRight,
  FiChevronLeft,
  FiSearch,
  FiArrowLeft,
  FiX,
  FiClock
} from "react-icons/fi";

import react from "../../../assets/react.svg";
import "./staffmanagement.css";

// =====================================
// OPTIONS
// =====================================

const timingOptions = [
  "09:30 AM - 12:00 PM",
  "11:00 AM - 01:30 PM",
  "02:00 PM - 05:00 PM",
  "08:30 AM - 11:00 AM"
];

const branchOptions = [
  "calicut",
  "perinthalmanna",
  "palakkad",
  "kochi"
];

// =====================================
// INITIAL FORM DATA
// =====================================

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

  typeemply: "",
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
// MAIN COMPONENT
// =====================================

export const Staffmanagement = () => {

  const [search, setSearch] = useState("");

  const [allData, setAlldata] = useState([]);

  const [formData, setFormData] = useState({
    ...initialForm
  });

  const [activetap, setActiveTab] = useState("stafflist");

  const [view, setView] = useState(null);

  const [editId, setEditId] = useState(null);

  const [selectedTiming, setSelectedTiming] = useState("");

  // =====================================
  // FILTER STAFF
  // =====================================

  const filteredStaff = allData.filter((value) =>
    `${value.fullname} ${value.email} ${value.typeemply} ${value.branch}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

    setFormData((prev) => {

      // When main branch changes,
      // remove it from additional branches.

      if (name === "branch") {

        return {
          ...prev,
          branch: value,
          additionalBranches: prev.additionalBranches.filter(
            (branch) => branch !== value
          )
        };
      }

      return {
        ...prev,
        [name]:
          type === "file"
            ? files[0]
            : type === "checkbox"
            ? checked
            : value
      };

    });
  };

  // =====================================
  // ALLOW ADDITIONAL BRANCHES
  // =====================================

  const handleAdditionalBranchToggle = (e) => {

    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      allowAdditionalBranches: checked,

      // Clear branches when disabled
      additionalBranches: checked
        ? prev.additionalBranches
        : []
    }));

  };

  // =====================================
  // SELECT / UNSELECT ADDITIONAL BRANCH
  // =====================================

  const handleAdditionalBranchChange = (e) => {

    const { value, checked } = e.target;

    setFormData((prev) => {

      let updatedBranches;

      if (checked) {

        updatedBranches = [
          ...prev.additionalBranches,
          value
        ];

      } else {

        updatedBranches = prev.additionalBranches.filter(
          (branch) => branch !== value
        );

      }

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
      mentorTimings: checked
        ? prev.mentorTimings
        : []
    }));

    setSelectedTiming("");

  };

  // =====================================
  // ADD MENTOR TIMING
  // =====================================

  const handleTimingChange = (e) => {

    const timing = e.target.value;

    if (!timing) return;

    setFormData((prev) => ({
      ...prev,

      mentorTimings: prev.mentorTimings.includes(timing)
        ? prev.mentorTimings
        : [...prev.mentorTimings, timing]

    }));

    setSelectedTiming("");

  };

  // =====================================
  // REMOVE MENTOR TIMING
  // =====================================

  const removeTiming = (timingToRemove) => {

    setFormData((prev) => ({
      ...prev,

      mentorTimings: prev.mentorTimings.filter(
        (timing) => timing !== timingToRemove
      )

    }));

  };

  // =====================================
  // CREATE / UPDATE STAFF
  // =====================================

  const handleCreateStaff = (e) => {

    e.preventDefault();

    if (
      !editId ||
      formData.password ||
      formData.conformpassword
    ) {

      if (formData.password !== formData.conformpassword) {
        alert("Password and Confirm Password do not match!");
        return;
      }

    }

    if (editId !== null) {

      setAlldata((prev) =>
        prev.map((item) =>
          item.id === editId
            ? { ...formData, id: editId }
            : item
        )
      );

      alert("Staff updated successfully!");

    } else {

      const newStaff = {
        ...formData,
        id: Date.now()
      };

      setAlldata((prev) => [...prev, newStaff]);

      alert("Staff created successfully!");

    }

    resetForm();
    setEditId(null);
    setView(null);
    setActiveTab("stafflist");

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

    setFormData({
      ...initialForm,
      ...view,

      additionalBranches: view.additionalBranches || [],

      allowAdditionalBranches:
        view.allowAdditionalBranches || false,

      mentorTimings: view.mentorTimings || []
    });

    setSelectedTiming("");
    setEditId(view.id);
    setActiveTab("newstaff");

  };

  // =====================================
  // DELETE STAFF
  // =====================================

  const handleDelete = (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff?"
    );

    if (confirmDelete) {

      setAlldata((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setView(null);

    }

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
            Staff Management &gt;{" "}
            {activetap === "stafflist"
              ? "staffList"
              : activetap === "newstaff"
              ? "newStaff"
              : "staffView"}
          </p>

        </div>

        <div className="staffadminprofile">

          <div className="stafficon">
            <FiUser />
          </div>

          <div className="staffadminname">
            <h5>vijitha</h5>
            <p>super admin</p>
          </div>

        </div>

      </div>

      {/* TOP BUTTONS */}

      <div className="staffbuttons">

        <button
          type="button"
          className={
            activetap === "stafflist"
              ? "stafflistactive"
              : "staffnew"
          }
          onClick={handlestafflist}
        >
          Staff List
        </button>

        <button
          type="button"
          className={
            activetap === "newstaff"
              ? "stafflistactive"
              : "staffnew"
          }
          onClick={handlenewstaff}
        >
          {editId !== null ? "Edit Staff" : "New Staff"}
        </button>

      </div>

      {/* =====================================
          STAFF LIST
      ===================================== */}

      {activetap === "stafflist" && (

        <div className="stafffull">

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

              <select defaultValue="all">

                <option value="all">All Departments</option>
                <option value="uiux">UI/UX</option>
                <option value="mern">MERN</option>
                <option value="python">Python</option>
                <option value="datascience">Data Science</option>

              </select>

            </div>

            <div className="staffbranch">

              <select defaultValue="all">

                <option value="all">All Branches</option>
                <option value="calicut">Calicut</option>
                <option value="palakkad">Palakkad</option>
                <option value="thrissur">Thrissur</option>
                <option value="perinthalmanna">Perinthalmanna</option>

              </select>

            </div>

            <div className="staffactive">

              <select defaultValue="all">

                <option value="all">All Roles</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>

              </select>

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
                          {value.fullname.charAt(0).toUpperCase()}
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

                    <td>{value.typeemply}</td>

                    <td className="staffbranchname">
                      {value.branch}
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
                              additionalBranches: value.additionalBranches || [],
                              allowAdditionalBranches: value.allowAdditionalBranches || false,
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

            {/* PAGINATION */}

            <div className="staffpageend">

              <div className="staffpageinfo">

                <p>
                  Showing 1 to {filteredStaff.length} of{" "}
                  {filteredStaff.length} results
                </p>

              </div>

              <div className="staffprevnext">

                <button type="button" disabled>
                  <FiChevronLeft />
                  Previous
                </button>

                <span>Page 1 of 1</span>

                <button type="button" disabled>
                  Next
                  <FiChevronRight />
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================
          NEW STAFF FORM
      ===================================== */}

      {activetap === "newstaff" && (

        <div className="newstaff">

          <h2>
            {editId !== null
              ? "Edit Staff"
              : "Create New Staff"}
          </h2>

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
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

              </div>

              <div className="stafffield">

                <label>Email Address <span>*</span></label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  placeholder="Enter Email Address"
                  required
                  onChange={handlecreate}
                />

              </div>

              <div className="stafffield">

                <label>Staff Phone Number <span>*</span></label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  placeholder="Enter Staff Phone Number"
                  required
                  onChange={handlecreate}
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

                  <label>Department <span>*</span></label>

                  <select
                    required
                    name="department"
                    value={formData.department}
                    onChange={handlecreate}
                  >

                    <option value="">Choose Department</option>
                    <option value="ui/ux">UI/UX</option>
                    <option value="mern">MERN</option>
                    <option value="python">Python</option>
                    <option value="datascience">Data Science</option>

                  </select>

                </div>

                {/* EMPLOYEE TYPE */}

                <div className="staffprofessionalfield">

                  <label>Type of Employee <span>*</span></label>

                  <select
                    required
                    name="typeemply"
                    value={formData.typeemply}
                    onChange={handlecreate}
                  >

                    <option value="">Choose Role</option>
                    <option value="Career Advisor">Career Advisor</option>
                    <option value="mentor">Mentor</option>
                    <option value="accountant">Accountant</option>

                    <option value="placement coordinator">
                      Placement Coordinator
                    </option>

                    <option value="branch admin">Branch Admin</option>

                  </select>

                </div>

                {/* MAIN BRANCH */}

                <div className="staffprofessionalfield">

                  <label>Branch <span>*</span></label>

                  <select
                    required
                    name="branch"
                    value={formData.branch}
                    onChange={handlecreate}
                  >

                    <option value="">Choose Branch</option>

                    {branchOptions.map((branch) => (

                      <option
                        key={branch}
                        value={branch}
                      >
                        {branch}
                      </option>

                    ))}

                  </select>

                  {/* ALLOW ADDITIONAL BRANCHES */}

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

                {/* =====================================
                    ADDITIONAL BRANCHES SECTION
                    SHOW ONLY WHEN CHECKED
                ===================================== */}

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
                        .filter(
                          (branch) => branch !== formData.branch
                        )
                        .map((branch) => (

                          <label
                            key={branch}
                            className="staff-additional-option"
                          >

                            <input
                              type="checkbox"
                              value={branch}
                              checked={formData.additionalBranches.includes(branch)}
                              onChange={handleAdditionalBranchChange}
                            />

                            <span>{branch}</span>

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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>

                  </select>

                </div>

                {/* RESIGNATION DATE */}

                <div className="staffprofessionalfield">

                  <label>
                    Resignation Date{" "}
                    <span className="optional">
                      (Only If Inactive)
                    </span>
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

              {/* =====================================
                  MENTOR ROLE
              ===================================== */}

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
                            key={timing}
                            value={timing}
                            disabled={formData.mentorTimings.includes(timing)}
                          >
                            {timing}
                          </option>

                        ))}

                      </select>

                    </div>

                    <div className="staff-selected-timings">

                      <label>Selected Timings</label>

                      <div className="staff-timing-chips">

                        {formData.mentorTimings.length > 0 ? (

                          formData.mentorTimings.map((timing) => (

                            <div
                              className="staff-timing-chip"
                              key={timing}
                            >

                              <FiClock />

                              <span>{timing}</span>

                              <button
                                type="button"
                                onClick={() => removeTiming(timing)}
                                aria-label={`Remove ${timing}`}
                              >
                                <FiX />
                              </button>

                            </div>

                          ))

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

                  <label>Staff Official Email Address</label>

                  <input
                    type="email"
                    placeholder="Enter Staff Official Email Address"
                    name="officialemail"
                    value={formData.officialemail}
                    onChange={handlecreate}
                  />

                </div>

                <div className="stafflog">

                  <label>Create Password</label>

                  <input
                    type="password"
                    placeholder="Enter staff Password"
                    name="password"
                    value={formData.password}
                    onChange={handlecreate}
                  />

                </div>

                <div className="stafflog">

                  <label>Confirm Password</label>

                  <input
                    type="password"
                    placeholder="Enter Staff Confirm Password"
                    name="conformpassword"
                    value={formData.conformpassword}
                    onChange={handlecreate}
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

              {editId !== null ? (

                <button
                  type="submit"
                  className="staffbtnupdate"
                >
                  Update
                </button>

              ) : (

                <button
                  type="submit"
                  className="staffformbuttoncreate"
                >
                  Create Staff
                </button>

              )}

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
                  <h4>Mentor Phone Number</h4>
                  <p>{view.phone || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Mentor WhatsApp Number</h4>
                  <p>{view.whatsapp || "-"}</p>
                </div>

                <div className="staffviewfield">
                  <h4>Mentor Permanent Address</h4>
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
                    view.photo instanceof File
                      ? URL.createObjectURL(view.photo)
                      : view.photo || react
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
                <p>{view.typeemply || "-"}</p>
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

            {/* ADDITIONAL BRANCHES IN VIEW */}

            {view.allowAdditionalBranches && (

              <div className="staff-view-mentor">

                <h3 className="staffviewtitle">
                  Additional Branches
                </h3>

                <div className="staff-additional-options">

                  {(view.additionalBranches || []).length > 0 ? (

                    view.additionalBranches.map((branch) => (

                      <div
                        className="staff-additional-option"
                        key={branch}
                      >
                        <span>{branch}</span>
                      </div>

                    ))

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

                    view.mentorTimings.map((timing) => (

                      <div
                        className="staff-timing-chip"
                        key={timing}
                      >

                        <FiClock />

                        <span>{timing}</span>

                      </div>

                    ))

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

  );

};

export default Staffmanagement;
