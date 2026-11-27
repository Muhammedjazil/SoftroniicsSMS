
import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch,
  FiDownload,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
} from "react-icons/fi";
import {
  MdClose,
  MdVisibility,
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdFileDownload,
  MdUploadFile,
  MdKeyboardArrowDown,
} from "react-icons/md";

import AdminService from "../../../services/admin-api-services/AdminService";
import Loader from "../../../components/common/Loader";
import { useToast } from "../../../components/common/Toast";
import "./Taskmaterial.css";

const AUDIENCE_TYPES = [
  "All interns",
  "By batches",
  "By Courses",
  "By Category",
  "Individual interns",
];

const EMPTY_FORM = {
  title: "",
  mentor: "",
  attachment: null,
  existingAttachment: "",
  allowDownload: true,
  branches: [],
  audience: "",
  batches: [],
  categories: [],
  courses: [],
  individualInterns: [],
};

const getId = (item) =>
  typeof item === "object" && item !== null
    ? item._id || item.id || ""
    : item || "";

const getName = (item, fields = []) => {
  if (!item) return "";

  if (typeof item === "string") return item;

  for (const field of fields) {
    if (item[field]) return item[field];
  }

  return "";
};

const getArray = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  return [];
};

const getFileName = (filePath) => {
  if (!filePath) return "";
  return filePath.split("/").pop();
};

const Taskmaterial = () => {
  const { showToast, ToastContainer } = useToast();
  const {
    takematerials,
    takematerialbyid,
    getmaterialdropdowns,
    creatematerial,
    updatematerial,
    removematerial,
  } = AdminService();

  const [materials, setMaterials] = useState([]);

  const [dropdowns, setDropdowns] = useState({
    branches: [],
    mentors: [],
    batches: [],
    categories: [],
    courses: [],
    interns: [],
  });

  const [mode, setMode] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [mentorFilter, setMentorFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const [branchDropdown, setBranchDropdown] = useState(false);
  const [audienceDropdown, setAudienceDropdown] = useState(false);
  const [internSearch, setInternSearch] = useState("");
  const [selectionValue, setSelectionValue] = useState("");

  const selectedMaterial = materials.find(
    (item) => getId(item) === selectedId
  );

  // =====================================================
  // FETCH MATERIALS
  // =====================================================

  const fetchMaterials = async () => {
    try {
      const response = await takematerials();
      setMaterials(getArray(response, "materials"));
    } catch (error) {
      console.error(
        "Fetch Materials Error:",
        error.response?.data || error
      );

      showToast(
        error.response?.data?.message ||
        "Unable to fetch materials",
        "error"
      );
    }
  };

  // =====================================================
  // FETCH DROPDOWNS
  // =====================================================

  const fetchDropdowns = async () => {
    try {
      const response = await getmaterialdropdowns();

      setDropdowns({
        branches: getArray(response, "branches"),
        mentors: getArray(response, "mentors"),
        batches: getArray(response, "batches"),
        categories: getArray(response, "categories"),
        courses: getArray(response, "courses"),
        interns: getArray(response, "interns"),
      });
    } catch (error) {
      console.error(
        "Material Dropdown Error:",
        error.response?.data || error
      );

      showToast(
        error.response?.data?.message ||
        "Unable to fetch material dropdown data",
        "error"
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      setPageLoading(true);

      await Promise.all([
        fetchMaterials(),
        fetchDropdowns(),
      ]);

      setPageLoading(false);
    };

    loadData();
  }, []);

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setSelectedId(null);
    setInternSearch("");
    setSelectionValue("");
    setBranchDropdown(false);
    setAudienceDropdown(false);
  };

  // =====================================================
  // BRANCH SELECTION
  // =====================================================

  const toggleBranch = (branchId) => {
    setFormData((prev) => {
      const exists = prev.branches.includes(branchId);

      return {
        ...prev,
        branches: exists
          ? prev.branches.filter((id) => id !== branchId)
          : [...prev.branches, branchId],

        audience: "",
        batches: [],
        categories: [],
        courses: [],
        individualInterns: [],
      };
    });

    setSelectionValue("");
    setInternSearch("");
  };

  // =====================================================
  // BRANCH FILTERED DROPDOWNS
  // =====================================================

  const selectedBatches = useMemo(() => {
    return dropdowns.batches.filter((item) =>
      formData.branches.includes(getId(item.branch))
    );
  }, [dropdowns.batches, formData.branches]);

  const selectedCategories = useMemo(() => {
    return dropdowns.categories.filter((item) => {
      const branches = Array.isArray(item.branch)
        ? item.branch.map(getId)
        : [getId(item.branch)];

      return branches.some((id) => formData.branches.includes(id));
    });
  }, [dropdowns.categories, formData.branches]);

  const selectedCourses = useMemo(() => {
    const categoryIds = selectedCategories.map(getId);

    return dropdowns.courses.filter((item) =>
      categoryIds.includes(getId(item.category))
    );
  }, [dropdowns.courses, selectedCategories]);

  const selectedInterns = useMemo(() => {
    return dropdowns.interns.filter((item) =>
      formData.branches.includes(getId(item.branch))
    );
  }, [dropdowns.interns, formData.branches]);

  // =====================================================
  // AUDIENCE OPTIONS
  // =====================================================

  const getAudienceOptions = () => {
    switch (formData.audience) {
      case "By batches":
        return selectedBatches;

      case "By Category":
        return selectedCategories;

      case "By Courses":
        return selectedCourses;

      case "Individual interns":
        return selectedInterns;

      default:
        return [];
    }
  };

  const getAudienceField = () => {
    switch (formData.audience) {
      case "By batches":
        return "batches";

      case "By Category":
        return "categories";

      case "By Courses":
        return "courses";

      case "Individual interns":
        return "individualInterns";

      default:
        return null;
    }
  };

  const getAudienceLabel = (item) => {
    if (formData.audience === "By batches") {
      return getName(item, ["batchName"]);
    }

    if (formData.audience === "By Category") {
      return getName(item, ["categoryName"]);
    }

    if (formData.audience === "By Courses") {
      return getName(item, ["courseName"]);
    }

    return getName(item, ["fullName", "email"]);
  };

  // =====================================================
  // AUDIENCE TYPE CHANGE
  // =====================================================

  const handleAudienceType = (value) => {
    setFormData((prev) => ({
      ...prev,
      audience: value,
      batches: [],
      categories: [],
      courses: [],
      individualInterns: [],
    }));

    setSelectionValue("");
    setInternSearch("");
  };

  // =====================================================
  // ADD / REMOVE AUDIENCE
  // =====================================================

  const addAudience = (id) => {
    if (!id) return;

    const field = getAudienceField();
    if (!field) return;

    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field]
        : [...prev[field], id],
    }));

    setSelectionValue("");
    setInternSearch("");
  };

  const removeAudience = (field, id) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== id),
    }));
  };

  const getSelectedAudienceItems = () => {
    const field = getAudienceField();
    if (!field) return [];

    const options = getAudienceOptions();

    return formData[field]
      .map((id) => options.find((item) => getId(item) === id))
      .filter(Boolean);
  };

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP and PDF files are allowed.", "error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5 MB.", "error");
      event.target.value = "";
      return;
    }

    updateField("attachment", file);
    event.target.value = "";
  };

  const handleViewAttachment = (attachment) => {
    if (!attachment) {
      showToast("Attachment is not available.", "error");
      return;
    }

    const url = attachment.startsWith("http")
      ? attachment
      : `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${attachment}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadAttachment = async (attachment) => {
    if (!attachment) {
      showToast("Attachment is not available.", "error");
      return;
    }

    const url = attachment.startsWith("http")
      ? attachment
      : `${import.meta.env.VITE_API_URL || "http://localhost:7000"}${attachment}`;

    const fileName = getFileName(attachment) || "attachment";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to anchor trigger:", err);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadAttachment = handleDownloadAttachment;

  // =====================================================
  // NORMALIZE MATERIAL FOR FORM
  // =====================================================

  const normalizeMaterial = (material) => ({
    title: material.title || "",
    mentor: getId(material.mentor),
    attachment: null,
    existingAttachment: material.attachments || "",
    allowDownload: material.allowDownload ?? true,
    branches: (material.branch || []).map(getId),
    audience: material.audience || "",
    batches: (material.batches || []).map(getId),
    categories: (material.categories || []).map(getId),
    courses: (material.courses || []).map(getId),
    individualInterns: (material.individualInterns || []).map(getId),
  });

  // =====================================================
  // NEW MATERIAL
  // =====================================================

  const handleNew = () => {
    resetForm();
    setMode("create");
  };

  // =====================================================
  // VIEW MATERIAL
  // =====================================================

  const handleView = async (material) => {
    try {
      const id = getId(material);
      const response = await takematerialbyid(id);
      const record = response.material || material;

      setSelectedId(id);
      setFormData(normalizeMaterial(record));
      setMode("view");
    } catch (error) {
      console.error("View Material Error:", error);
      showToast(
        error.response?.data?.message ||
        "Unable to open material",
        "error"
      );
    }
  };

  // =====================================================
  // EDIT MATERIAL
  // =====================================================

  const handleEdit = async (material) => {
    try {
      const id = getId(material);
      const response = await takematerialbyid(id);
      const record = response.material || material;

      setSelectedId(id);
      setFormData(normalizeMaterial(record));
      setMode("edit");
    } catch (error) {
      console.error("Edit Material Error:", error);
      showToast(
        error.response?.data?.message ||
        "Unable to edit material",
        "error"
      );
    }
  };

  // =====================================================
  // CANCEL / BACK
  // =====================================================

  const handleCancel = () => {
    if (mode === "edit" && selectedMaterial) {
      setFormData(normalizeMaterial(selectedMaterial));
      setMode("view");
      return;
    }

    resetForm();
    setMode("list");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!formData.title.trim()) {
      showToast("Please enter material title.", "error");
      return false;
    }

    if (!formData.mentor) {
      showToast("Please select assigned mentor.", "error");
      return false;
    }

    if (!formData.attachment && !formData.existingAttachment) {
      showToast("Please upload an attachment.", "error");
      return false;
    }

    if (!formData.branches.length) {
      showToast("Please select at least one branch.", "error");
      return false;
    }

    if (!formData.audience) {
      showToast("Please select audience type.", "error");
      return false;
    }

    if (
      formData.audience === "By batches" &&
      !formData.batches.length
    ) {
      showToast("Please select at least one batch.", "error");
      return false;
    }

    if (
      formData.audience === "By Category" &&
      !formData.categories.length
    ) {
      showToast("Please select at least one category.", "error");
      return false;
    }

    if (
      formData.audience === "By Courses" &&
      !formData.courses.length
    ) {
      showToast("Please select at least one course.", "error");
      return false;
    }

    if (
      formData.audience === "Individual interns" &&
      !formData.individualInterns.length
    ) {
      showToast("Please select at least one intern.", "error");
      return false;
    }

    return true;
  };

  // =====================================================
  // CREATE / UPDATE MATERIAL
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const data = new FormData();

    data.append("title", formData.title.trim());
    data.append("mentor", formData.mentor);
    data.append("audience", formData.audience);
    data.append("allowDownload", String(formData.allowDownload));

    data.append("branch", JSON.stringify(formData.branches));
    data.append("batches", JSON.stringify(formData.batches));
    data.append("categories", JSON.stringify(formData.categories));
    data.append("courses", JSON.stringify(formData.courses));

    data.append(
      "individualInterns",
      JSON.stringify(formData.individualInterns)
    );

    if (formData.attachment) {
      data.append("attachments", formData.attachment);
    }

    try {
      setLoading(true);

      if (mode === "create") {
        await creatematerial(data);
        showToast("Material created successfully.", "success");
      } else if (mode === "edit") {
        await updatematerial(selectedId, data);
        showToast("Material updated successfully.", "success");
      }

      await fetchMaterials();

      resetForm();
      setMode("list");
    } catch (error) {
      console.error(
        "Save Material Error:",
        error.response?.data || error
      );

      showToast(
        error.response?.data?.message ||
        "Unable to save material",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE MATERIAL
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this material?"
    );

    if (!confirmed) return;

    try {
      await removematerial(id);

      showToast("Material deleted successfully.", "success");

      await fetchMaterials();

      resetForm();
      setMode("list");
    } catch (error) {
      console.error(
        "Delete Material Error:",
        error.response?.data || error
      );

      showToast(
        error.response?.data?.message ||
        "Unable to delete material",
        "error"
      );
    }
  };

  // =====================================================
  // FILTER MATERIALS
  // =====================================================

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const mentorName = getName(
        material.mentor,
        ["fullName", "email"]
      );

      const branchNames = (material.branch || []).map((item) =>
        getName(item, ["branchName"])
      );

      const searchContent = [
        material.title,
        mentorName,
        material.audience,
        ...branchNames,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = searchContent.includes(
        search.toLowerCase()
      );

      const audienceMatch =
        audienceFilter === "all" ||
        material.audience === audienceFilter;

      const mentorMatch =
        mentorFilter === "all" ||
        getId(material.mentor) === mentorFilter;

      const branchMatch =
        branchFilter === "all" ||
        (material.branch || []).some(
          (item) => getId(item) === branchFilter
        );

      return (
        searchMatch &&
        audienceMatch &&
        mentorMatch &&
        branchMatch
      );
    });
  }, [
    materials,
    search,
    audienceFilter,
    mentorFilter,
    branchFilter,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, audienceFilter, mentorFilter, branchFilter]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const currentMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage, itemsPerPage]);

  // =====================================================
  // EXPORT CSV
  // =====================================================

  const handleExport = () => {
    if (!filteredMaterials.length) {
      showToast("No materials available to export.", "error");
      return;
    }

    const headers = [
      "Title",
      "Mentor",
      "Branches",
      "Audience",
      "Attachment",
      "Allow Download",
      "Created Date",
    ];

    const rows = filteredMaterials.map((material) => [
      material.title,
      getName(material.mentor, ["fullName", "email"]),
      (material.branch || [])
        .map((item) => getName(item, ["branchName"]))
        .join(", "),
      material.audience,
      getFileName(material.attachments),
      material.allowDownload ? "Yes" : "No",
      material.createdAt
        ? new Date(material.createdAt).toLocaleDateString()
        : "",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value ?? "").replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "materials.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =====================================================
  // SELECTED AUDIENCE UI
  // =====================================================

  const renderSelectedAudience = () => {
    const field = getAudienceField();

    if (!field || !formData[field].length) return null;

    const selectedItems = getSelectedAudienceItems();

    return (
      <div className="tasks-material-selected-section">
        <h4>
          {formData.audience === "By batches"
            ? "Selected Batches"
            : formData.audience === "By Category"
              ? "Selected Categories"
              : formData.audience === "By Courses"
                ? "Selected Courses"
                : "Selected Interns"}
        </h4>

        <div className="tasks-material-selected-list">
          {selectedItems.map((item) => {
            const id = getId(item);

            return (
              <div
                className="tasks-material-selected-item"
                key={id}
              >
                <span>{getAudienceLabel(item)}</span>

                {mode !== "view" && (
                  <button
                    type="button"
                    onClick={() => removeAudience(field, id)}
                    aria-label="Remove selection"
                  >
                    <MdClose />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER FORM
  // =====================================================

  const renderForm = () => {
    const isView = mode === "view";
    const audienceOptions = getAudienceOptions();
    const selectedField = getAudienceField();

    const filteredInterns = selectedInterns.filter((intern) => {
      const name = getName(intern, ["fullName", "email"]);

      return (
        name.toLowerCase().includes(internSearch.toLowerCase()) &&
        !formData.individualInterns.includes(getId(intern))
      );
    });

    return (
      <form
        className="tasks-material-form"
        onSubmit={handleSubmit}
      >
        {mode !== "create" && (
          <div className="tasks-material-detail-header">
            <h2>{formData.title || "Material Details"}</h2>

            <button
              type="button"
              className="tasks-material-back-btn"
              onClick={handleCancel}
            >
              <MdArrowBack />
              Back
            </button>
          </div>
        )}

        {/* MATERIAL DETAILS */}

        <div className="tasks-material-form-section">
          <h3>Material Details</h3>

          <div className="tasks-material-section-divider" />

          <div className="tasks-material-form-grid">
            {/* TITLE */}

            <div className="tasks-material-form-group">
              <label htmlFor="tasks-material-title">
                Title <span>*</span>
              </label>

              <input
                id="tasks-material-title"
                type="text"
                placeholder="Enter Material Title"
                value={formData.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                disabled={isView}
                required
              />
            </div>

            {/* MENTOR */}

            <div className="tasks-material-form-group">
              <label htmlFor="tasks-material-mentor">
                Assigned Mentor <span>*</span>
              </label>

              <select
                id="tasks-material-mentor"
                value={formData.mentor}
                onChange={(e) =>
                  updateField("mentor", e.target.value)
                }
                disabled={isView}
                required
              >
                <option value="">Choose Mentor</option>

                {dropdowns.mentors.map((mentor) => (
                  <option
                    key={getId(mentor)}
                    value={getId(mentor)}
                  >
                    {getName(mentor, ["fullName", "email"])}
                  </option>
                ))}
              </select>
            </div>

            {/* ATTACHMENT */}

            <div className="tasks-material-form-group">
              <label htmlFor="tasks-material-attachments">
                Attachment <span>*</span>
                <small>(JPG/PNG/WEBP/PDF only)</small>
              </label>

              {!isView ? (
                <>
                  <label className="tasks-material-upload-box">
                    <span>
                      {formData.attachment
                        ? formData.attachment.name
                        : formData.existingAttachment
                          ? getFileName(formData.existingAttachment)
                          : "Upload Attachment (Image/PDF)"}
                    </span>

                    <MdUploadFile />

                    <input
                      id="tasks-material-attachments"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      hidden
                      onChange={handleUpload}
                    />
                  </label>

                  {formData.existingAttachment && !formData.attachment && (
                    <div className="tasks-material-attachment-list">
                      <div className="tasks-material-attachment-item">
                        <span>
                          Existing: {getFileName(formData.existingAttachment)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateField("existingAttachment", "")
                          }
                        >
                          <MdClose />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="tasks-material-readonly-files">
                  {formData.existingAttachment ? (
                    <div>
                      <span>
                        {getFileName(formData.existingAttachment)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          downloadAttachment(formData.existingAttachment)
                        }
                        title="Open attachment"
                      >
                        <MdFileDownload />
                      </button>
                    </div>
                  ) : (
                    <span>No attachment</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DOWNLOAD PERMISSION */}

          <div className="tasks-material-download-permission">
            <input
              id="tasks-material-allow-download"
              type="checkbox"
              checked={formData.allowDownload}
              disabled={isView}
              onChange={(e) =>
                updateField("allowDownload", e.target.checked)
              }
            />

            <label htmlFor="tasks-material-allow-download">
              Allow Interns to Download
            </label>
          </div>
        </div>

        {/* AUDIENCE */}

        <div className="tasks-material-audience-section">
          <h3>Audience Selection</h3>

          <div className="tasks-material-section-divider" />

          <div className="tasks-material-audience-grid">
            {/* BRANCHES */}

            <div className="tasks-material-form-group">
              <label>
                Branches <span>*</span>
              </label>

              <div className="tasks-material-dropdown-wrapper">
                <button
                  type="button"
                  className="tasks-material-dropdown-trigger"
                  disabled={isView}
                  onClick={() =>
                    setBranchDropdown(!branchDropdown)
                  }
                >
                  <span>
                    {formData.branches.length
                      ? formData.branches
                          .map((id) =>
                            getName(
                              dropdowns.branches.find(
                                (item) => getId(item) === id
                              ),
                              ["branchName"]
                            )
                          )
                          .join(", ")
                      : "Select Branches"}
                  </span>

                  <MdKeyboardArrowDown />
                </button>

                {branchDropdown && !isView && (
                  <div className="tasks-material-dropdown-menu">
                    {dropdowns.branches.map((branch) => {
                      const id = getId(branch);

                      return (
                        <label
                          className="tasks-material-dropdown-option"
                          key={id}
                        >
                          <input
                            type="checkbox"
                            checked={formData.branches.includes(id)}
                            onChange={() => toggleBranch(id)}
                          />

                          <span>{branch.branchName}</span>
                        </label>
                      );
                    })}

                    <button
                      type="button"
                      className="tasks-material-dropdown-done"
                      onClick={() => setBranchDropdown(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AUDIENCE TYPE */}

            <div className="tasks-material-form-group">
              <label>
                Audience Type <span>*</span>

                {!formData.branches.length && (
                  <small className="tasks-material-hint">
                    (Select branches first)
                  </small>
                )}
              </label>

              <select
                value={formData.audience}
                disabled={isView || !formData.branches.length}
                onChange={(e) =>
                  handleAudienceType(e.target.value)
                }
                required
              >
                <option value="">Choose Audience Type</option>

                {AUDIENCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* AUDIENCE OPTIONS */}

            {formData.audience &&
              formData.audience !== "All interns" && (
                <div className="tasks-material-form-group tasks-material-audience-select-group">
                  <label>
                    {formData.audience === "By batches"
                      ? "Select Batches"
                      : formData.audience === "By Category"
                        ? "Select Categories"
                        : formData.audience === "By Courses"
                          ? "Select Courses"
                          : "Select Interns"}
                  </label>

                  {formData.audience === "Individual interns" ? (
                    <div className="tasks-material-intern-search-wrapper">
                      <div className="tasks-material-intern-search">
                        <input
                          type="text"
                          placeholder="Search Intern"
                          value={internSearch}
                          disabled={isView}
                          onChange={(e) =>
                            setInternSearch(e.target.value)
                          }
                        />

                        <MdSearch />
                      </div>

                      {!isView && internSearch.trim() && (
                        <div className="tasks-material-intern-results">
                          {filteredInterns.map((intern) => (
                            <button
                              type="button"
                              key={getId(intern)}
                              onClick={() =>
                                addAudience(getId(intern))
                              }
                            >
                              {getName(intern, ["fullName", "email"])}
                            </button>
                          ))}

                          {!filteredInterns.length && (
                            <p>No interns found</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <select
                      value={selectionValue}
                      disabled={isView}
                      onChange={(e) => {
                        setSelectionValue(e.target.value);
                        addAudience(e.target.value);
                      }}
                    >
                      <option value="">
                        {formData.audience === "By batches"
                          ? "Select Batch"
                          : formData.audience === "By Category"
                            ? "Select Category"
                            : "Select Course"}
                      </option>

                      {audienceOptions
                        .filter(
                          (item) =>
                            !formData[selectedField].includes(getId(item))
                        )
                        .map((item) => (
                          <option
                            key={getId(item)}
                            value={getId(item)}
                          >
                            {getAudienceLabel(item)}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}
          </div>

          {/* SELECTED AUDIENCE */}

          {formData.audience === "All interns" && (
            <div className="tasks-material-selected-section">
              <h4>Audience</h4>
              <p>All active interns in the selected branches.</p>
            </div>
          )}

          {renderSelectedAudience()}
        </div>

        {/* BUTTONS */}

        <div className="tasks-material-form-buttons">
          {mode === "create" && (
            <>
              <button
                type="button"
                className="tasks-material-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="tasks-material-primary-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Add Material"}
              </button>
            </>
          )}

          {mode === "view" && (
            <button
              type="button"
              className="tasks-material-primary-btn"
              onClick={() => setMode("edit")}
            >
              Edit
            </button>
          )}

          {mode === "edit" && (
            <>
              <button
                type="button"
                className="tasks-material-cancel-btn"
                onClick={() => handleDelete(selectedId)}
                disabled={loading}
              >
                Delete
              </button>

              <button
                type="button"
                className="tasks-material-cancel-btn"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="tasks-material-primary-btn"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </>
          )}
        </div>
      </form>
    );
  };

  // =====================================================
  // MAIN RETURN
  // =====================================================

  return (
    <div className="tasks-material-page syl-mgmt-container">
      <ToastContainer />
      {(mode === "list" || mode === "create") && (
        <div className="syl-mgmt-toolbar">
          <div className="syl-mgmt-tab-group">
            <button
              type="button"
              className={`syl-mgmt-tab-btn ${
                mode === "list" ? "syl-mgmt-tab-btn--active" : ""
              }`}
              onClick={() => {
                resetForm();
                setMode("list");
              }}
            >
              Material List
            </button>

            <button
              type="button"
              className={`syl-mgmt-tab-btn ${
                mode === "create" ? "syl-mgmt-tab-btn--active" : ""
              }`}
              onClick={handleNew}
            >
              New Material
            </button>
          </div>

          {mode === "list" && (
            <button
              type="button"
              className="syl-mgmt-export-btn"
              onClick={handleExport}
            >
              <FiDownload className="syl-mgmt-export-icon" />
              <span>Export</span>
            </button>
          )}
        </div>
      )}

      {/* MATERIAL LIST */}
      {mode === "list" && (
        <main className="syl-mgmt-panel">
          {/* Filter Bar */}
          <div className="syl-mgmt-filter-bar">
            <div className="syl-mgmt-search-wrapper">
              <FiSearch className="syl-mgmt-search-icon" />
              <input
                type="text"
                className="syl-mgmt-search-input"
                placeholder="Search Materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div className="syl-mgmt-filter-select-wrapper" style={{ width: "160px" }}>
                <select
                  className="syl-mgmt-filter-select"
                  value={audienceFilter}
                  onChange={(e) => setAudienceFilter(e.target.value)}
                >
                  <option value="all">All Audience</option>
                  {AUDIENCE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="syl-mgmt-select-arrow" />
              </div>

              <div className="syl-mgmt-filter-select-wrapper" style={{ width: "160px" }}>
                <select
                  className="syl-mgmt-filter-select"
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                >
                  <option value="all">All Mentors</option>
                  {dropdowns.mentors.map((mentor) => (
                    <option key={getId(mentor)} value={getId(mentor)}>
                      {getName(mentor, ["fullName", "email"])}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="syl-mgmt-select-arrow" />
              </div>

              <div className="syl-mgmt-filter-select-wrapper" style={{ width: "160px" }}>
                <select
                  className="syl-mgmt-filter-select"
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                >
                  <option value="all">All Branches</option>
                  {dropdowns.branches.map((branch) => (
                    <option key={getId(branch)} value={getId(branch)}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="syl-mgmt-select-arrow" />
              </div>
            </div>
          </div>

          {pageLoading ? (
            <Loader message="Loading materials..." minHeight="320px" />
          ) : currentMaterials.length ? (
            <div className="syl-mgmt-table-wrapper">
              <table className="notificationtable">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Title</th>
                    <th>Mentor</th>
                    <th>Branch</th>
                    <th className="noti-th-center" style={{ textAlign: "center" }}>Audience</th>
                    <th className="noti-th-center" style={{ textAlign: "center" }}>Attachments</th>
                    <th className="noti-th-center" style={{ textAlign: "center" }}>Created Date</th>
                    <th style={{ width: "160px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentMaterials.map((material, idx) => {
                    const actualIndex = (currentPage - 1) * itemsPerPage + idx;
                    const initial = (material.title || "M").charAt(0).toUpperCase();

                    return (
                      <tr key={getId(material)}>
                        <td>{actualIndex + 1}</td>
                        <td>
                          <div className="noti-title-cell">
                            <div className="noti-avatar">{initial}</div>
                            <span className="noti-title-text">{material.title}</span>
                          </div>
                        </td>
                        <td>
                          {getName(material.mentor, ["fullName", "email"]) || "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {(material.branch || []).length > 0
                              ? (material.branch || []).map((b) => (
                                  <span
                                    key={getId(b)}
                                    className="syl-mgmt-course-pill"
                                    style={{ backgroundColor: "#f3f4f6", color: "#374151", fontSize: "11px" }}
                                  >
                                    {getName(b, ["branchName"])}
                                  </span>
                                ))
                              : "—"}
                          </div>
                        </td>
                        <td className="noti-td-center" style={{ textAlign: "center" }}>
                          <span className="noti-type-badge">{material.audience}</span>
                        </td>
                        <td className="noti-td-center" style={{ textAlign: "center" }}>
                          {material.attachments ? (
                            <div className="tasks-material-attach-actions">
                              <button
                                type="button"
                                className="tasks-material-attach-btn tasks-material-attach-btn--view"
                                onClick={() => handleViewAttachment(material.attachments)}
                                title={`View ${getFileName(material.attachments)}`}
                              >
                                <FiEye />
                              </button>
                              <button
                                type="button"
                                className="tasks-material-attach-btn tasks-material-attach-btn--download"
                                onClick={() => handleDownloadAttachment(material.attachments)}
                                title={`Download ${getFileName(material.attachments)}`}
                              >
                                <FiDownload />
                              </button>
                            </div>
                          ) : (
                            <span className="syl-mgmt-doc-badge">No File</span>
                          )}
                        </td>
                        <td className="noti-td-center" style={{ textAlign: "center" }}>
                          <span className="syl-mgmt-date-text">
                            {material.createdAt
                              ? new Date(material.createdAt).toLocaleDateString()
                              : "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="syl-mgmt-col-actions">
                            <button
                              type="button"
                              className="syl-mgmt-text-action syl-mgmt-text-action--view"
                              onClick={() => handleView(material)}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              className="syl-mgmt-text-action syl-mgmt-text-action--edit"
                              onClick={() => handleEdit(material)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="syl-mgmt-text-action syl-mgmt-text-action--delete"
                              onClick={() => handleDelete(getId(material))}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="syl-mgmt-content-area">
              <p className="syl-mgmt-empty-message">
                No data available. Please add Material to view them here.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredMaterials.length > 0 && (
            <div className="syl-mgmt-pagination-bar">
              <span className="syl-mgmt-pagination-text">
                {`${currentPage} of ${Math.max(totalPages, 1)}`}
              </span>

              <div className="syl-mgmt-pagination-controls">
                <button
                  type="button"
                  className="syl-mgmt-page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={currentPage === 1 ? {} : { cursor: "pointer", color: "#374151", backgroundColor: "#fff" }}
                >
                  <FiChevronLeft />
                </button>
                <button
                  type="button"
                  className="syl-mgmt-page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={totalPages === 0 || currentPage >= totalPages}
                  style={
                    totalPages === 0 || currentPage >= totalPages
                      ? {}
                      : { cursor: "pointer", color: "#374151", backgroundColor: "#fff" }
                  }
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* CREATE */}

      {mode === "create" && (
        <div className="tasks-material-form-container">
          {renderForm()}
        </div>
      )}

      {/* VIEW */}

      {mode === "view" && (
        <div className="tasks-material-detail-container">
          {renderForm()}
        </div>
      )}

      {/* EDIT */}

      {mode === "edit" && (
        <div className="tasks-material-detail-container">
          {renderForm()}
        </div>
      )}
    </div>
  );
};

export default Taskmaterial;
