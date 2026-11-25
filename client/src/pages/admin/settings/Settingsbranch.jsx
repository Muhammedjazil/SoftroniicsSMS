import { useState, useEffect, useMemo } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";
import Loader from "../../../components/common/Loader";
import { useToast } from "../../../components/common/Toast";
import "./settingsbranch.css";
import {
  FiDownload,
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { LuSearch } from "react-icons/lu";

export const Branch = () => {
  const { showToast, ToastContainer } = useToast();

  const {
    takebranch,
    takebranchbyid,
    createbranch,
    updatebranch,
    removebranch,
  } = AdminService();

  // Active section: 'Branch' | 'Newbranch' | 'Viewbranch' | 'Editbranch'
  const [isactive, setIsactive] = useState("Branch");

  // Branch data
  const [allData, setAlldata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    branch: "",
    location: "",
  });

  const [selectedBranchId, setSelectedBranchId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // =====================================
  // HANDLE INPUT CHANGE
  // =====================================
  const handlecgange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================
  // NEW BRANCH
  // =====================================
  const handlenew = () => {
    setFormData({
      branch: "",
      location: "",
    });
    setSelectedBranchId(null);
    setIsactive("Newbranch");
  };

  // =====================================
  // CREATE BRANCH
  // =====================================
  const handlesave = async () => {
    if (!formData.branch.trim() || !formData.location.trim()) {
      showToast("Please fill all fields", "warning");
      return;
    }

    try {
      await createbranch({
        branchName: formData.branch.trim(),
        location: formData.location.trim(),
        batchType: "Regular",
      });

      showToast("Branch created successfully", "success");
      await fetchBranches();
      handlecancel();
    } catch (error) {
      console.error("Create branch error:", error);
      showToast(error.response?.data?.message || "Failed to create branch", "error");
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
        location: response.location,
      });
      setIsactive("Viewbranch");
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch branch details", "error");
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
        location: response.location,
      });
      setIsactive("Editbranch");
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch branch details", "error");
    }
  };

  // =====================================
  // UPDATE BRANCH
  // =====================================
  const handleupdate = async () => {
    if (!formData.branch.trim() || !formData.location.trim()) {
      showToast("Please fill all fields", "warning");
      return;
    }

    try {
      await updatebranch(selectedBranchId, {
        branchName: formData.branch.trim(),
        location: formData.location.trim(),
      });

      showToast("Branch updated successfully", "success");
      await fetchBranches();
      handlecancel();
    } catch (error) {
      console.error("Update branch error:", error);
      showToast(error.response?.data?.message || "Failed to update branch", "error");
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
      showToast(result.message || "Branch deleted successfully", "success");
      await fetchBranches();
    } catch (error) {
      console.error("Delete branch error:", error);
      const response = error.response?.data;
      if (error.response?.status === 409) {
        const dependencies = response.dependencies || {};
        showToast(
          `${response.message || "Cannot delete branch"}: Batches (${dependencies.batches || 0}), Timings (${dependencies.timings || 0})`,
          "error"
        );
      } else {
        showToast(response?.message || "Failed to delete branch", "error");
      }
    }
  };

  // =====================================
  // CANCEL / BACK
  // =====================================
  const handlecancel = () => {
    setFormData({
      branch: "",
      location: "",
    });
    setSelectedBranchId(null);
    setIsactive("Branch");
  };

  // =====================================
  // FETCH BRANCHES
  // =====================================
  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await takebranch();
      const list = Array.isArray(response)
        ? response
        : response?.branches || response?.data || [];
      setAlldata(list);
    } catch (error) {
      console.error("Error fetching branches:", error);
      showToast("Failed to fetch branches", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return allData.filter((b) => {
      const name = (b.branchName || b.name || "").toLowerCase();
      const loc = (b.location || "").toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      return name.includes(q) || loc.includes(q);
    });
  }, [allData, searchQuery]);

  // Paginated branches
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(start, start + itemsPerPage);
  }, [filteredBranches, currentPage, itemsPerPage]);

  // Export CSV
  const handleExport = () => {
    if (filteredBranches.length === 0) {
      showToast("No branch data to export", "warning");
      return;
    }

    const headers = ["Branch Name", "Location"];
    const rows = filteredBranches.map((b) => [
      `"${b.branchName || ""}"`,
      `"${b.location || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `branches_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Branch list exported to CSV", "success");
  };

  return (
    <div className="Branch">
      <ToastContainer />

      {/* =====================================
          TOOLBAR
      ===================================== */}
      <div className="branchherobutton">
        <div className="branch-tab-group">
          <button
            type="button"
            className={isactive === "Branch" ? "branchon" : "branchoff"}
            onClick={handlecancel}
          >
            Branch&apos;s
          </button>

          <button
            type="button"
            className={isactive === "Newbranch" ? "branchon" : "branchoff"}
            onClick={handlenew}
          >
            New Branch
          </button>
        </div>

        {isactive === "Branch" && (
          <button
            type="button"
            className="branchexport"
            onClick={handleExport}
          >
            <FiDownload /> Export
          </button>
        )}
      </div>

      {/* =====================================
          MAIN WHITE CARD PANEL
      ===================================== */}
      <div className="branchherosection">
        {isactive === "Branch" && (
          <div className="branchbranch">
            {/* Search filter bar */}
            <div className="branch-filter-bar">
              <div className="branch-search-wrapper">
                <LuSearch className="branch-search-icon" />
                <input
                  type="text"
                  placeholder="Search by branch name or location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="branch-search-input"
                />
              </div>
            </div>

            {loading ? (
              <Loader message="Loading branches..." minHeight="320px" />
            ) : (
              <>
                <table className="branchtable">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>#</th>
                      <th>Branch Name</th>
                      <th>Location</th>
                      <th style={{ width: "160px", textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedBranches.map((value, index) => {
                      const displayIndex =
                        (currentPage - 1) * itemsPerPage + index + 1;
                      const initial = (value.branchName || "B").charAt(0).toUpperCase();

                      return (
                        <tr key={value._id || index}>
                          <td>{displayIndex}</td>
                          <td>
                            <div className="branch-name-cell">
                              <div className="branch-avatar">{initial}</div>
                              <span className="branch-name-text">
                                {value.branchName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="branch-location-badge">
                              {value.location || "—"}
                            </span>
                          </td>
                          <td>
                            <div className="branchactions">
                              <button
                                type="button"
                                className="branch-text-action branch-text-action--view"
                                onClick={() => handleview(value._id)}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="branch-text-action branch-text-action--edit"
                                onClick={() => handleedit(value._id)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="branch-text-action branch-text-action--delete"
                                onClick={() => handleDelete(value._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredBranches.length === 0 && (
                      <tr>
                        <td colSpan="4" className="branchnodata">
                          No Branch Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* PAGINATION */}
                {filteredBranches.length > 0 && (
                  <div className="branchpagination">
                    <span>
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* =====================================
            NEW / VIEW / EDIT FORM
        ===================================== */}
        {(isactive === "Newbranch" ||
          isactive === "Viewbranch" ||
          isactive === "Editbranch") && (
          <div className="branchformsection">
            <div className="branchformhead">
              <h2>
                {isactive === "Newbranch" && "New Branch"}
                {isactive === "Viewbranch" && `${formData.branch} Branch Details`}
                {isactive === "Editbranch" && `Edit ${formData.branch} Branch`}
              </h2>

              <button
                type="button"
                className="branchback"
                onClick={handlecancel}
              >
                <FiArrowLeft /> Back
              </button>
            </div>

            <div className="branchformfields">
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

            <div className="branchformbuttons">
              <button
                type="button"
                className="branchcancel"
                onClick={handlecancel}
              >
                Cancel
              </button>

              {isactive === "Newbranch" && (
                <button
                  type="button"
                  className="branchcreate"
                  onClick={handlesave}
                >
                  Create Branch
                </button>
              )}

              {isactive === "Viewbranch" && (
                <button
                  type="button"
                  className="branchcreate"
                  onClick={() => setIsactive("Editbranch")}
                >
                  Edit Branch
                </button>
              )}

              {isactive === "Editbranch" && (
                <button
                  type="button"
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
