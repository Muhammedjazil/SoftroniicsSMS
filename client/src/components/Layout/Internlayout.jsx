import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Internnavbar } from "../Intern/Internnavbar";
import InternHeader from "../Intern/InternHeader";
import axios from "../../Axios";
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
    "/student/weekly_schedule": {
        title: "My Weekly Schedule",
        parentPath: "My Weekly Schedule",
        currentPath: "Weekly Schedule"
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
    const navigate = useNavigate();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const syncInternProfile = async () => {
            let redirected = false;
            try {
                const token = localStorage.getItem("SMStoken");
                if (!token) {
                    redirected = true;
                    navigate("/login", { replace: true });
                    return;
                }

                const response = await axios.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const freshUser = response?.data?.user;
                if (freshUser && freshUser._id) {
                    localStorage.setItem("user", JSON.stringify(freshUser));
                }
            } catch (error) {
                console.error("Failed to sync intern profile:", error);
                const status = error?.response?.status;
                if (status === 401 || status === 403 || status === 404) {
                    localStorage.removeItem("SMStoken");
                    localStorage.removeItem("user");
                    redirected = true;
                    navigate("/login", { replace: true });
                }
            } finally {
                if (isMounted && !redirected) {
                    setIsSyncing(false);
                }
            }
        };

        syncInternProfile();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

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
                {!isSyncing && (children || <Outlet />)}
            </div>
        </div>
    );
};