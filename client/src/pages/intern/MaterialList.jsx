
import React, { useEffect, useMemo, useState } from "react";
import UserService from "../../services/user-api-services/UserService";
import "./MaterialList.css";

const MaterialList = () => {
  const { takematerials, takematerialbyid } = UserService();

  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("All Audiences");
  const [selectedMentor, setSelectedMentor] = useState("All Mentors");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ================= FETCH MATERIALS ================= //

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await takematerials();

      setMaterials(response.materials || []);
    } catch (error) {
      console.error("Material fetching error:", error);
      setError(
        error.response?.data?.message || "Failed to load materials"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ================= MENTOR OPTIONS ================= //

  const mentors = useMemo(() => {
    const mentorList = materials
      .map((item) => item.mentor)
      .filter((mentor) => mentor?._id);

    return [
      ...new Map(
        mentorList.map((mentor) => [mentor._id, mentor])
      ).values(),
    ];
  }, [materials]);

  // ================= SEARCH AND FILTER ================= //

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const searchMatch = item.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const audienceMatch =
        selectedAudience === "All Audiences" ||
        item.audience === selectedAudience;

      const mentorMatch =
        selectedMentor === "All Mentors" ||
        item.mentor?._id === selectedMentor;

      return searchMatch && audienceMatch && mentorMatch;
    });
  }, [materials, search, selectedAudience, selectedMentor]);

  // ================= FORMAT DATE ================= //

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // ================= ATTACHMENT URL ================= //

  const getAttachmentUrl = (attachment) => {
    if (!attachment) return "";

    if (attachment.startsWith("http")) {
      return attachment;
    }

    return `${API_URL.replace(/\/$/, "")}/${attachment.replace(/^\//, "")}`;
  };

  // ================= VIEW ATTACHMENT ================= //

  const handleViewAttachment = (attachment) => {
    const url = getAttachmentUrl(attachment);

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ================= DOWNLOAD ATTACHMENT ================= //

  const handleDownload = (attachment) => {
    const url = getAttachmentUrl(attachment);

    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.split("/").pop();
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ================= MATERIAL DETAILS ================= //

  const handleDetails = async (id) => {
    try {
      const response = await takematerialbyid(id);
      setSelectedMaterial(response.material);
    } catch (error) {
      console.error("Material details error:", error);
      alert(
        error.response?.data?.message || "Unable to load material details"
      );
    }
  };

  // ================= BRANCH NAMES ================= //

  const getBranches = (branches) => {
    if (!branches || !branches.length) return "-";

    return branches
      .map((branch) =>
        typeof branch === "object" ? branch.branchName : branch
      )
      .join(", ");
  };

  // ================= AUDIENCE SCOPE ================= //

  const getScope = (item) => {
    switch (item.audience) {
      case "By Category":
        return item.categories || [];

      case "By Courses":
        return item.courses || [];

      case "By batches":
        return item.batches || [];

      case "Individual interns":
        return item.individualInterns || [];

      default:
        return [];
    }
  };

  const getScopeName = (scopeItem) => {
    if (typeof scopeItem === "string") return scopeItem;

    return (
      scopeItem.categoryName ||
      scopeItem.courseName ||
      scopeItem.batchName ||
      scopeItem.fullName ||
      "-"
    );
  };

  const getAudienceClass = (audience) => {
    switch (audience) {
      case "By Category":
        return "category";

      case "By Courses":
        return "courses";

      case "By batches":
        return "batches";

      case "Individual interns":
        return "individual";

      default:
        return "all";
    }
  };

  // ================= CLOSE MODAL ================= //

  const closeModal = () => {
    setSelectedMaterial(null);
  };

  // ================= JSX ================= //

  return (
    <div className="material-page">

      {/* HEADER */}

     
      {/* MAIN CONTAINER */}

      <div className="material-container">

        {/* SEARCH AND FILTER */}

        <div className="material-filter-row">

          <div className="material-search">
            <span className="search-icon">⌕</span>

            <input
              type="text"
              placeholder="Search Materials"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
          >
            <option value="All Audiences">All Audiences</option>
            <option value="All interns">All interns</option>
            <option value="By batches">By Batches</option>
            <option value="By Courses">By Courses</option>
            <option value="By Category">By Category</option>
            <option value="Individual interns">Individual Interns</option>
          </select>

          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
          >
            <option value="All Mentors">All Mentors</option>

            {mentors.map((mentor) => (
              <option key={mentor._id} value={mentor._id}>
                {mentor.fullName}
              </option>
            ))}
          </select>

        </div>

        {/* TABLE */}

        <div className="material-table-wrapper">

          <table className="material-table">

            <thead>
              <tr>
                <th>TITLE</th>
                <th>MENTOR</th>
                <th>BRANCH</th>
                <th>AUDIENCE &amp; SCOPE</th>
                <th>ATTACHMENTS</th>
                <th>CREATED DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="7" className="material-message">
                    Loading materials...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="material-message error">
                    {error}
                  </td>
                </tr>
              ) : filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan="7" className="material-message">
                    No materials found
                  </td>
                </tr>
              ) : (

                filteredMaterials.map((item) => {
                  const scope = getScope(item);

                  return (
                    <tr key={item._id}>

                      <td className="material-title">
                        {item.title}
                      </td>

                      <td>
                        {item.mentor?.fullName || "-"}
                      </td>

                      <td>
                        <span className="branch-badge">
                          {getBranches(item.branch)}
                        </span>
                      </td>

                      <td>
                        <div className="audience-container">

                          <span
                            className={`audience-badge ${getAudienceClass(
                              item.audience
                            )}`}
                          >
                            {item.audience}
                          </span>

                          <div className="scope-list">

                            {scope.map((scopeItem, index) => (
                              <span
                                className="scope-badge"
                                key={scopeItem._id || index}
                              >
                                {getScopeName(scopeItem)}
                              </span>
                            ))}

                            {item.audience === "All interns" && (
                              <span className="scope-badge">
                                All Interns
                              </span>
                            )}

                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="attachment-actions">

                          <button
                            className="view-attachment"
                            title="View Attachment"
                            onClick={() =>
                              handleViewAttachment(item.attachments)
                            }
                          >
                            ◉
                          </button>

                          {item.allowDownload && (
                            <button
                              className="download-attachment"
                              title="Download Attachment"
                              onClick={() =>
                                handleDownload(item.attachments)
                              }
                            >
                              ↓
                            </button>
                          )}

                        </div>
                      </td>

                      <td>
                        {formatDate(item.createdAt)}
                      </td>

                      <td>
                        <button
                          className="material-details-btn"
                          onClick={() => handleDetails(item._id)}
                        >
                          ◉ Details
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>
          </table>

        </div>

        {!loading && !error && (
          <div className="material-results-count">
            Showing {filteredMaterials.length} of {materials.length} materials
          </div>
        )}

      </div>

      {/* DETAILS MODAL */}

      {selectedMaterial && (

        <div
          className="material-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="material-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="material-modal-header">
              <h3>Material Details</h3>
              <button onClick={closeModal}>×</button>
            </div>

            <div className="material-modal-body">

              <div className="material-detail-item">
                <label>Title</label>
                <p>{selectedMaterial.title}</p>
              </div>

              <div className="material-detail-item">
                <label>Mentor</label>
                <p>{selectedMaterial.mentor?.fullName || "-"}</p>
              </div>

              <div className="material-detail-item">
                <label>Branch</label>
                <p>{getBranches(selectedMaterial.branch)}</p>
              </div>

              <div className="material-detail-item">
                <label>Audience</label>
                <p>{selectedMaterial.audience}</p>
              </div>

              <div className="material-detail-item">
                <label>Scope</label>

                <div className="scope-list">
                  {getScope(selectedMaterial).map((item, index) => (
                    <span
                      className="scope-badge"
                      key={item._id || index}
                    >
                      {getScopeName(item)}
                    </span>
                  ))}

                  {selectedMaterial.audience === "All interns" && (
                    <span className="scope-badge">All Interns</span>
                  )}
                </div>
              </div>

              <div className="material-detail-item">
                <label>Created Date</label>
                <p>{formatDate(selectedMaterial.createdAt)}</p>
              </div>

              <div className="material-detail-item">
                <label>Attachment</label>

                <div className="material-modal-attachment">

                  <button
                    onClick={() =>
                      handleViewAttachment(selectedMaterial.attachments)
                    }
                  >
                    View Attachment
                  </button>

                  {selectedMaterial.allowDownload && (
                    <button
                      onClick={() =>
                        handleDownload(selectedMaterial.attachments)
                      }
                    >
                      Download
                    </button>
                  )}

                </div>
              </div>

            </div>

            <div className="material-modal-footer">
              <button onClick={closeModal}>Close</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MaterialList;