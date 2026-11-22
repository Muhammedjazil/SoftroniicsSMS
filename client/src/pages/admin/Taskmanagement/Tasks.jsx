
import React, { useEffect, useMemo, useState } from "react";

import {
    MdPersonOutline,
    MdFileDownload,
    MdUploadFile,
    MdSearch,
    MdClose,
    MdVisibility,
    MdEdit,
    MdDelete,
    MdArrowBack
} from "react-icons/md";

import AdminService from "../../../services/admin-api-services/AdminService";
import "./Tasks.css";

// =====================================================
// CONSTANTS
// =====================================================

const tasksEmptyForm = {
    title: "",
    taskType: "",
    module: "",
    assignedMentor: "",
    startDate: "",
    dueDate: "",
    totalMarks: "",
    description: "",
    status: "Pending",
    branch: [],
    audience: "",
    batches: [],
    categories: [],
    courses: [],
    individualInterns: []
};

const taskTypes = [
    "Daily Task",
    "Weekly Task",
    "Monthly Task",
    "Other"
];

const taskStatuses = [
    "Pending",
    "In Progress",
    "Completed",
    "Cancelled"
];

const audienceOptions = [
    "All interns",
    "By batches",
    "By Courses",
    "By Category",
    "Individual interns"
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getId = (item) => {
    if (!item) return "";
    return String(item._id || item.id || item);
};

const getName = (item, fields = []) => {
    if (!item) return "";

    for (const field of fields) {
        if (item[field]) return item[field];
    }

    return "";
};

const getArray = (response, keys = []) => {
    if (Array.isArray(response)) return response;

    for (const key of keys) {
        if (Array.isArray(response?.[key])) {
            return response[key];
        }
    }

    return [];
};

const getDateValue = (date) => {
    if (!date) return "";

    return new Date(date).toISOString().split("T")[0];
};

const getAudienceLabel = (task) => {
    if (task.audience === "By batches") {
        return (task.batches || [])
            .map(item => item.batchName || item)
            .join(", ");
    }

    if (task.audience === "By Courses") {
        return (task.courses || [])
            .map(item => item.courseName || item)
            .join(", ");
    }

    if (task.audience === "By Category") {
        return (task.categories || [])
            .map(item => item.categoryName || item)
            .join(", ");
    }

    if (task.audience === "Individual interns") {
        return (task.individualInterns || [])
            .map(item => item.fullName || item)
            .join(", ");
    }

    return "All interns";
};

// =====================================================
// TASK FORM COMPONENT
// =====================================================

const TasksForm = ({
    tasksMode,
    tasksFormData,
    setTasksFormData,
    tasksOnSubmit,
    tasksOnCancel,
    tasksOnDelete,
    dropdowns,
    selectedTask,
    attachment,
    setAttachment,
    loading
}) => {

    const tasksIsView = tasksMode === "view";

    const [internSearch, setInternSearch] = useState("");

    const updateField = (field, value) => {
        setTasksFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addItem = (field, value) => {
        if (!value) return;

        setTasksFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field]
                : [...prev[field], value]
        }));
    };

    const removeItem = (field, value) => {
        setTasksFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== value)
        }));
    };

    const handleBranch = (value) => {
        if (!value) return;

        setTasksFormData(prev => ({
            ...prev,
            branch: prev.branch.includes(value)
                ? prev.branch
                : [...prev.branch, value],

            audience: "",
            batches: [],
            categories: [],
            courses: [],
            individualInterns: []
        }));
    };

    const handleAudience = (value) => {
        setTasksFormData(prev => ({
            ...prev,
            audience: value,
            batches: [],
            categories: [],
            courses: [],
            individualInterns: []
        }));

        setInternSearch("");
    };

    const selectedBranches = dropdowns.branches.filter(item =>
        tasksFormData.branch.includes(getId(item))
    );

    const availableBatches = dropdowns.batches.filter(item =>
        tasksFormData.branch.includes(getId(item.branch)) &&
        !tasksFormData.batches.includes(getId(item))
    );

    const availableCategories = dropdowns.categories.filter(item =>
        (item.branch || []).some(branch =>
            tasksFormData.branch.includes(getId(branch))
        ) &&
        !tasksFormData.categories.includes(getId(item))
    );

    const availableCourses = dropdowns.courses.filter(item => {
        const category = item.category;

        const selectedCategory = dropdowns.categories.find(
            cat => getId(cat) === getId(category)
        );

        return (
            selectedCategory &&
            (selectedCategory.branch || []).some(branch =>
                tasksFormData.branch.includes(getId(branch))
            ) &&
            !tasksFormData.courses.includes(getId(item))
        );
    });

    const availableInterns = dropdowns.interns.filter(item =>
        tasksFormData.branch.includes(getId(item.branch)) &&
        !tasksFormData.individualInterns.includes(getId(item)) &&
        (item.fullName || "")
            .toLowerCase()
            .includes(internSearch.toLowerCase())
    );

    const selectedItems = (field, data, nameField, heading) => {

        if (!tasksFormData[field]?.length) return null;

        return (
            <div className="tasks-added-section">

                <h4>{heading}</h4>

                <div className="tasks-selected-list">

                    {tasksFormData[field].map(id => {

                        const item = data.find(
                            element => getId(element) === id
                        );

                        return (
                            <div className="tasks-selected-item" key={id}>

                                <span>
                                    {item?.[nameField] || id}
                                </span>

                                {!tasksIsView && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(field, id)}
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

    return (

        <form
            className={`tasks-form ${tasksIsView ? "tasks-view-mode" : ""}`}
            onSubmit={tasksOnSubmit}
        >

            {/* HEADER */}

            {tasksMode !== "create" && (

                <div className="tasks-detail-header">

                    <h2>{tasksFormData.title}</h2>

                    <button
                        type="button"
                        className="tasks-back-btn"
                        onClick={tasksOnCancel}
                    >
                        <MdArrowBack />
                        Back
                    </button>

                </div>

            )}

            {/* TASK DETAILS */}

            <h3 className="tasks-section-heading">
                Task Details
            </h3>

            <div className="tasks-form-grid">

                <div className="tasks-form-group">

                    <label>
                        Title <span className="tasks-required">*</span>
                    </label>

                    <input
                        type="text"
                        placeholder="Enter Task Title"
                        value={tasksFormData.title}
                        onChange={e => updateField("title", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>

                <div className="tasks-form-group">

                    <label>
                        Task Type <span className="tasks-required">*</span>
                    </label>

                    <select
                        value={tasksFormData.taskType}
                        onChange={e => updateField("taskType", e.target.value)}
                        disabled={tasksIsView}
                        required
                    >

                        <option value="">Choose Task Type</option>

                        {taskTypes.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="tasks-form-group">

                    <label>
                        Module <span className="tasks-required">*</span>
                    </label>

                    <select
                        value={tasksFormData.module}
                        onChange={e => updateField("module", e.target.value)}
                        disabled={tasksIsView}
                        required
                    >

                        <option value="">Choose Module</option>

                        {dropdowns.modules.map(item => (
                            <option
                                key={getId(item)}
                                value={item.moduleName}
                            >
                                {item.moduleName}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="tasks-form-group">

                    <label>
                        Assigned Mentor <span className="tasks-required">*</span>
                    </label>

                    <select
                        value={tasksFormData.assignedMentor}
                        onChange={e =>
                            updateField("assignedMentor", e.target.value)
                        }
                        disabled={tasksIsView}
                        required
                    >

                        <option value="">Choose Mentor</option>

                        {dropdowns.mentors.map(item => (
                            <option key={getId(item)} value={getId(item)}>
                                {getName(item, ["fullName", "name", "email"])}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="tasks-form-group">

                    <label>
                        Start Date <span className="tasks-required">*</span>
                    </label>

                    <input
                        type="date"
                        value={tasksFormData.startDate}
                        onChange={e => updateField("startDate", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>

                <div className="tasks-form-group">

                    <label>
                        Due Date <span className="tasks-required">*</span>
                    </label>

                    <input
                        type="date"
                        value={tasksFormData.dueDate}
                        onChange={e => updateField("dueDate", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>

                <div className="tasks-form-group">

                    <label>Total Marks</label>

                    <input
                        type="number"
                        min="0"
                        value={tasksFormData.totalMarks}
                        onChange={e => updateField("totalMarks", e.target.value)}
                        disabled={tasksIsView}
                    />

                </div>

                <div className="tasks-form-group">

                    <label>Status</label>

                    <select
                        value={tasksFormData.status}
                        onChange={e => updateField("status", e.target.value)}
                        disabled={tasksIsView}
                    >

                        {taskStatuses.map(status => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}

                    </select>

                </div>

                <div className="tasks-form-group tasks-full-width">

                    <label>
                        Description <span className="tasks-required">*</span>
                    </label>

                    <textarea
                        rows="4"
                        placeholder="Enter Task Description"
                        value={tasksFormData.description}
                        onChange={e => updateField("description", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>

                {/* ATTACHMENT */}

                <div className="tasks-form-group">

                    <label>
                        Attachment
                        <span className="tasks-optional">
                            {" "}(Optional - JPG/PNG/PDF)
                        </span>
                    </label>

                    {tasksIsView ? (

                        <div className="tasks-readonly-file">

                            {tasksFormData.attachments
                                ? (
                                    <a
                                        href={`http://localhost:7000${tasksFormData.attachments}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View Attachment
                                    </a>
                                )
                                : "No attachment"}

                        </div>

                    ) : (

                        <label className="tasks-upload-box">

                            <span>
                                {attachment?.name ||
                                    (tasksFormData.attachments
                                        ? "Existing attachment selected"
                                        : "Upload Attachment")}
                            </span>

                            <MdUploadFile />

                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.pdf"
                                hidden
                                onChange={e =>
                                    setAttachment(e.target.files[0] || null)
                                }
                            />

                        </label>

                    )}

                </div>

            </div>

            {/* BRANCHES */}

            <div className="tasks-section-divider"></div>

            <h3 className="tasks-section-heading">
                Branch Details
            </h3>

            <div className="tasks-form-grid">

                <div className="tasks-form-group">

                    <label>
                        Branches <span className="tasks-required">*</span>
                    </label>

                    <select
                        value=""
                        onChange={e => handleBranch(e.target.value)}
                        disabled={tasksIsView}
                    >

                        <option value="">Select Branch</option>

                        {dropdowns.branches
                            .filter(item =>
                                !tasksFormData.branch.includes(getId(item))
                            )
                            .map(item => (
                                <option key={getId(item)} value={getId(item)}>
                                    {item.branchName}
                                </option>
                            ))}

                    </select>

                </div>

            </div>

            {selectedBranches.length > 0 && (

                <div className="tasks-added-section tasks-branch-section">

                    <h4>Selected Branches</h4>

                    <div className="tasks-selected-list">

                        {selectedBranches.map(item => (

                            <div
                                className="tasks-selected-item"
                                key={getId(item)}
                            >

                                <span>{item.branchName}</span>

                                {!tasksIsView && (

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTasksFormData(prev => ({
                                                ...prev,
                                                branch: prev.branch.filter(
                                                    id => id !== getId(item)
                                                ),
                                                audience: "",
                                                batches: [],
                                                categories: [],
                                                courses: [],
                                                individualInterns: []
                                            }));
                                        }}
                                    >
                                        <MdClose />
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>

                </div>

            )}

            {/* AUDIENCE */}

            <div className="tasks-section-divider"></div>

            <h3 className="tasks-section-heading tasks-audience-heading">
                Audience Details
            </h3>

            <div className="tasks-audience-grid">

                <div className="tasks-form-group">

                    <label>
                        Audience

                        {!tasksFormData.branch.length && (
                            <span className="tasks-select-warning">
                                (Select branches first)
                            </span>
                        )}

                    </label>

                    <select
                        value={tasksFormData.audience}
                        onChange={e => handleAudience(e.target.value)}
                        disabled={tasksIsView || !tasksFormData.branch.length}
                        required
                    >

                        <option value="">Choose Audience</option>

                        {audienceOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}

                    </select>

                </div>

                {/* BATCHES */}

                {tasksFormData.audience === "By batches" && (

                    <div className="tasks-form-group">

                        <label>Select Batches</label>

                        <select
                            value=""
                            disabled={tasksIsView}
                            onChange={e => addItem("batches", e.target.value)}
                        >

                            <option value="">Select Batch</option>

                            {availableBatches.map(item => (
                                <option key={getId(item)} value={getId(item)}>
                                    {item.batchName}
                                </option>
                            ))}

                        </select>

                    </div>

                )}

                {/* CATEGORIES */}

                {tasksFormData.audience === "By Category" && (

                    <div className="tasks-form-group">

                        <label>Select Categories</label>

                        <select
                            value=""
                            disabled={tasksIsView}
                            onChange={e =>
                                addItem("categories", e.target.value)
                            }
                        >

                            <option value="">Select Category</option>

                            {availableCategories.map(item => (
                                <option key={getId(item)} value={getId(item)}>
                                    {item.categoryName}
                                </option>
                            ))}

                        </select>

                    </div>

                )}

                {/* COURSES */}

                {tasksFormData.audience === "By Courses" && (

                    <div className="tasks-form-group">

                        <label>Select Courses</label>

                        <select
                            value=""
                            disabled={tasksIsView}
                            onChange={e => addItem("courses", e.target.value)}
                        >

                            <option value="">Select Course</option>

                            {availableCourses.map(item => (
                                <option key={getId(item)} value={getId(item)}>
                                    {item.courseName}
                                </option>
                            ))}

                        </select>

                    </div>

                )}

                {/* INDIVIDUAL INTERNS */}

                {tasksFormData.audience === "Individual interns" && (

                    <div className="tasks-form-group">

                        <label>Select Interns</label>

                        <div className="tasks-intern-search">

                            <input
                                type="text"
                                placeholder="Search Intern"
                                value={internSearch}
                                disabled={tasksIsView}
                                onChange={e => setInternSearch(e.target.value)}
                            />

                            <MdSearch />

                        </div>

                        {!tasksIsView && internSearch && (

                            <div className="tasks-intern-results">

                                {availableInterns.map(item => (

                                    <button
                                        type="button"
                                        key={getId(item)}
                                        onClick={() => {
                                            addItem(
                                                "individualInterns",
                                                getId(item)
                                            );
                                            setInternSearch("");
                                        }}
                                    >
                                        {item.fullName}
                                    </button>

                                ))}

                                {availableInterns.length === 0 && (
                                    <p>No interns found</p>
                                )}

                            </div>

                        )}

                    </div>

                )}

            </div>

            {/* SELECTED AUDIENCE */}

            {tasksFormData.audience === "By batches" &&
                selectedItems(
                    "batches",
                    dropdowns.batches,
                    "batchName",
                    "Added Batches"
                )}

            {tasksFormData.audience === "By Category" &&
                selectedItems(
                    "categories",
                    dropdowns.categories,
                    "categoryName",
                    "Added Categories"
                )}

            {tasksFormData.audience === "By Courses" &&
                selectedItems(
                    "courses",
                    dropdowns.courses,
                    "courseName",
                    "Added Courses"
                )}

            {tasksFormData.audience === "Individual interns" &&
                selectedItems(
                    "individualInterns",
                    dropdowns.interns,
                    "fullName",
                    "Added Interns"
                )}

            {/* BUTTONS */}

            <div className="tasks-form-buttons">

                {tasksMode === "create" && (

                    <>

                        <button
                            type="button"
                            className="tasks-cancel-btn"
                            onClick={tasksOnCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="tasks-create-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Task"}
                        </button>

                    </>

                )}

                {tasksMode === "view" && (

                    <>

                        <button
                            type="button"
                            className="tasks-cancel-btn"
                            onClick={tasksOnDelete}
                        >
                            Delete
                        </button>

                        <button
                            type="button"
                            className="tasks-create-btn"
                            onClick={tasksOnCancel}
                        >
                            Edit Task
                        </button>

                    </>

                )}

                {tasksMode === "edit" && (

                    <>

                        <button
                            type="button"
                            className="tasks-cancel-btn"
                            onClick={tasksOnCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="tasks-create-btn"
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
// MAIN TASK COMPONENT
// =====================================================

const Tasks = () => {

    const {
        taketasks,
        taketaskbyid,
        gettaskdropdowns,
        createtask,
        updatetask,
        removetask
    } = AdminService();

    const [tasksList, setTasksList] = useState([]);

    const [tasksMode, setTasksMode] = useState("list");

    const [tasksSelectedId, setTasksSelectedId] = useState(null);

    const [tasksFormData, setTasksFormData] = useState({
        ...tasksEmptyForm
    });

    const [dropdowns, setDropdowns] = useState({
        branches: [],
        mentors: [],
        batches: [],
        categories: [],
        courses: [],
        interns: [],
        modules: []
    });

    const [attachment, setAttachment] = useState(null);

    const [loading, setLoading] = useState(false);

    const [pageLoading, setPageLoading] = useState(true);

    // FILTERS

    const [tasksSearch, setTasksSearch] = useState("");
    const [tasksTypeFilter, setTasksTypeFilter] = useState("all");
    const [tasksStatusFilter, setTasksStatusFilter] = useState("all");
    const [tasksAudienceFilter, setTasksAudienceFilter] = useState("all");
    const [tasksBranchFilter, setTasksBranchFilter] = useState("all");

    // =====================================================
    // FETCH TASKS
    // =====================================================

    const fetchTasks = async () => {

        try {

            const response = await taketasks();

            setTasksList(
                getArray(response, ["tasks", "data"])
            );

        } catch (error) {

            console.error(
                "Fetch Tasks Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to fetch tasks"
            );

        }

    };

    // =====================================================
    // FETCH DROPDOWNS
    // =====================================================

    const fetchDropdowns = async () => {

        try {

            const response = await gettaskdropdowns();

            setDropdowns({
                branches: getArray(response, ["branches"]),
                mentors: getArray(response, ["mentors"]),
                batches: getArray(response, ["batches"]),
                categories: getArray(response, ["categories"]),
                courses: getArray(response, ["courses"]),
                interns: getArray(response, ["interns"]),
                modules: getArray(response, ["modules"])
            });

        } catch (error) {

            console.error(
                "Dropdown Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to fetch dropdown data"
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
                fetchTasks(),
                fetchDropdowns()
            ]);

            setPageLoading(false);
        };

        loadData();

    }, []);

    // =====================================================
    // NORMALIZE TASK DATA
    // =====================================================

    const normalizeTask = (task) => {

        return {
            ...task,

            taskType: task.taskType || "",

            assignedMentor: getId(task.assignedMentor),

            module: task.module || "",

            startDate: getDateValue(task.startDate),

            dueDate: getDateValue(task.dueDate),

            totalMarks: task.totalMarks ?? "",

            status: task.status || "Pending",

            branch: (task.branch || []).map(getId),

            batches: (task.batches || []).map(getId),

            categories: (task.categories || []).map(getId),

            courses: (task.courses || []).map(getId),

            individualInterns: (
                task.individualInterns || []
            ).map(getId),

            attachments: task.attachments || null
        };
    };

    // =====================================================
    // OPEN NEW TASK
    // =====================================================

    const tasksHandleNew = () => {

        setTasksFormData({
            ...tasksEmptyForm
        });

        setAttachment(null);

        setTasksSelectedId(null);

        setTasksMode("create");
    };

    // =====================================================
    // VIEW TASK
    // =====================================================

    const tasksHandleView = async (task) => {

        try {

            setLoading(true);

            const response = await taketaskbyid(task._id);

            const selectedTask = response.task;

            setTasksSelectedId(selectedTask._id);

            setTasksFormData({
                ...tasksEmptyForm,
                ...normalizeTask(selectedTask)
            });

            setAttachment(null);

            setTasksMode("view");

        } catch (error) {

            console.error(
                "View Task Error:",
                error.response?.data || error
            );

            alert("Unable to open task");

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // EDIT TASK
    // =====================================================

    const tasksHandleEdit = async (task) => {

        await tasksHandleView(task);

        setTasksMode("edit");
    };

    // =====================================================
    // BUILD FORMDATA
    // =====================================================

    const buildTaskFormData = () => {

        const formData = new FormData();

        formData.append("title", tasksFormData.title);
        formData.append("taskType", tasksFormData.taskType);
        formData.append("module", tasksFormData.module);
        formData.append("assignedMentor", tasksFormData.assignedMentor);
        formData.append("startDate", tasksFormData.startDate);
        formData.append("dueDate", tasksFormData.dueDate);
        formData.append("description", tasksFormData.description);
        formData.append("totalMarks", tasksFormData.totalMarks || 0);
        formData.append("status", tasksFormData.status);
        formData.append("audience", tasksFormData.audience);

        formData.append(
            "branch",
            JSON.stringify(tasksFormData.branch)
        );

        formData.append(
            "batches",
            JSON.stringify(tasksFormData.batches)
        );

        formData.append(
            "categories",
            JSON.stringify(tasksFormData.categories)
        );

        formData.append(
            "courses",
            JSON.stringify(tasksFormData.courses)
        );

        formData.append(
            "individualInterns",
            JSON.stringify(tasksFormData.individualInterns)
        );

        if (attachment) {
            formData.append("attachments", attachment);
        }

        return formData;
    };

    // =====================================================
    // VALIDATE FORM
    // =====================================================

    const validateTask = () => {

        if (
            tasksFormData.dueDate &&
            tasksFormData.startDate &&
            tasksFormData.dueDate < tasksFormData.startDate
        ) {
            alert("Due Date cannot be earlier than Start Date.");
            return false;
        }

        if (!tasksFormData.branch.length) {
            alert("Please select at least one branch.");
            return false;
        }

        if (!tasksFormData.audience) {
            alert("Please select an audience.");
            return false;
        }

        if (
            tasksFormData.audience === "By batches" &&
            !tasksFormData.batches.length
        ) {
            alert("Please select at least one batch.");
            return false;
        }

        if (
            tasksFormData.audience === "By Courses" &&
            !tasksFormData.courses.length
        ) {
            alert("Please select at least one course.");
            return false;
        }

        if (
            tasksFormData.audience === "By Category" &&
            !tasksFormData.categories.length
        ) {
            alert("Please select at least one category.");
            return false;
        }

        if (
            tasksFormData.audience === "Individual interns" &&
            !tasksFormData.individualInterns.length
        ) {
            alert("Please select at least one intern.");
            return false;
        }

        return true;
    };

    // =====================================================
    // CREATE / UPDATE TASK
    // =====================================================

    const tasksHandleSubmit = async (e) => {

        e.preventDefault();

        if (!validateTask()) return;

        try {

            setLoading(true);

            const formData = buildTaskFormData();

            if (tasksMode === "create") {

                await createtask(formData);

                alert("Task created successfully.");

            } else {

                await updatetask(tasksSelectedId, formData);

                alert("Task updated successfully.");

            }

            await fetchTasks();

            setTasksMode("list");

            setTasksSelectedId(null);

            setTasksFormData({
                ...tasksEmptyForm
            });

            setAttachment(null);

        } catch (error) {

            console.error(
                "Save Task Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to save task"
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // DELETE TASK
    // =====================================================

    const tasksHandleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this task?"
        );

        if (!confirmed) return;

        try {

            setLoading(true);

            await removetask(id);

            alert("Task permanently deleted.");

            await fetchTasks();

            setTasksMode("list");

            setTasksSelectedId(null);

            setTasksFormData({
                ...tasksEmptyForm
            });

        } catch (error) {

            console.error(
                "Delete Task Error:",
                error.response?.data || error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete task"
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // CANCEL / BACK
    // =====================================================

    const tasksHandleCancel = () => {

        if (tasksMode === "edit") {

            const originalTask = tasksList.find(
                task => task._id === tasksSelectedId
            );

            if (originalTask) {

                setTasksFormData({
                    ...tasksEmptyForm,
                    ...normalizeTask(originalTask)
                });

                setAttachment(null);

                setTasksMode("view");

                return;
            }
        }

        setTasksMode("list");

        setTasksSelectedId(null);

        setTasksFormData({
            ...tasksEmptyForm
        });

        setAttachment(null);
    };

    // =====================================================
    // FILTER TASKS
    // =====================================================

    const tasksFilteredList = useMemo(() => {

        return tasksList.filter(task => {

            const mentorName = getName(
                task.assignedMentor,
                ["fullName", "name", "email"]
            );

            const branchNames = (task.branch || [])
                .map(item => item.branchName || "")
                .join(" ");

            const searchMatch = [
                task.title,
                mentorName,
                task.module,
                task.taskType,
                branchNames
            ]
                .join(" ")
                .toLowerCase()
                .includes(tasksSearch.toLowerCase());

            const typeMatch =
                tasksTypeFilter === "all" ||
                task.taskType === tasksTypeFilter;

            const statusMatch =
                tasksStatusFilter === "all" ||
                task.status === tasksStatusFilter;

            const audienceMatch =
                tasksAudienceFilter === "all" ||
                task.audience === tasksAudienceFilter;

            const branchMatch =
                tasksBranchFilter === "all" ||
                (task.branch || []).some(
                    item => getId(item) === tasksBranchFilter
                );

            return (
                searchMatch &&
                typeMatch &&
                statusMatch &&
                audienceMatch &&
                branchMatch
            );
        });

    }, [
        tasksList,
        tasksSearch,
        tasksTypeFilter,
        tasksStatusFilter,
        tasksAudienceFilter,
        tasksBranchFilter
    ]);

    // =====================================================
    // EXPORT CSV
    // =====================================================

    const tasksHandleExport = () => {

        if (!tasksFilteredList.length) {
            alert("No tasks available to export.");
            return;
        }

        const headers = [
            "Title",
            "Task Type",
            "Module",
            "Mentor",
            "Start Date",
            "Due Date",
            "Total Marks",
            "Status",
            "Branches",
            "Audience",
            "Selected Audience"
        ];

        const rows = tasksFilteredList.map(task => {

            const mentorName = getName(
                task.assignedMentor,
                ["fullName", "name", "email"]
            );

            const selectedAudience = [
                ...(task.batches || []).map(item => item.batchName),
                ...(task.categories || []).map(item => item.categoryName),
                ...(task.courses || []).map(item => item.courseName),
                ...(task.individualInterns || []).map(item => item.fullName)
            ].filter(Boolean).join("; ");

            return [
                task.title,
                task.taskType,
                task.module,
                mentorName,
                getDateValue(task.startDate),
                getDateValue(task.dueDate),
                task.totalMarks,
                task.status,
                (task.branch || [])
                    .map(item => item.branchName)
                    .join("; "),
                task.audience,
                selectedAudience
            ];
        });

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
        link.download = "tasks.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const tasksResetFilters = () => {

        setTasksSearch("");
        setTasksTypeFilter("all");
        setTasksStatusFilter("all");
        setTasksAudienceFilter("all");
        setTasksBranchFilter("all");
    };

    // =====================================================
    // SELECTED TASK
    // =====================================================

    const tasksSelected = tasksList.find(
        task => task._id === tasksSelectedId
    );

    // =====================================================
    // RENDER
    // =====================================================

    if (pageLoading) {

        return (
            <div className="tasks-page">
                <div className="tasks-empty-state">
                    Loading tasks...
                </div>
            </div>
        );
    }

    return (

        <div className="tasks-page">

            {/* HEADER */}

            {/* TOP NAVIGATION */}

            <div className="tasks-top-navigation">

                <div className="tasks-tabs">

                    <button
                        type="button"
                        className={
                            tasksMode === "list"
                                ? "tasks-tab-active"
                                : ""
                        }
                        onClick={() => {
                            setTasksMode("list");
                            setTasksSelectedId(null);
                        }}
                    >
                        Tasks List
                    </button>

                    <button
                        type="button"
                        className={
                            tasksMode === "create"
                                ? "tasks-tab-active"
                                : ""
                        }
                        onClick={tasksHandleNew}
                    >
                        New Task
                    </button>

                </div>

                <button
                    type="button"
                    className="tasks-export-btn"
                    onClick={tasksHandleExport}
                >
                    <MdFileDownload />
                    Export
                </button>

            </div>

            {/* TASK LIST */}

            {tasksMode === "list" && (

                <div className="tasks-list-container">

                    {/* FILTER PANEL */}

                    <div className="tasks-filter-panel">

                        <div className="tasks-search-box">

                            <MdSearch />

                            <input
                                type="text"
                                placeholder="Search Tasks"
                                value={tasksSearch}
                                onChange={e =>
                                    setTasksSearch(e.target.value)
                                }
                            />

                            {tasksSearch && (

                                <button
                                    type="button"
                                    onClick={() => setTasksSearch("")}
                                >
                                    <MdClose />
                                </button>

                            )}

                        </div>

                        <select
                            value={tasksTypeFilter}
                            onChange={e =>
                                setTasksTypeFilter(e.target.value)
                            }
                        >

                            <option value="all">All Types</option>

                            {taskTypes.map(type => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}

                        </select>

                        <select
                            value={tasksStatusFilter}
                            onChange={e =>
                                setTasksStatusFilter(e.target.value)
                            }
                        >

                            <option value="all">All Status</option>

                            {taskStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}

                        </select>

                        <select
                            value={tasksAudienceFilter}
                            onChange={e =>
                                setTasksAudienceFilter(e.target.value)
                            }
                        >

                            <option value="all">All Audience</option>

                            {audienceOptions.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}

                        </select>

                        <select
                            value={tasksBranchFilter}
                            onChange={e =>
                                setTasksBranchFilter(e.target.value)
                            }
                        >

                            <option value="all">All Branches</option>

                            {dropdowns.branches.map(item => (
                                <option
                                    key={getId(item)}
                                    value={getId(item)}
                                >
                                    {item.branchName}
                                </option>
                            ))}

                        </select>

                        <button
                            type="button"
                            className="tasks-reset-filter"
                            onClick={tasksResetFilters}
                        >
                            Reset
                        </button>

                    </div>

                    {/* TABLE */}

                    {tasksFilteredList.length > 0 ? (

                        <div className="tasks-table-wrapper">

                            <table className="tasks-table">

                                <thead>

                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Task Type</th>
                                        <th>Mentor</th>
                                        <th>Start Date</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th>Audience</th>
                                        <th>Branches</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {tasksFilteredList.map((task, index) => (

                                        <tr key={task._id}>

                                            <td>{index + 1}</td>

                                            <td className="tasks-title-cell">
                                                {task.title}
                                            </td>

                                            <td>{task.taskType}</td>

                                            <td>
                                                {getName(
                                                    task.assignedMentor,
                                                    ["fullName", "name", "email"]
                                                )}
                                            </td>

                                            <td>
                                                {getDateValue(task.startDate) || "-"}
                                            </td>

                                            <td>
                                                {getDateValue(task.dueDate) || "-"}
                                            </td>

                                            <td>

                                                <span
                                                    className={`tasks-status tasks-status-${(
                                                        task.status || ""
                                                    ).toLowerCase().replace(/\s+/g, "-")}`}
                                                >
                                                    {task.status}
                                                </span>

                                            </td>

                                            <td>{task.audience || "-"}</td>

                                            <td>
                                                {(task.branch || [])
                                                    .map(item => item.branchName)
                                                    .join(", ") || "-"}
                                            </td>

                                            <td>

                                                <div className="tasks-action-buttons">

                                                    <button
                                                        type="button"
                                                        title="View"
                                                        onClick={() =>
                                                            tasksHandleView(task)
                                                        }
                                                    >
                                                        <MdVisibility />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() =>
                                                            tasksHandleEdit(task)
                                                        }
                                                    >
                                                        <MdEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        className="tasks-delete-icon"
                                                        onClick={() =>
                                                            tasksHandleDelete(task._id)
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

                        <div className="tasks-empty-state">

                            <p>
                                No tasks available. Please add tasks to view them here.
                            </p>

                        </div>

                    )}

                    {/* RESULT COUNT */}

                    <div className="tasks-list-footer">

                        <span>
                            Showing {tasksFilteredList.length} of {tasksList.length} tasks
                        </span>

                    </div>

                </div>

            )}

            {/* CREATE TASK */}

            {tasksMode === "create" && (

                <div className="tasks-form-container">

                    <TasksForm
                        tasksMode="create"
                        tasksFormData={tasksFormData}
                        setTasksFormData={setTasksFormData}
                        tasksOnSubmit={tasksHandleSubmit}
                        tasksOnCancel={tasksHandleCancel}
                        dropdowns={dropdowns}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        loading={loading}
                    />

                </div>

            )}

            {/* VIEW TASK */}

            {tasksMode === "view" && tasksSelected && (

                <div className="tasks-form-container">

                    <TasksForm
                        tasksMode="view"
                        tasksFormData={tasksFormData}
                        setTasksFormData={setTasksFormData}
                        tasksOnCancel={tasksHandleCancel}
                        tasksOnDelete={() =>
                            tasksHandleDelete(tasksSelected._id)
                        }
                        dropdowns={dropdowns}
                        selectedTask={tasksSelected}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        loading={loading}
                    />

                </div>

            )}

            {/* EDIT TASK */}

            {tasksMode === "edit" && tasksSelected && (

                <div className="tasks-form-container">

                    <TasksForm
                        tasksMode="edit"
                        tasksFormData={tasksFormData}
                        setTasksFormData={setTasksFormData}
                        tasksOnSubmit={tasksHandleSubmit}
                        tasksOnCancel={tasksHandleCancel}
                        dropdowns={dropdowns}
                        selectedTask={tasksSelected}
                        attachment={attachment}
                        setAttachment={setAttachment}
                        loading={loading}
                    />

                </div>

            )}

        </div>
    );
};

export default Tasks;
