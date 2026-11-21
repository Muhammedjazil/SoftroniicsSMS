
import { useState } from "react";
import { useEffect } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";
import "./settingsbranch.css";
import {
  FiUser,
  FiDownload,
  FiEye,
  FiEdit,
  FiTrash2,
  FiArrowLeft
} from "react-icons/fi";

export const Branch = () => {

  const {
    takebranch,
    takebranchbyid,
    createbranch,
    updatebranch,
    removebranch
  } = AdminService();

  // Active section
  const [isactive, setIsactive] = useState("Branch");

  // Branch data
  const [allData, setAlldata] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    branch: "",
    location: ""
  });

  // Selected index
  const [selectedBranchId, setSelectedBranchId] = useState(null);


  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================

  const handlecgange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };


  // =====================================
  // NEW BRANCH
  // =====================================

  const handlenew = () => {

    setFormData({
      branch: "",
      location: ""
    });

    setSelectedBranchId(null);

    setIsactive("Newbranch");
  };


  // =====================================
  // CREATE BRANCH
  // =====================================

  const handlesave = async () => {
    if (!formData.branch.trim() || !formData.location.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createbranch({
        branchName: formData.branch.trim(),
        location: formData.location.trim(),
        batchType: "Regular"
      });

      alert("Branch created successfully");

      await fetchBranches();
      handlecancel();

    } catch (error) {
      console.error("Create branch error:", error);
      alert(error.response?.data?.message || "Failed to create branch");
    }
  };

  // =====================================
  // VIEW BRANCH
  // =====================================

  const handleview = async (id) => {
    try {
      const response = await takebranchbyid(id);

      setSelectedBranchId(id);

      setFormData({
        branch: response.branchName,
        location: response.location
      });

      setIsactive("Viewbranch");

    } catch (error) {
      console.error(error);
      alert("Failed to fetch branch details");
    }
  };


  // =====================================
  // EDIT BRANCH
  // =====================================

  const handleedit = async (id) => {
    try {
      const response = await takebranchbyid(id);

      setSelectedBranchId(id);

      setFormData({
        branch: response.branchName,
        location: response.location
      });

      setIsactive("Editbranch");

    } catch (error) {
      console.error(error);
      alert("Failed to fetch branch details");
    }
  };


  // =====================================
  // UPDATE BRANCH
  // =====================================

  const handleupdate = async () => {
  if (!formData.branch.trim() || !formData.location.trim()) {
    alert("Please fill all fields");
    return;
  }

  try {
    await updatebranch(selectedBranchId, {
      branchName: formData.branch.trim(),
      location: formData.location.trim()
    });

    alert("Branch updated successfully");

    await fetchBranches();
    handlecancel();

  } catch (error) {
    console.error("Update branch error:", error);
    alert(error.response?.data?.message || "Failed to update branch");
  }
};


  // =====================================
  // DELETE BRANCH
  // =====================================

  
const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to permanently delete this branch?"
  );

  if (!confirmDelete) return;

  try {
    const result = await removebranch(id);

    alert(result.message);

    await fetchBranches();

  } catch (error) {
    console.error("Delete branch error:", error);

    const response = error.response?.data;

    if (error.response?.status === 409) {
      const dependencies = response.dependencies;

      alert(
        `${response.message}\n\n` +
        `Batches: ${dependencies.batches}\n` +
        `Timings: ${dependencies.timings}\n` +
        `Weekly Schedules: ${dependencies.weeklySchedules}`
      );
    } else {
      alert(response?.message || "Failed to delete branch");
    }
  }
};


  // =====================================
  // CANCEL / BACK
  // =====================================

  const handlecancel = () => {

    setFormData({
      branch: "",
      location: ""
    });

    setSelectedBranchId(null);

    setIsactive("Branch");
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await takebranch();
      setAlldata(response);
    } catch (error) {
      console.error("Error fetching branches:", error);
      alert("Failed to fetch branches");
    }
  };


  // =====================================
  // RETURN JSX
  // =====================================

  return (

    <div className="Branch">

      {/* =====================================
          HEADER
      ===================================== */}

      


      {/* =====================================
          MAIN SECTION
      ===================================== */}

      <div className="branchherosection">


        {/* =====================================
            STATIC BUTTONS
            ALWAYS VISIBLE
        ===================================== */}


        <div className="branchherobutton">

          <button
            className={isactive === "Branch" ? "branchon" : "branchoff"}
            onClick={handlecancel}
          >
            Branch's
          </button>

          <button
            className={isactive === "Newbranch" ? "branchon" : "branchoff"}
            onClick={handlenew}
          >
            New Branch
          </button>

          <button
            className="branchexport"
            style={{
              visibility: isactive === "Branch" ? "visible" : "hidden"
            }}
          >
            Export <FiDownload />
          </button>

        </div>


        {/* =====================================
            BRANCH TABLE
        ===================================== */}

        {isactive === "Branch" && (

          <div className="branchbranch">

            <table className="branchtable">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Branch Name</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>


              <tbody>

                {allData.map((value, index) => (

                  <tr key={index}>

                    <td>{index + 1}</td>

                    {/* <td>{value.branch}</td> */}
                    <td>{value.branchName}</td>

                    <td>{value.location}</td>

                    <td className="branchactions">

                      <FiEye onClick={() => handleview(value._id)} />

                      <FiEdit onClick={() => handleedit(value._id)} />

                      <FiTrash2 onClick={() => handleDelete(value._id)} />

                    </td>

                  </tr>

                ))}


                {/* EMPTY TABLE */}

                {allData.length === 0 && (

                  <tr>
                    <td colSpan="4" className="branchnodata">
                      No Branch Found
                    </td>
                  </tr>

                )}

              </tbody>

            </table>


            {/* PAGINATION */}

            <div className="branchpagination">

              <span>
                {allData.length === 0
                  ? "0 of 0"
                  : `1 of ${allData.length}`}
              </span>

              <button disabled>‹</button>
              <button disabled>›</button>

            </div>

          </div>

        )}


        {/* =====================================
            NEW / VIEW / EDIT FORM
        ===================================== */}

        {(isactive === "Newbranch" ||
          isactive === "Viewbranch" ||
          isactive === "Editbranch") && (

            <div className="branchformsection">


              {/* FORM HEADER */}

              <div className="branchformhead">

                <h2>

                  {isactive === "Newbranch" && "New Branch"}

                  {isactive === "Viewbranch" &&
                    `${formData.branch} Branch`}

                  {isactive === "Editbranch" &&
                    `Edit ${formData.branch} Branch`}

                </h2>


                <button
                  className="branchback"
                  onClick={handlecancel}
                >
                  <FiArrowLeft /> Back
                </button>

              </div>


              {/* FORM INPUTS */}

              <div className="branchformfields">


                {/* BRANCH NAME */}

                <div className="branchformgroup">

                  <label>Branch Name</label>

                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handlecgange}
                    placeholder="Enter branch name"
                    disabled={isactive === "Viewbranch"}
                  />

                </div>


                {/* LOCATION */}

                <div className="branchformgroup">

                  <label>Location</label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handlecgange}
                    placeholder="Enter location"
                    disabled={isactive === "Viewbranch"}
                  />

                </div>

              </div>


              {/* FORM BUTTONS */}

              <div className="branchformbuttons">

                <button
                  className="branchcancel"
                  onClick={handlecancel}
                >
                  Cancel
                </button>


                {/* CREATE BUTTON */}

                {isactive === "Newbranch" && (

                  <button
                    className="branchcreate"
                    onClick={handlesave}
                  >
                    Create Branch
                  </button>

                )}


                {/* VIEW EDIT BUTTON */}

                {isactive === "Viewbranch" && (

                  <button
                    className="branchcreate"
                    onClick={() => setIsactive("Editbranch")}
                  >
                    Edit
                  </button>

                )}


                {/* UPDATE BUTTON */}

                {isactive === "Editbranch" && (

                  <button
                    className="branchcreate"
                    onClick={handleupdate}
                  >
                    Save Changes
                  </button>

                )}

              </div>

            </div>

          )}

      </div>

    </div>

  );

};
