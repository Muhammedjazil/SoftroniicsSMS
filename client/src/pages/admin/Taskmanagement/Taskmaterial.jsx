
import React, { useMemo, useState } from "react";
import {
    MdPersonOutline,
    MdSearch,
    MdClose,
    MdVisibility,
    MdEdit,
    MdDelete,
    MdArrowBack,
    MdFileDownload,
    MdUploadFile,
    MdKeyboardArrowDown,
    MdCheck
} from "react-icons/md";

import "./Taskmaterial.css";


// =====================================================
// SAMPLE DATA - REPLACE WITH API DATA LATER
// =====================================================

const tasksMaterialMentors = [
    "Akhil C V",
    "Priyesh",
    "John",
    "Arjun",
    "Thomas"
];

const tasksMaterialBranches = [
    "calicut",
    "kochi",
    "palakkad",
    "sulthan bathery"
];

const tasksMaterialCategories = [
    "UI/UX Designing",
    "Web Development",
    "Python Development",
    "Digital Marketing",
    "Data Analytics"
];

const tasksMaterialCourses = [
    "UI/UX 3M",
    "UI/UX 1M",
    "MERN Stack 6M",
    "Python Full Stack 6M",
    "Digital Marketing 3M"
];

const tasksMaterialInterns = [
    "John - UI/UX 3M",
    "Thomson - Python Full Stack 6M",
    "Arun - MERN Stack 6M",
    "Rahul - UI/UX 1M",
    "Akhil - Python Full Stack 6M"
];

const tasksMaterialAudienceTypes = [
    "By Category",
    "By Courses",
    "Individual Interns"
];

const tasksMaterialEmptyForm = {
    title: "",
    mentor: "",
    attachments: [],
    allowDownload: true,
    branches: [],
    audienceType: "",
    selectedAudience: []
};

const tasksMaterialInitialData = [];


// =====================================================
// MAIN COMPONENT
// =====================================================

const Taskmaterial = () => {

    // -------------------------------------------------
    // MAIN STATES
    // -------------------------------------------------

    const [tasksMaterialList, setTasksMaterialList] =
        useState(tasksMaterialInitialData);

    const [tasksMaterialMode, setTasksMaterialMode] =
        useState("list");

    const [tasksMaterialFormData, setTasksMaterialFormData] =
        useState({ ...tasksMaterialEmptyForm });

    const [tasksMaterialSelectedId, setTasksMaterialSelectedId] =
        useState(null);

    // Search and filters

    const [tasksMaterialSearch, setTasksMaterialSearch] =
        useState("");

    const [tasksMaterialAudienceFilter, setTasksMaterialAudienceFilter] =
        useState("all");

    const [tasksMaterialMentorFilter, setTasksMaterialMentorFilter] =
        useState("all");

    const [tasksMaterialBranchFilter, setTasksMaterialBranchFilter] =
        useState("all");

    // Dropdown states

    const [tasksMaterialBranchDropdown, setTasksMaterialBranchDropdown] =
        useState(false);

    const [tasksMaterialAudienceDropdown, setTasksMaterialAudienceDropdown] =
        useState(false);

    const [tasksMaterialInternSearch, setTasksMaterialInternSearch] =
        useState("");

    const [tasksMaterialSelectionValue, setTasksMaterialSelectionValue] =
        useState("");


    // -------------------------------------------------
    // SELECTED MATERIAL
    // -------------------------------------------------

    const tasksMaterialSelected = tasksMaterialList.find(
        item => item.id === tasksMaterialSelectedId
    );


    // -------------------------------------------------
    // UPDATE FORM FIELD
    // -------------------------------------------------

    const tasksMaterialUpdateField = (field, value) => {

        setTasksMaterialFormData(prev => ({
            ...prev,
            [field]: value
        }));

    };


    // -------------------------------------------------
    // RESET FORM
    // -------------------------------------------------

    const tasksMaterialResetForm = () => {

        setTasksMaterialFormData({
            ...tasksMaterialEmptyForm,
            attachments: [],
            branches: [],
            selectedAudience: []
        });

        setTasksMaterialSelectedId(null);

        setTasksMaterialInternSearch("");

        setTasksMaterialSelectionValue("");

        setTasksMaterialBranchDropdown(false);

        setTasksMaterialAudienceDropdown(false);

    };


    // =================================================
    // BRANCH SELECTION
    // =================================================

    const tasksMaterialToggleBranch = (branch) => {

        setTasksMaterialFormData(prev => {

            const isSelected = prev.branches.includes(branch);

            return {
                ...prev,

                branches: isSelected
                    ? prev.branches.filter(item => item !== branch)
                    : [...prev.branches, branch],

                // Changing branches resets the dependent audience
                audienceType: "",
                selectedAudience: []
            };

        });

        setTasksMaterialSelectionValue("");

    };


    // =================================================
    // AUDIENCE TYPE
    // =================================================

    const tasksMaterialHandleAudienceType = (value) => {

        setTasksMaterialFormData(prev => ({
            ...prev,
            audienceType: value,
            selectedAudience: []
        }));

        setTasksMaterialSelectionValue("");

        setTasksMaterialInternSearch("");

    };


    // -------------------------------------------------
    // GET AUDIENCE OPTIONS
    // -------------------------------------------------

    const tasksMaterialGetAudienceOptions = () => {

        switch (tasksMaterialFormData.audienceType) {

            case "By Category":
                return tasksMaterialCategories;

            case "By Courses":
                return tasksMaterialCourses;

            case "Individual Interns":
                return tasksMaterialInterns;

            default:
                return [];

        }

    };


    // -------------------------------------------------
    // ADD SELECTED AUDIENCE
    // -------------------------------------------------

    const tasksMaterialAddAudience = (value) => {

        if (!value) return;

        setTasksMaterialFormData(prev => ({

            ...prev,

            selectedAudience: prev.selectedAudience.includes(value)
                ? prev.selectedAudience
                : [...prev.selectedAudience, value]

        }));

        setTasksMaterialSelectionValue("");

        setTasksMaterialInternSearch("");

    };


    // -------------------------------------------------
    // REMOVE SELECTED AUDIENCE
    // -------------------------------------------------

    const tasksMaterialRemoveAudience = (value) => {

        setTasksMaterialFormData(prev => ({

            ...prev,

            selectedAudience: prev.selectedAudience.filter(
                item => item !== value
            )

        }));

    };


    // =================================================
    // ATTACHMENT UPLOAD
    // =================================================

    const tasksMaterialHandleUpload = (e) => {

        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];

        const validFiles = files.filter(file => {

            const extension = file.name.split(".").pop().toLowerCase();

            return allowedExtensions.includes(extension);

        });

        if (validFiles.length !== files.length) {

            alert("Only JPG, PNG and PDF files are allowed.");

        }

        setTasksMaterialFormData(prev => ({

            ...prev,

            attachments: [
                ...prev.attachments,
                ...validFiles
            ]

        }));

        e.target.value = "";

    };


    // -------------------------------------------------
    // REMOVE ATTACHMENT
    // -------------------------------------------------

    const tasksMaterialRemoveAttachment = (index) => {

        setTasksMaterialFormData(prev => ({

            ...prev,

            attachments: prev.attachments.filter(
                (_, i) => i !== index
            )

        }));

    };


    // -------------------------------------------------
    // DOWNLOAD ATTACHMENT
    // -------------------------------------------------

    const tasksMaterialDownloadAttachment = (file) => {

        if (file instanceof File) {

            const url = URL.createObjectURL(file);

            const link = document.createElement("a");

            link.href = url;
            link.download = file.name;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

        } else if (file?.url) {

            window.open(file.url, "_blank", "noopener,noreferrer");

        } else {

            alert("This attachment is not available for download.");

        }

    };


    // =================================================
    // INTERN SEARCH
    // =================================================

    const tasksMaterialFilteredInterns = tasksMaterialInterns.filter(
        intern =>

            intern.toLowerCase().includes(
                tasksMaterialInternSearch.toLowerCase()
            ) &&

            !tasksMaterialFormData.selectedAudience.includes(intern)

    );


    // =================================================
    // ADD / REMOVE SELECTED AUDIENCE UI
    // =================================================

    const tasksMaterialRenderSelectedAudience = () => {

        if (!tasksMaterialFormData.selectedAudience.length) {
            return null;
        }

        return (

            <div className="tasks-material-selected-section">

                <h4>
                    {tasksMaterialFormData.audienceType === "By Category"
                        ? "Selected Categories"
                        : tasksMaterialFormData.audienceType === "By Courses"
                            ? "Selected Courses"
                            : "Selected Interns"}
                </h4>

                <div className="tasks-material-selected-list">

                    {tasksMaterialFormData.selectedAudience.map(item => (

                        <div
                            className="tasks-material-selected-item"
                            key={item}
                        >

                            <span>{item}</span>

                            {tasksMaterialMode !== "view" && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        tasksMaterialRemoveAudience(item)
                                    }
                                    aria-label={`Remove ${item}`}
                                >
                                    <MdClose />
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            </div>

        );

    };


    // =================================================
    // NEW MATERIAL
    // =================================================

    const tasksMaterialHandleNew = () => {

        tasksMaterialResetForm();

        setTasksMaterialMode("create");

    };


    // =================================================
    // VIEW MATERIAL
    // =================================================

    const tasksMaterialHandleView = (material) => {

        setTasksMaterialSelectedId(material.id);

        setTasksMaterialFormData({

            ...tasksMaterialEmptyForm,
            ...material,

            attachments: [...material.attachments],
            branches: [...material.branches],
            selectedAudience: [...material.selectedAudience]

        });

        setTasksMaterialMode("view");

    };


    // =================================================
    // EDIT MATERIAL
    // =================================================

    const tasksMaterialHandleEdit = (material) => {

        setTasksMaterialSelectedId(material.id);

        setTasksMaterialFormData({

            ...tasksMaterialEmptyForm,
            ...material,

            attachments: [...material.attachments],
            branches: [...material.branches],
            selectedAudience: [...material.selectedAudience]

        });

        setTasksMaterialMode("edit");

    };


    // =================================================
    // CANCEL / BACK
    // =================================================

    const tasksMaterialHandleCancel = () => {

        if (tasksMaterialMode === "edit" && tasksMaterialSelected) {

            tasksMaterialHandleView(tasksMaterialSelected);

            return;

        }

        tasksMaterialResetForm();

        setTasksMaterialMode("list");

    };


    // =================================================
    // VALIDATION
    // =================================================

    const tasksMaterialValidateForm = () => {

        if (!tasksMaterialFormData.title.trim()) {

            alert("Please enter material title.");

            return false;

        }

        if (!tasksMaterialFormData.mentor) {

            alert("Please select assigned mentor.");

            return false;

        }

        if (!tasksMaterialFormData.attachments.length) {

            alert("Please upload at least one attachment.");

            return false;

        }

        if (!tasksMaterialFormData.branches.length) {

            alert("Please select at least one branch.");

            return false;

        }

        if (!tasksMaterialFormData.audienceType) {

            alert("Please select audience type.");

            return false;

        }

        if (!tasksMaterialFormData.selectedAudience.length) {

            alert("Please select at least one audience.");

            return false;

        }

        return true;

    };


    // =================================================
    // ADD / UPDATE MATERIAL
    // =================================================

    const tasksMaterialHandleSubmit = (e) => {

        e.preventDefault();

        if (!tasksMaterialValidateForm()) return;

        const currentDate = new Date().toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        });

        const materialData = {

            ...tasksMaterialFormData,

            branches: [...tasksMaterialFormData.branches],
            selectedAudience: [...tasksMaterialFormData.selectedAudience],
            attachments: [...tasksMaterialFormData.attachments]

        };


        // CREATE MATERIAL

        if (tasksMaterialMode === "create") {

            const newMaterial = {

                ...materialData,

                id: Date.now(),

                createdDate: currentDate

            };

            setTasksMaterialList(prev => [
                ...prev,
                newMaterial
            ]);

        }


        // UPDATE MATERIAL

        else if (tasksMaterialMode === "edit") {

            setTasksMaterialList(prev =>

                prev.map(item =>

                    item.id === tasksMaterialSelectedId

                        ? {
                            ...item,
                            ...materialData
                        }

                        : item

                )

            );

        }


        tasksMaterialResetForm();

        setTasksMaterialMode("list");

    };


    // =================================================
    // DELETE MATERIAL
    // =================================================

    const tasksMaterialHandleDelete = (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this material?"
        );

        if (!confirmed) return;

        setTasksMaterialList(prev =>

            prev.filter(item => item.id !== id)

        );

        tasksMaterialResetForm();

        setTasksMaterialMode("list");

    };


    // =================================================
    // FILTER MATERIALS
    // =================================================

    const tasksMaterialFilteredList = useMemo(() => {

        return tasksMaterialList.filter(material => {

            const searchContent = [

                material.title,
                material.mentor,
                material.audienceType,
                ...material.branches,
                ...material.selectedAudience

            ].join(" ").toLowerCase();


            const searchMatch = searchContent.includes(
                tasksMaterialSearch.toLowerCase()
            );


            const audienceMatch =

                tasksMaterialAudienceFilter === "all" ||

                material.audienceType === tasksMaterialAudienceFilter;


            const mentorMatch =

                tasksMaterialMentorFilter === "all" ||

                material.mentor === tasksMaterialMentorFilter;


            const branchMatch =

                tasksMaterialBranchFilter === "all" ||

                material.branches.includes(tasksMaterialBranchFilter);


            return (
                searchMatch &&
                audienceMatch &&
                mentorMatch &&
                branchMatch
            );

        });

    }, [

        tasksMaterialList,
        tasksMaterialSearch,
        tasksMaterialAudienceFilter,
        tasksMaterialMentorFilter,
        tasksMaterialBranchFilter

    ]);


    // =================================================
    // EXPORT CSV
    // =================================================

    const tasksMaterialHandleExport = () => {

        if (!tasksMaterialFilteredList.length) {

            alert("No materials available to export.");

            return;

        }

        const headers = [

            "Title",
            "Mentor",
            "Branch",
            "Audience",
            "Selected Audience",
            "Attachments",
            "Allow Interns to Download",
            "Created Date"

        ];


        const rows = tasksMaterialFilteredList.map(material => [

            material.title,
            material.mentor,
            material.branches.join(", "),
            material.audienceType,
            material.selectedAudience.join(", "),

            material.attachments
                .map(file => file.name)
                .join(", "),

            material.allowDownload ? "Yes" : "No",

            material.createdDate

        ]);


        const csv = [

            headers,
            ...rows

        ].map(row =>

            row.map(value =>

                `"${String(value ?? "").replace(/"/g, '""')}"`

            ).join(",")

        ).join("\n");


        const blob = new Blob(

            ["\uFEFF" + csv],

            { type: "text/csv;charset=utf-8;" }

        );


        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "materials.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

    };


    // =================================================
    // RENDER FORM
    // =================================================

    const tasksMaterialRenderForm = () => {

        const isView = tasksMaterialMode === "view";

        return (

            <form
                className="tasks-material-form"
                onSubmit={tasksMaterialHandleSubmit}
            >

                {/* DETAIL HEADER */}

                {tasksMaterialMode !== "create" && (

                    <div className="tasks-material-detail-header">

                        <h2>
                            {tasksMaterialFormData.title || "Material Details"}
                        </h2>

                        <button
                            type="button"
                            className="tasks-material-back-btn"
                            onClick={tasksMaterialHandleCancel}
                        >
                            <MdArrowBack />
                            Back
                        </button>

                    </div>

                )}


                {/* MATERIAL DETAILS */}

                <div className="tasks-material-form-section">

                    <h3>Material Details</h3>

                    <div className="tasks-material-section-divider"></div>


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
                                value={tasksMaterialFormData.title}
                                onChange={e =>
                                    tasksMaterialUpdateField(
                                        "title",
                                        e.target.value
                                    )
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
                                value={tasksMaterialFormData.mentor}
                                onChange={e =>
                                    tasksMaterialUpdateField(
                                        "mentor",
                                        e.target.value
                                    )
                                }
                                disabled={isView}
                                required
                            >

                                <option value="">
                                    Choose Mentor
                                </option>

                                {tasksMaterialMentors.map(mentor => (

                                    <option key={mentor} value={mentor}>
                                        {mentor}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* ATTACHMENTS */}

                        <div className="tasks-material-form-group">

                            <label htmlFor="tasks-material-attachments">
                                Attachments <span>*</span>
                                <small>(JPG/PNG/PDF only)</small>
                            </label>

                            {!isView ? (

                                <label className="tasks-material-upload-box">

                                    <span>
                                        {tasksMaterialFormData.attachments.length
                                            ? tasksMaterialFormData.attachments
                                                .map(file => file.name)
                                                .join(", ")
                                            : "Upload Attachment (Image/PDF)"}
                                    </span>

                                    <MdUploadFile />

                                    <input
                                        id="tasks-material-attachments"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        multiple
                                        hidden
                                        onChange={tasksMaterialHandleUpload}
                                    />

                                </label>

                            ) : (

                                <div className="tasks-material-readonly-files">

                                    {tasksMaterialFormData.attachments.map(
                                        (file, index) => (

                                            <div key={index}>

                                                <span>{file.name}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        tasksMaterialDownloadAttachment(file)
                                                    }
                                                    title="Download"
                                                >
                                                    <MdFileDownload />
                                                </button>

                                            </div>

                                        )
                                    )}

                                    {!tasksMaterialFormData.attachments.length && (
                                        <span>No attachments</span>
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ATTACHMENT PREVIEW */}

                    {!isView &&
                        tasksMaterialFormData.attachments.length > 0 && (

                            <div className="tasks-material-attachment-list">

                                {tasksMaterialFormData.attachments.map(
                                    (file, index) => (

                                        <div
                                            className="tasks-material-attachment-item"
                                            key={`${file.name}-${index}`}
                                        >

                                            <span>{file.name}</span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    tasksMaterialRemoveAttachment(index)
                                                }
                                                aria-label="Remove attachment"
                                            >
                                                <MdClose />
                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}


                    {/* DOWNLOAD PERMISSION */}

                    <div className="tasks-material-download-permission">

                        <input
                            id="tasks-material-allow-download"
                            type="checkbox"
                            checked={tasksMaterialFormData.allowDownload}
                            disabled={isView}
                            onChange={e =>
                                tasksMaterialUpdateField(
                                    "allowDownload",
                                    e.target.checked
                                )
                            }
                        />

                        <label htmlFor="tasks-material-allow-download">
                            Allow Interns to Download
                        </label>

                    </div>

                </div>


                {/* AUDIENCE SELECTION */}

                <div className="tasks-material-audience-section">

                    <h3>Audience Selection</h3>

                    <div className="tasks-material-section-divider"></div>


                    <div className="tasks-material-audience-grid">

                        {/* BRANCH SELECTION */}

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
                                        setTasksMaterialBranchDropdown(
                                            !tasksMaterialBranchDropdown
                                        )
                                    }
                                >

                                    <span>
                                        {tasksMaterialFormData.branches.length
                                            ? tasksMaterialFormData.branches.join(", ")
                                            : "Select Branches"}
                                    </span>

                                    <MdKeyboardArrowDown />

                                </button>


                                {tasksMaterialBranchDropdown && !isView && (

                                    <div className="tasks-material-dropdown-menu">

                                        {tasksMaterialBranches.map(branch => (

                                            <label
                                                className="tasks-material-dropdown-option"
                                                key={branch}
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={tasksMaterialFormData.branches.includes(branch)}
                                                    onChange={() =>
                                                        tasksMaterialToggleBranch(branch)
                                                    }
                                                />

                                                <span>{branch}</span>

                                            </label>

                                        ))}

                                        <button
                                            type="button"
                                            className="tasks-material-dropdown-done"
                                            onClick={() =>
                                                setTasksMaterialBranchDropdown(false)
                                            }
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
                                Audience Type

                                {!tasksMaterialFormData.branches.length && (
                                    <small className="tasks-material-hint">
                                        (Select branches first)
                                    </small>
                                )}

                                <span>*</span>
                            </label>

                            <select
                                id="tasks-material-audience-type"
                                value={tasksMaterialFormData.audienceType}
                                disabled={
                                    isView ||
                                    !tasksMaterialFormData.branches.length
                                }
                                onChange={e =>
                                    tasksMaterialHandleAudienceType(
                                        e.target.value
                                    )
                                }
                                required
                            >

                                <option value="">
                                    {tasksMaterialFormData.branches.length
                                        ? "Choose Audience Type"
                                        : "Choose branches first"}
                                </option>

                                {tasksMaterialAudienceTypes.map(type => (

                                    <option key={type} value={type}>
                                        {type}
                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* CATEGORY / COURSE / INTERN SELECTION */}

                        {tasksMaterialFormData.audienceType && (

                            <div className="tasks-material-form-group tasks-material-audience-select-group">

                                <label>
                                    {tasksMaterialFormData.audienceType === "By Category"
                                        ? "Select Categories"
                                        : tasksMaterialFormData.audienceType === "By Courses"
                                            ? "Select Courses"
                                            : "Select Interns"}
                                </label>


                                {tasksMaterialFormData.audienceType === "Individual Interns" ? (

                                    <div className="tasks-material-intern-search-wrapper">

                                        <div className="tasks-material-intern-search">

                                            <input
                                                id="tasks-material-intern-search"
                                                type="text"
                                                placeholder="Search Intern"
                                                value={tasksMaterialInternSearch}
                                                disabled={isView}
                                                onChange={e =>
                                                    setTasksMaterialInternSearch(
                                                        e.target.value
                                                    )
                                                }
                                            />

                                            <MdSearch />

                                        </div>


                                        {!isView &&
                                            tasksMaterialInternSearch.trim() !== "" && (

                                                <div className="tasks-material-intern-results">

                                                    {tasksMaterialFilteredInterns.map(intern => (

                                                        <button
                                                            type="button"
                                                            key={intern}
                                                            onClick={() =>
                                                                tasksMaterialAddAudience(intern)
                                                            }
                                                        >
                                                            {intern}
                                                        </button>

                                                    ))}

                                                    {!tasksMaterialFilteredInterns.length && (
                                                        <p>No interns found</p>
                                                    )}

                                                </div>

                                            )}

                                    </div>

                                ) : (

                                    <select
                                        id="tasks-material-audience-selection"
                                        value={tasksMaterialSelectionValue}
                                        disabled={isView}
                                        onChange={e => {

                                            setTasksMaterialSelectionValue(
                                                e.target.value
                                            );

                                            tasksMaterialAddAudience(
                                                e.target.value
                                            );

                                        }}
                                    >

                                        <option value="">
                                            {tasksMaterialFormData.audienceType === "By Category"
                                                ? "Select Category"
                                                : "Select Course"}
                                        </option>

                                        {tasksMaterialGetAudienceOptions()
                                            .filter(item =>
                                                !tasksMaterialFormData.selectedAudience.includes(item)
                                            )
                                            .map(item => (

                                                <option key={item} value={item}>
                                                    {item}
                                                </option>

                                            ))}

                                    </select>

                                )}

                            </div>

                        )}

                    </div>


                    {/* SELECTED AUDIENCE */}

                    {tasksMaterialRenderSelectedAudience()}

                </div>


                {/* FORM BUTTONS */}

                <div className="tasks-material-form-buttons">

                    {tasksMaterialMode === "create" && (

                        <>

                            <button
                                type="button"
                                className="tasks-material-cancel-btn"
                                onClick={tasksMaterialHandleCancel}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="tasks-material-primary-btn"
                            >
                                Add Material
                            </button>

                        </>

                    )}


                    {tasksMaterialMode === "view" && (

                        <button
                            type="button"
                            className="tasks-material-primary-btn"
                            onClick={() =>
                                setTasksMaterialMode("edit")
                            }
                        >
                            Edit
                        </button>

                    )}


                    {tasksMaterialMode === "edit" && (

                        <>

                            <button
                                type="button"
                                className="tasks-material-cancel-btn"
                                onClick={() =>
                                    tasksMaterialHandleDelete(
                                        tasksMaterialSelectedId
                                    )
                                }
                            >
                                Delete
                            </button>

                            <button
                                type="submit"
                                className="tasks-material-primary-btn"
                            >
                                Save
                            </button>

                        </>

                    )}

                </div>

            </form>

        );

    };


    // =================================================
    // MAIN RETURN
    // =================================================

    return (

        <div className="tasks-material-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="tasks-material-header">

                <div className="tasks-material-header-title">

                    <h2>Material</h2>

                    <p>
                        Material
                        <span> › </span>
                        {tasksMaterialMode === "list"
                            ? "materialList"
                            : tasksMaterialMode === "create"
                                ? "new-material"
                                : tasksMaterialMode === "view"
                                    ? "view-material"
                                    : "edit-material"}
                    </p>

                </div>


                <div className="tasks-material-admin-profile">

                    <div className="tasks-material-admin-avatar">
                        <MdPersonOutline />
                    </div>

                    <div className="tasks-material-admin-info">

                        <h4>vijitha</h4>

                        <p>super admin</p>

                    </div>

                </div>

            </div>


            {/* =========================================
                TOP NAVIGATION
            ========================================= */}

            {(tasksMaterialMode === "list" ||
                tasksMaterialMode === "create") && (

                <div className="tasks-material-top-navigation">

                    <div className="tasks-material-tabs">

                        <button
                            type="button"
                            className={
                                tasksMaterialMode === "list"
                                    ? "tasks-material-tab-active"
                                    : ""
                            }
                            onClick={() => {

                                tasksMaterialResetForm();

                                setTasksMaterialMode("list");

                            }}
                        >
                            Material List
                        </button>


                        <button
                            type="button"
                            className={
                                tasksMaterialMode === "create"
                                    ? "tasks-material-tab-active"
                                    : ""
                            }
                            onClick={tasksMaterialHandleNew}
                        >
                            New Material
                        </button>

                    </div>


                    <button
                        type="button"
                        className="tasks-material-export-btn"
                        onClick={tasksMaterialHandleExport}
                    >
                        <MdFileDownload />
                        Export
                    </button>

                </div>

            )}


            {/* =========================================
                MATERIAL LIST
            ========================================= */}

            {tasksMaterialMode === "list" && (

                <div className="tasks-material-list-container">


                    {/* SEARCH AND FILTERS */}

                    <div className="tasks-material-filter-row">

                        <div className="tasks-material-search-box">

                            <MdSearch />

                            <input
                                id="tasks-material-search"
                                type="text"
                                placeholder="Search Materials"
                                value={tasksMaterialSearch}
                                onChange={e =>
                                    setTasksMaterialSearch(e.target.value)
                                }
                            />

                            {tasksMaterialSearch && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setTasksMaterialSearch("")
                                    }
                                >
                                    <MdClose />
                                </button>

                            )}

                        </div>


                        {/* AUDIENCE FILTER */}

                        <select
                            id="tasks-material-audience-filter"
                            value={tasksMaterialAudienceFilter}
                            onChange={e =>
                                setTasksMaterialAudienceFilter(e.target.value)
                            }
                        >

                            <option value="all">All Audience</option>

                            {tasksMaterialAudienceTypes.map(type => (

                                <option key={type} value={type}>
                                    {type}
                                </option>

                            ))}

                        </select>


                        {/* MENTOR FILTER */}

                        <select
                            id="tasks-material-mentor-filter"
                            value={tasksMaterialMentorFilter}
                            onChange={e =>
                                setTasksMaterialMentorFilter(e.target.value)
                            }
                        >

                            <option value="all">All Mentors</option>

                            {tasksMaterialMentors.map(mentor => (

                                <option key={mentor} value={mentor}>
                                    {mentor}
                                </option>

                            ))}

                        </select>


                        {/* BRANCH FILTER */}

                        <select
                            id="tasks-material-branch-filter"
                            value={tasksMaterialBranchFilter}
                            onChange={e =>
                                setTasksMaterialBranchFilter(e.target.value)
                            }
                        >

                            <option value="all">All Branches</option>

                            {tasksMaterialBranches.map(branch => (

                                <option key={branch} value={branch}>
                                    {branch}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* TABLE */}

                    {tasksMaterialFilteredList.length > 0 ? (

                        <div className="tasks-material-table-wrapper">

                            <table className="tasks-material-table">

                                <thead>

                                    <tr>

                                        <th>Title</th>

                                        <th>Mentor</th>

                                        <th>Branch</th>

                                        <th>Audience</th>

                                        <th>Attachments</th>

                                        <th>Created Date</th>

                                        <th>Actions</th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {tasksMaterialFilteredList.map(material => (

                                        <tr key={material.id}>

                                            <td className="tasks-material-title-cell">
                                                {material.title}
                                            </td>

                                            <td>{material.mentor}</td>


                                            <td>

                                                <div className="tasks-material-branch-tags">

                                                    {material.branches.map(branch => (

                                                        <span key={branch}>
                                                            {branch}
                                                        </span>

                                                    ))}

                                                </div>

                                            </td>


                                            <td>

                                                <span className="tasks-material-audience-badge">

                                                    {material.audienceType}

                                                </span>

                                            </td>


                                            {/* ATTACHMENTS */}

                                            <td>

                                                <div className="tasks-material-attachment-actions">

                                                    <button
                                                        type="button"
                                                        title="View attachments"
                                                        onClick={() =>
                                                            tasksMaterialHandleView(material)
                                                        }
                                                    >
                                                        <MdVisibility />
                                                    </button>

                                                    {material.allowDownload &&

                                                        material.attachments.length > 0 && (

                                                            <button
                                                                type="button"
                                                                title="Download attachments"
                                                                onClick={() =>
                                                                    material.attachments.forEach(
                                                                        tasksMaterialDownloadAttachment
                                                                    )
                                                                }
                                                            >
                                                                <MdFileDownload />
                                                            </button>

                                                        )}

                                                </div>

                                            </td>


                                            <td>
                                                {material.createdDate || "-"}
                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="tasks-material-action-buttons">

                                                    <button
                                                        type="button"
                                                        title="View"
                                                        onClick={() =>
                                                            tasksMaterialHandleView(material)
                                                        }
                                                    >
                                                        <MdVisibility />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            tasksMaterialHandleEdit(material)
                                                        }
                                                    >
                                                        <MdEdit />
                                                    </button>


                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        className="tasks-material-delete-icon"
                                                        onClick={() =>
                                                            tasksMaterialHandleDelete(material.id)
                                                        }
                                                    >
                                                        <MdDelete />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="tasks-material-empty-state">

                            <p>
                                No data available. Please add Material to view them here
                            </p>

                        </div>

                    )}


                    {/* TABLE FOOTER */}

                    {tasksMaterialFilteredList.length > 0 && (

                        <div className="tasks-material-list-footer">

                            <span>
                                {tasksMaterialFilteredList.length} materials
                            </span>

                        </div>

                    )}

                </div>

            )}


            {/* =========================================
                CREATE MATERIAL
            ========================================= */}

            {tasksMaterialMode === "create" && (

                <div className="tasks-material-form-container">

                    {tasksMaterialRenderForm()}

                </div>

            )}


            {/* =========================================
                VIEW MATERIAL
            ========================================= */}

            {tasksMaterialMode === "view" && tasksMaterialSelected && (

                <div className="tasks-material-detail-container">

                    {tasksMaterialRenderForm()}

                </div>

            )}


            {/* =========================================
                EDIT MATERIAL
            ========================================= */}

            {tasksMaterialMode === "edit" && tasksMaterialSelected && (

                <div className="tasks-material-detail-container">

                    {tasksMaterialRenderForm()}

                </div>

            )}

        </div>

    );

};

export default Taskmaterial;
