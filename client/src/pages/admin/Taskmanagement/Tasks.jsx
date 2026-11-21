
import React, { useMemo, useState } from "react";
import {
    MdPersonOutline,
    MdKeyboardArrowDown,
    MdFileDownload,
    MdUploadFile,
    MdSearch,
    MdClose,
    MdVisibility,
    MdEdit,
    MdDelete,
    MdArrowBack
} from "react-icons/md";

import "./Tasks.css";

// =====================================================
// 1. INITIAL TASK DATA
// =====================================================

const tasksInitialData = [
    {
        id: 1,
        title: "Course Deadline Approaching",
        type: "Daily Task",
        module: "UI/UX",
        mentor: "John",
        startDate: "2025-02-07",
        dueDate: "2025-02-10",
        totalMarks: "10",
        description: "Complete the course tasks before the deadline.",
        attachments: ["task.pdf"],
        status: "Active",
        branches: ["Calicut"],
        audience: "Course",
        batches: [],
        courses: ["UI/UX Designing 3 M"],
        interns: [],
        achievedMarks: "9",
        answer: "",
        uploads: []
    },
    {
        id: 2,
        title: "Create a simple python code",
        type: "Weekly Task",
        module: "Python",
        mentor: "Priyesh",
        startDate: "2025-02-07",
        dueDate: "2025-02-10",
        totalMarks: "10",
        description: "Create a simple Python program.",
        attachments: [],
        status: "Pending",
        branches: ["Kochi"],
        audience: "Individual Interns",
        batches: [],
        courses: [],
        interns: ["John", "Thomson"],
        achievedMarks: "",
        answer: "",
        uploads: []
    },
    {
        id: 3,
        title: "Onam Festival celebration",
        type: "Weekly Task",
        module: "General",
        mentor: "Arjun",
        startDate: "2025-02-07",
        dueDate: "2025-02-10",
        totalMarks: "10",
        description: "Prepare for the Onam Festival celebration.",
        attachments: [],
        status: "Inactive",
        branches: ["Calicut", "Kochi"],
        audience: "All Interns",
        batches: [],
        courses: [],
        interns: [],
        achievedMarks: "",
        answer: "",
        uploads: []
    }
];


// =====================================================
// 2. DROPDOWN DATA
// =====================================================

const tasksBranches = [
    "Calicut",
    "Kochi",
    "Kozhikode",
    "Trivandrum",
    "Bangalore"
];

const tasksMentors = [
    "Thomas",
    "John",
    "Priyesh",
    "Arjun"
];

const tasksBatches = [
    "UI/UX_JUN_R0_B1_2025",
    "UI/UX_JUN_R0_B2_2025",
    "MERN_JUL_R0_B1_2025",
    "PYTHON_AUG_R0_B1_2025"
];

const tasksCourses = [
    "UI/UX 3M",
    "UI/UX 1M",
    "MERN Stack 6M",
    "Python Full Stack 6M"
];

const tasksInterns = [
    "John",
    "Thomson",
    "Arun",
    "Rahul",
    "Akhil"
];

const tasksAudienceOptions = [
    "All Interns",
    "Batches",
    "Course",
    "Individual Interns"
];


// =====================================================
// 3. EMPTY FORM DATA
// =====================================================

const tasksEmptyForm = {
    title: "",
    type: "",
    module: "",
    mentor: "",
    startDate: "",
    dueDate: "",
    totalMarks: "",
    description: "",
    attachments: [],
    status: "",
    branches: [],
    audience: "",
    batches: [],
    courses: [],
    interns: [],
    achievedMarks: "",
    answer: "",
    uploads: []
};


// =====================================================
// 4. TASK FORM COMPONENT
// =====================================================

const TasksForm = ({
    tasksMode,
    tasksFormData,
    setTasksFormData,
    tasksOnSubmit,
    tasksOnCancel,
    tasksOnDelete
}) => {

    const tasksIsView = tasksMode === "view";

    const [tasksInternSearch, setTasksInternSearch] = useState("");

    // Update field

    const tasksUpdateField = (field, value) => {
        setTasksFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    // Add multiple selected items

    const tasksAddItem = (field, value) => {

        if (!value) return;

        setTasksFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field]
                : [...prev[field], value]
        }));
    };


    // Remove selected item

    const tasksRemoveItem = (field, value) => {

        setTasksFormData(prev => ({
            ...prev,
            [field]: prev[field].filter(item => item !== value)
        }));
    };


    // Handle branch selection

    const tasksHandleBranch = (value) => {

        if (!value) return;

        setTasksFormData(prev => ({
            ...prev,
            branches: prev.branches.includes(value)
                ? prev.branches
                : [...prev.branches, value],
            audience: "",
            batches: [],
            courses: [],
            interns: []
        }));
    };


    // Handle audience selection

    const tasksHandleAudience = (value) => {

        setTasksFormData(prev => ({
            ...prev,
            audience: value,
            batches: [],
            courses: [],
            interns: []
        }));

        setTasksInternSearch("");
    };


    // File upload

    const tasksHandleFiles = (field, files) => {

        if (!files || files.length === 0) return;

        const tasksNewFiles = Array.from(files).map(file => file.name);

        setTasksFormData(prev => ({
            ...prev,
            [field]: [...prev[field], ...tasksNewFiles]
        }));
    };


    // Filter interns

    const tasksFilteredInterns = tasksInterns.filter(intern =>
        intern.toLowerCase().includes(tasksInternSearch.toLowerCase()) &&
        !tasksFormData.interns.includes(intern)
    );


    // Render selected items

    const tasksRenderSelectedItems = (field, heading) => {

        if (!tasksFormData[field].length) return null;

        return (
            <div className="tasks-added-section">

                <h4>{heading}</h4>

                <div className="tasks-selected-list">

                    {tasksFormData[field].map(item => (

                        <div className="tasks-selected-item" key={item}>

                            <span>{item}</span>

                            {!tasksIsView && (
                                <button
                                    type="button"
                                    onClick={() => tasksRemoveItem(field, item)}
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


    return (

        <form
            className={`tasks-form ${tasksIsView ? "tasks-view-mode" : ""}`}
            onSubmit={tasksOnSubmit}
        >

            {/* VIEW HEADER */}

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

                {/* TITLE */}

                <div className="tasks-form-group">

                    <label>Title <span className="tasks-required">*</span></label>

                    <input
                        type="text"
                        placeholder="Enter Task Title"
                        value={tasksFormData.title}
                        onChange={e => tasksUpdateField("title", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>


                {/* TASK TYPE */}

                <div className="tasks-form-group">

                    <label>Task Type <span className="tasks-required">*</span></label>

                    <select
                        value={tasksFormData.type}
                        onChange={e => tasksUpdateField("type", e.target.value)}
                        disabled={tasksIsView}
                        required
                    >
                        <option value="">Choose Task Type</option>
                        <option value="Daily Task">Daily Task</option>
                        <option value="Weekly Task">Weekly Task</option>
                        <option value="Assignment">Assignment</option>
                        <option value="Project">Project</option>
                    </select>

                </div>


                {/* MODULE */}

                <div className="tasks-form-group">

                    <label>Module <span className="tasks-required">*</span></label>

                    <select
                        value={tasksFormData.module}
                        onChange={e => tasksUpdateField("module", e.target.value)}
                        disabled={tasksIsView}
                        required
                    >
                        <option value="">Choose Module</option>
                        <option value="Figma">Figma</option>
                        <option value="HTML">HTML</option>
                        <option value="CSS">CSS</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="React">React</option>
                        <option value="Node JS">Node JS</option>
                        <option value="Python">Python</option>
                        <option value="General">General</option>
                    </select>

                </div>


                {/* MENTOR */}

                <div className="tasks-form-group">

                    <label>Assigned Mentor <span className="tasks-required">*</span></label>

                    <select
                        value={tasksFormData.mentor}
                        onChange={e => tasksUpdateField("mentor", e.target.value)}
                        disabled={tasksIsView}
                        required
                    >
                        <option value="">Choose Mentor</option>

                        {tasksMentors.map(mentor => (
                            <option key={mentor} value={mentor}>
                                {mentor}
                            </option>
                        ))}

                    </select>

                </div>


                {/* START DATE */}

                <div className="tasks-form-group">

                    <label>Start Date <span className="tasks-required">*</span></label>

                    <input
                        type="date"
                        value={tasksFormData.startDate}
                        onChange={e => tasksUpdateField("startDate", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>


                {/* DUE DATE */}

                <div className="tasks-form-group">

                    <label>Due Date <span className="tasks-required">*</span></label>

                    <input
                        type="date"
                        value={tasksFormData.dueDate}
                        onChange={e => tasksUpdateField("dueDate", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>


                {/* TOTAL MARKS */}

                <div className="tasks-form-group">

                    <label>Total Marks</label>

                    <input
                        type="number"
                        min="0"
                        placeholder="Enter Total Marks"
                        value={tasksFormData.totalMarks}
                        onChange={e => tasksUpdateField("totalMarks", e.target.value)}
                        disabled={tasksIsView}
                    />

                </div>


                {/* DESCRIPTION */}

                <div className="tasks-form-group tasks-full-width">

                    <label>Description <span className="tasks-required">*</span></label>

                    <textarea
                        rows="4"
                        placeholder="Enter Task Description"
                        value={tasksFormData.description}
                        onChange={e => tasksUpdateField("description", e.target.value)}
                        disabled={tasksIsView}
                        required
                    />

                </div>


                {/* ATTACHMENTS */}

                <div className="tasks-form-group">

                    <label>
                        Attachments
                        <span className="tasks-optional"> (Optional - JPG/PNG/PDF only)</span>
                    </label>

                    {tasksIsView ? (

                        <div className="tasks-readonly-file">
                            {tasksFormData.attachments.join(", ") || "No attachments"}
                        </div>

                    ) : (

                        <label className="tasks-upload-box">

                            <span>
                                {tasksFormData.attachments.length
                                    ? tasksFormData.attachments.join(", ")
                                    : "Upload Attachment"}
                            </span>

                            <MdUploadFile />

                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf"
                                multiple
                                hidden
                                onChange={e => tasksHandleFiles("attachments", e.target.files)}
                            />

                        </label>

                    )}

                </div>


                {/* STATUS */}

                <div className="tasks-form-group">

                    <label>Status</label>

                    <select
                        value={tasksFormData.status}
                        onChange={e => tasksUpdateField("status", e.target.value)}
                        disabled={tasksIsView}
                    >
                        <option value="">Choose Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Complete">Complete</option>
                    </select>

                </div>


                {/* BRANCHES */}

                <div className="tasks-form-group">

                    <label>Branches <span className="tasks-required">*</span></label>

                    <select
                        value=""
                        onChange={e => tasksHandleBranch(e.target.value)}
                        disabled={tasksIsView}
                        required={!tasksFormData.branches.length}
                    >
                        <option value="">
                            {tasksFormData.branches.length
                                ? "Add More Branches"
                                : "Select Branches"}
                        </option>

                        {tasksBranches
                            .filter(branch => !tasksFormData.branches.includes(branch))
                            .map(branch => (
                                <option key={branch} value={branch}>
                                    {branch}
                                </option>
                            ))}

                    </select>

                </div>

            </div>


            {/* SELECTED BRANCHES */}

            {tasksFormData.branches.length > 0 && (

                <div className="tasks-added-section tasks-branch-section">

                    <h4>Selected Branches</h4>

                    <div className="tasks-selected-list">

                        {tasksFormData.branches.map(branch => (

                            <div className="tasks-selected-item" key={branch}>

                                <span>{branch}</span>

                                {!tasksIsView && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTasksFormData(prev => ({
                                                ...prev,
                                                branches: prev.branches.filter(item => item !== branch),
                                                audience: "",
                                                batches: [],
                                                courses: [],
                                                interns: []
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


            {/* DIVIDER */}

            <div className="tasks-section-divider"></div>


            {/* AUDIENCE DETAILS */}

            <h3 className="tasks-section-heading tasks-audience-heading">
                Task Details
            </h3>

            <div className="tasks-audience-grid">

                <div className="tasks-form-group">

                    <label>
                        Audience

                        {!tasksFormData.branches.length && (
                            <span className="tasks-select-warning">
                                (Select branches first)
                            </span>
                        )}

                    </label>

                    <select
                        value={tasksFormData.audience}
                        onChange={e => tasksHandleAudience(e.target.value)}
                        disabled={tasksIsView || !tasksFormData.branches.length}
                    >

                        <option value="">
                            {tasksFormData.branches.length
                                ? "Choose Audience"
                                : "Choose branches first"}
                        </option>

                        {tasksAudienceOptions.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}

                    </select>

                </div>


                {/* BATCH SELECTION */}

                {tasksFormData.audience === "Batches" && (

                    <div className="tasks-form-group">

                        <label>Select Batches</label>

                        <select
                            value=""
                            disabled={tasksIsView}
                            onChange={e => tasksAddItem("batches", e.target.value)}
                        >
                            <option value="">Select Batch</option>

                            {tasksBatches
                                .filter(item => !tasksFormData.batches.includes(item))
                                .map(item => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}

                        </select>

                    </div>

                )}


                {/* COURSE SELECTION */}

                {tasksFormData.audience === "Course" && (

                    <div className="tasks-form-group">

                        <label>Select Courses</label>

                        <select
                            value=""
                            disabled={tasksIsView}
                            onChange={e => tasksAddItem("courses", e.target.value)}
                        >
                            <option value="">Select Course</option>

                            {tasksCourses
                                .filter(item => !tasksFormData.courses.includes(item))
                                .map(item => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}

                        </select>

                    </div>

                )}


                {/* INDIVIDUAL INTERN */}

                {tasksFormData.audience === "Individual Interns" && (

                    <div className="tasks-form-group">

                        <label>Select Interns</label>

                        <div className="tasks-intern-search">

                            <input
                                type="text"
                                placeholder="Search Intern"
                                value={tasksInternSearch}
                                disabled={tasksIsView}
                                onChange={e => setTasksInternSearch(e.target.value)}
                            />

                            <MdSearch />

                        </div>

                        {!tasksIsView && tasksInternSearch && (

                            <div className="tasks-intern-results">

                                {tasksFilteredInterns.map(intern => (

                                    <button
                                        type="button"
                                        key={intern}
                                        onClick={() => {
                                            tasksAddItem("interns", intern);
                                            setTasksInternSearch("");
                                        }}
                                    >
                                        {intern}
                                    </button>

                                ))}

                                {tasksFilteredInterns.length === 0 && (
                                    <p>No interns found</p>
                                )}

                            </div>

                        )}

                    </div>

                )}

            </div>


            {/* SELECTED AUDIENCE */}

            {tasksFormData.audience === "Batches" &&
                tasksRenderSelectedItems("batches", "Added Batches")}

            {tasksFormData.audience === "Course" &&
                tasksRenderSelectedItems("courses", "Added Courses")}

            {tasksFormData.audience === "Individual Interns" &&
                tasksRenderSelectedItems("interns", "Added Interns")}


            {/* INTERN ANSWER */}

            {(tasksMode === "view" || tasksMode === "edit") && (

                <>

                    <div className="tasks-section-divider"></div>

                    <h3 className="tasks-section-heading">
                        Interns Answer
                    </h3>

                    <div className="tasks-form-grid">

                        <div className="tasks-form-group">

                            <label>Achieved Marks</label>

                            <input
                                type="number"
                                min="0"
                                value={tasksFormData.achievedMarks}
                                placeholder="Enter Achieved Marks"
                                onChange={e => tasksUpdateField("achievedMarks", e.target.value)}
                                disabled={tasksIsView}
                            />

                        </div>

                        <div className="tasks-form-group tasks-full-width">

                            <label>Answer</label>

                            <textarea
                                rows="3"
                                value={tasksFormData.answer}
                                placeholder="Intern Answer"
                                onChange={e => tasksUpdateField("answer", e.target.value)}
                                disabled={tasksIsView}
                            />

                        </div>

                        <div className="tasks-form-group">

                            <label>Uploads</label>

                            {tasksIsView ? (

                                <div className="tasks-readonly-file">
                                    {tasksFormData.uploads.join(", ") || "No uploads"}
                                </div>

                            ) : (

                                <label className="tasks-upload-box">

                                    <span>
                                        {tasksFormData.uploads.join(", ") || "Upload Files"}
                                    </span>

                                    <MdUploadFile />

                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        onChange={e => tasksHandleFiles("uploads", e.target.files)}
                                    />

                                </label>

                            )}

                        </div>

                    </div>

                </>

            )}


            {/* FORM BUTTONS */}

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
                        >
                            Create Task
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
                        >
                            Save
                        </button>

                    </>

                )}

            </div>

        </form>

    );
};


// =====================================================
// 5. MAIN TASK COMPONENT
// =====================================================

const Tasks = () => {

    const [tasksList, setTasksList] = useState(tasksInitialData);

    const [tasksMode, setTasksMode] = useState("list");

    const [tasksSelectedId, setTasksSelectedId] = useState(null);

    const [tasksFormData, setTasksFormData] = useState({
        ...tasksEmptyForm
    });

    // List filters

    const [tasksSearch, setTasksSearch] = useState("");

    const [tasksTypeFilter, setTasksTypeFilter] = useState("all");

    const [tasksStatusFilter, setTasksStatusFilter] = useState("all");

    const [tasksAudienceFilter, setTasksAudienceFilter] = useState("all");

    const [tasksBranchFilter, setTasksBranchFilter] = useState("all");

    const tasksSelected = tasksList.find(
        task => task.id === tasksSelectedId
    );


    // =================================================
    // OPEN NEW TASK
    // =================================================

    const tasksHandleNew = () => {

        setTasksFormData({
            ...tasksEmptyForm
        });

        setTasksSelectedId(null);

        setTasksMode("create");
    };


    // =================================================
    // VIEW TASK
    // =================================================

    const tasksHandleView = (task) => {

        setTasksSelectedId(task.id);

        setTasksFormData({
            ...task,
            branches: [...task.branches],
            batches: [...task.batches],
            courses: [...task.courses],
            interns: [...task.interns],
            attachments: [...task.attachments],
            uploads: [...task.uploads]
        });

        setTasksMode("view");
    };


    // =================================================
    // EDIT TASK
    // =================================================

    const tasksHandleEdit = (task) => {

        tasksHandleView(task);

        setTasksMode("edit");
    };


    // =================================================
    // CREATE / UPDATE TASK
    // =================================================

    const tasksHandleSubmit = (e) => {

        e.preventDefault();

        if (
            tasksFormData.startDate &&
            tasksFormData.dueDate &&
            tasksFormData.dueDate < tasksFormData.startDate
        ) {
            alert("Due Date cannot be earlier than Start Date.");
            return;
        }

        if (
            tasksFormData.totalMarks !== "" &&
            tasksFormData.achievedMarks !== "" &&
            Number(tasksFormData.achievedMarks) > Number(tasksFormData.totalMarks)
        ) {
            alert("Achieved Marks cannot exceed Total Marks.");
            return;
        }

        if (tasksFormData.branches.length === 0) {
            alert("Please select at least one branch.");
            return;
        }

        if (!tasksFormData.audience) {
            alert("Please select an audience.");
            return;
        }

        if (
            tasksFormData.audience === "Batches" &&
            tasksFormData.batches.length === 0
        ) {
            alert("Please select at least one batch.");
            return;
        }

        if (
            tasksFormData.audience === "Course" &&
            tasksFormData.courses.length === 0
        ) {
            alert("Please select at least one course.");
            return;
        }

        if (
            tasksFormData.audience === "Individual Interns" &&
            tasksFormData.interns.length === 0
        ) {
            alert("Please select at least one intern.");
            return;
        }

        const tasksData = {
            ...tasksFormData
        };

        if (tasksMode === "create") {

            const tasksNewItem = {
                ...tasksData,
                id: Date.now()
            };

            setTasksList(prev => [
                ...prev,
                tasksNewItem
            ]);

        } else {

            setTasksList(prev =>
                prev.map(task =>
                    task.id === tasksSelectedId
                        ? { ...task, ...tasksData }
                        : task
                )
            );

        }

        setTasksMode("list");

        setTasksSelectedId(null);

        setTasksFormData({
            ...tasksEmptyForm
        });
    };


    // =================================================
    // DELETE TASK
    // =================================================

    const tasksHandleDelete = (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        setTasksList(prev =>
            prev.filter(task => task.id !== id)
        );

        setTasksMode("list");

        setTasksSelectedId(null);
    };


    // =================================================
    // CANCEL / BACK
    // =================================================

    const tasksHandleCancel = () => {

        if (tasksMode === "edit") {

            const originalTask = tasksList.find(
                task => task.id === tasksSelectedId
            );

            if (originalTask) {

                setTasksFormData({
                    ...originalTask,
                    branches: [...originalTask.branches],
                    batches: [...originalTask.batches],
                    courses: [...originalTask.courses],
                    interns: [...originalTask.interns],
                    attachments: [...originalTask.attachments],
                    uploads: [...originalTask.uploads]
                });

                setTasksMode("view");

                return;
            }
        }

        setTasksMode("list");

        setTasksSelectedId(null);

        setTasksFormData({
            ...tasksEmptyForm
        });
    };


    // =================================================
    // FILTER TASKS
    // =================================================

    const tasksFilteredList = useMemo(() => {

        return tasksList.filter(task => {

            const searchMatch = [
                task.title,
                task.mentor,
                task.module,
                task.type
            ].join(" ").toLowerCase()
                .includes(tasksSearch.toLowerCase());

            const typeMatch =
                tasksTypeFilter === "all" ||
                task.type === tasksTypeFilter;

            const statusMatch =
                tasksStatusFilter === "all" ||
                task.status.toLowerCase() === tasksStatusFilter;

            const audienceMatch =
                tasksAudienceFilter === "all" ||
                task.audience.toLowerCase() === tasksAudienceFilter.toLowerCase();

            const branchMatch =
                tasksBranchFilter === "all" ||
                task.branches.includes(tasksBranchFilter);

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


    // =================================================
    // EXPORT CSV
    // =================================================

    const tasksHandleExport = () => {

        if (tasksFilteredList.length === 0) {
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

        const rows = tasksFilteredList.map(task => [

            task.title,
            task.type,
            task.module,
            task.mentor,
            task.startDate,
            task.dueDate,
            task.totalMarks,
            task.status,
            task.branches.join("; "),
            task.audience,

            [
                ...task.batches,
                ...task.courses,
                ...task.interns
            ].join("; ")

        ]);

        const csv = [
            headers,
            ...rows
        ].map(row =>
            row.map(value =>
                `"${String(value || "").replace(/"/g, '""')}"`
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


    // =================================================
    // RESET FILTERS
    // =================================================

    const tasksResetFilters = () => {

        setTasksSearch("");
        setTasksTypeFilter("all");
        setTasksStatusFilter("all");
        setTasksAudienceFilter("all");
        setTasksBranchFilter("all");
    };


    // =================================================
    // MAIN JSX
    // =================================================

    return (

        <div className="tasks-page">

            {/* HEADER */}

            

            {/* TOP NAVIGATION */}

            <div className="tasks-top-navigation">

                <div className="tasks-tabs">

                    <button
                        type="button"
                        className={tasksMode === "list" ? "tasks-tab-active" : ""}
                        onClick={() => {
                            setTasksMode("list");
                            setTasksSelectedId(null);
                        }}
                    >
                        Tasks List
                    </button>

                    <button
                        type="button"
                        className={tasksMode === "create" ? "tasks-tab-active" : ""}
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
                                onChange={e => setTasksSearch(e.target.value)}
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
                            onChange={e => setTasksTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="Daily Task">Daily Task</option>
                            <option value="Weekly Task">Weekly Task</option>
                            <option value="Assignment">Assignment</option>
                            <option value="Project">Project</option>
                        </select>


                        <select
                            value={tasksStatusFilter}
                            onChange={e => setTasksStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                            <option value="complete">Complete</option>
                        </select>


                        <select
                            value={tasksAudienceFilter}
                            onChange={e => setTasksAudienceFilter(e.target.value)}
                        >
                            <option value="all">All Audience</option>
                            {tasksAudienceOptions.map(item => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>


                        <select
                            value={tasksBranchFilter}
                            onChange={e => setTasksBranchFilter(e.target.value)}
                        >
                            <option value="all">All Branches</option>
                            {tasksBranches.map(item => (
                                <option key={item} value={item}>
                                    {item}
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

                                        <tr key={task.id}>

                                            <td>{index + 1}</td>

                                            <td className="tasks-title-cell">
                                                {task.title}
                                            </td>

                                            <td>{task.type}</td>

                                            <td>{task.mentor}</td>

                                            <td>{task.startDate || "-"}</td>

                                            <td>{task.dueDate || "-"}</td>

                                            <td>
                                                <span className={`tasks-status tasks-status-${task.status.toLowerCase()}`}>
                                                    {task.status}
                                                </span>
                                            </td>

                                            <td>{task.audience || "-"}</td>

                                            <td>{task.branches.join(", ") || "-"}</td>

                                            <td>

                                                <div className="tasks-action-buttons">

                                                    <button
                                                        type="button"
                                                        title="View"
                                                        onClick={() => tasksHandleView(task)}
                                                    >
                                                        <MdVisibility />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Edit"
                                                        onClick={() => tasksHandleEdit(task)}
                                                    >
                                                        <MdEdit />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete"
                                                        className="tasks-delete-icon"
                                                        onClick={() => tasksHandleDelete(task.id)}
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
                        tasksOnDelete={() => tasksHandleDelete(tasksSelected.id)}
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
                    />

                </div>

            )}

        </div>

    );

};

export default Tasks;
