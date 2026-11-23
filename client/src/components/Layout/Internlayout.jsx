import { Outlet, useLocation } from "react-router-dom";
import { Internnavbar } from "../Intern/Internnavbar";
import InternHeader from "../Intern/InternHeader";
import "./Internlayout.css";

const internRouteMeta = {
    "/internattendance": {
        title: "Student Attendance",
        parentPath: "Student Attendance",
        currentPath: "Attendance Details"
    },
    "/internweekly": {
        title: "Weekly Schedule",
        parentPath: "Weekly Schedule",
        currentPath: "Batch Timetable"
    },
    "/internweeklycard": {
        title: "Weekly Evaluation Card",
        parentPath: "Weekly Card",
        currentPath: "Performance Details"
    },
    "/internmonthlycard": {
        title: "Monthly Evaluation Card",
        parentPath: "Monthly Card",
        currentPath: "Monthly Summary"
    },
    "/interntask": {
        title: "Task Submission",
        parentPath: "Tasks",
        currentPath: "Submit & Track"
    },
    "/internmaterial": {
        title: "Material List",
        parentPath: "Materials",
        currentPath: "Course Resources"
    },
    "/internleave": {
        title: "Leave Request",
        parentPath: "Leave",
        currentPath: "Apply & History"
    },
    "/internnotification": {
        title: "Notifications",
        parentPath: "Notifications",
        currentPath: "Recent Alerts"
    }
};

export const Internlayout = ({ children }) => {
    const { pathname } = useLocation();
    const meta = internRouteMeta[pathname] || {
        title: "Intern Portal",
        parentPath: "Dashboard",
        currentPath: "Overview"
    };

    return (
        <div className="internlayout">
            {/* SIDEBAR */}
            <div className="internlayout-sidebar">
                <Internnavbar />
            </div>

            {/* PAGE CONTENT */}
            <div className="internlayout-content">
                <InternHeader
                    title={meta.title}
                    parentPath={meta.parentPath}
                    currentPath={meta.currentPath}
                />
                {children || <Outlet />}
            </div>
        </div>
    );
};