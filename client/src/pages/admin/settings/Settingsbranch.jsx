
import { useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(null);


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

    setSelectedIndex(null);

    setIsactive("Newbranch");
  };


  // =====================================
  // CREATE BRANCH
  // =====================================

  const handlesave =() => {

    if (!formData.branch.trim() || !formData.location.trim()) {
      alert("Please fill all fields");
      return;
    }

    setAlldata((prev) => [
      ...prev,
      {
        branch: formData.branch.trim(),
        location: formData.location.trim()
      }
    ]);
   

    setFormData({
      branch: "",
      location: ""
    });

    setIsactive("Branch");
  };


  // =====================================
  // VIEW BRANCH
  // =====================================

  const handleview = (index) => {

    setSelectedIndex(index);

    setFormData({
      ...allData[index]
    });

    setIsactive("Viewbranch");
  };


  // =====================================
  // EDIT BRANCH
  // =====================================

  const handleedit = (index) => {

    setSelectedIndex(index);

    setFormData({
      ...allData[index]
    });

    setIsactive("Editbranch");
  };


  // =====================================
  // UPDATE BRANCH
  // =====================================

  const handleupdate = () => {

    if (!formData.branch.trim() || !formData.location.trim()) {
      alert("Please fill all fields");
      return;
    }

    setAlldata((prev) =>
      prev.map((value, index) =>
        index === selectedIndex
          ? {
              branch: formData.branch.trim(),
              location: formData.location.trim()
            }
          : value
      )
    );

    setFormData({
      branch: "",
      location: ""
    });

    setSelectedIndex(null);

    setIsactive("Branch");
  };


  // =====================================
  // DELETE BRANCH
  // =====================================

  const handledelete = (index) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this branch?"
    );

    if (confirmDelete) {

      setAlldata((prev) =>
        prev.filter((value, i) => i !== index)
      );

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

    setSelectedIndex(null);

    setIsactive("Branch");
  };


  // =====================================
  // RETURN JSX
  // =====================================

  return (

    <div className="Branch">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="branchheadsection">

        <div className="branchhead">
          <h2>Settings</h2>
          <p>Settings &gt; Branch</p>
        </div>

        <div className="branchprofile">

          <div className="branchproficon">
            <FiUser />
          </div>

          <div className="branchprofdata">
            <h5>Preyesh</h5>
            <h6>Super Admin</h6>
          </div>

        </div>

      </div>


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

                    <td>{value.branch}</td>

                    <td>{value.location}</td>

                    <td className="branchactions">

                      <FiEye
                        className="branchview"
                        onClick={() => handleview(index)}
                      />

                      <FiEdit
                        className="branchedit"
                        onClick={() => handleedit(index)}
                      />

                      <FiTrash2
                        className="branchdelete"
                        onClick={() => handledelete(index)}
                      />

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
