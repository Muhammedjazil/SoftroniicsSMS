import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
    FiGrid,
    FiUsers,
    FiBook,
    FiFileText,
    FiEdit,
    FiCalendar,
    FiCheckSquare,
    FiShield,
    FiLogOut,
    FiChevronDown,
    FiChevronUp,
    FiMenu,
    FiX
} from "react-icons/fi";

import usePermission from "../../hooks/usePermission";
import "./Adminnavbar.css";

// Defined outside component so reference stays stable across renders
const RAW_MENU_ITEMS = [
    {
        title: "Dashboard",
        icon: <FiGrid />,
        path: "/dashboard"
    },
    {
        title: "Administration",
        icon: <FiUsers />,
        children: [
            {
                title: "Role Management",
                path: "/rolemanagement",
                module: "roleManagement",
                action: "viewRole"
            },
            {
                title: "Staff Management",
                path: "/staffmanagement",
                module: "staffManagement",
                action: "viewStaff"
            },
            {
                title: "Intern Management",
                path: "/internmanagement",
                module: "studentManagement",
                action: "viewStudent"
            }
        ]
    },
    {
        title: "Category Management",
        icon: <FiBook />,
        children: [
            {
                title: "Categories",
                path: "/categories",
                module: "categoryManagement",
                action: "viewCategory"
            },
            {
                title: "Course",
                path: "/course",
                module: "courseManagement",
                action: "viewCourse"
            }
        ]
    },
    {
        title: "Syllabus Management",
        icon: <FiFileText />,
        children: [
            {
                title: "Module",
                path: "/modulemanagement",
                module: "moduleManagement",
                action: "viewModule"
            },
            {
                title: "Topic",
                path: "/topicsmanagement",
                module: "topicManagement",
                action: "viewTopic"
            }
        ]
    },
    {
        title: "Task & Materials",
        icon: <FiEdit />,
        children: [
            {
                title: "Task Evaluation",
                path: "/taskevaluation",
                module: "taskManagement",
                action: "viewTask"
            },
            {
                title: "Materials",
                path: "/taskmaterial",
                module: "materialManagement",
                action: "viewMaterial"
            },
            {
                title: "Tasks",
                path: "/tasks",
                module: "taskManagement",
                action: "viewTask"
            }
        ]
    },
    {
        title: "Schedule",
        icon: <FiCalendar />,
        children: [
            {
                title: "Batches",
                path: "/batchmanagement",
                module: "batchManagement",
                action: "viewBatch"
            },
            {
                title: "Mentor Batches",
                path: "/mentorbatches",
                module: "mentorManagement",
                action: "viewMentor"
            },
            {
                title: "Timing",
                path: "/timingsmanagement",
                module: "scheduleTiming",
                action: "viewTiming"
            },
            {
                title: "Weekly Schedule",
                path: "/weeklyschedule",
                module: "weeklySchedule",
                action: "viewSchedule"
            }
        ]
    },
    {
        title: "Attendance",
        icon: <FiCheckSquare />,
        children: [
            {
                title: "Student Attendance",
                path: "/attendancestudent",
                module: "attendanceManagement",
                action: "viewAttendance"
            },
            {
                title: "Leave Request",
                path: "/leaverequest",
                module: "leaveManagement",
                action: "viewLeave"
            }
        ]
    },
    {
        title: "Settings",
        icon: <FiShield />,
        children: [
            {
                title: "Branch",
                path: "/branch",
                module: "branchManagement",
                action: "viewBranch"
            },
            {
                title: "Notification",
                path: "/notification",
                module: "notificationManagement",
                action: "viewNotification"
            }
        ]
    }
];

export const AdminNavbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, can } = usePermission();

    const [openMenu, setOpenMenu] = useState("Administration");
    const [mobileOpen, setMobileOpen] = useState(false);

    // Filter menu items once per user session
    const menuItems = useMemo(() => {
        return RAW_MENU_ITEMS
            .map((item) => {
                if (item.children) {
                    const allowedChildren = item.children.filter((child) =>
                        can(child.module, child.action)
                    );
                    if (allowedChildren.length === 0) return null;
                    return { ...item, children: allowedChildren };
                }

                if (item.module && item.action) {
                    return can(item.module, item.action) ? item : null;
                }

                return item;
            })
            .filter(Boolean);
    }, [user?._id, user?.role, user?.userType]);

    // Sync active menu ONLY when route path changes
    useEffect(() => {
        const activeMenu = menuItems.find((item) =>
            item.children?.some(
                (child) =>
                    location.pathname === child.path ||
                    location.pathname.startsWith(`${child.path}/`)
            )
        );

        if (activeMenu) {
            setOpenMenu(activeMenu.title);
        }

        setMobileOpen(false);
    }, [location.pathname]);

    const handleMenu = (title) => {
        setOpenMenu((prev) => (prev === title ? "" : title));
    };

    const isChildActive = (children) => {
        return children?.some(
            (item) =>
                location.pathname === item.path ||
                location.pathname.startsWith(`${item.path}/`)
        );
    };

    const handleLogout = () => {
        localStorage.removeItem("SMStoken");
        localStorage.removeItem("user");
        setMobileOpen(false);
        navigate("/login", { replace: true });
    };

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    return (
        <>
            {/* MOBILE MENU BUTTON */}
            <button
                type="button"
                className="adminmobilemenu"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
                {mobileOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* MOBILE OVERLAY */}
            {mobileOpen && (
                <div
                    className="adminnavoverlay"
                    onClick={closeMobileMenu}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`adminnavbar ${
                    mobileOpen ? "adminnavopen" : ""
                }`}
            >
                {/* LOGO */}
                <div className="adminnavlogo">
                    <h2>
                        Softroni<span>ix</span>
                    </h2>
                </div>

                {/* MENU ITEMS */}
                <div className="adminnavitems">
                    {menuItems.map((item) => (
                        <div
                            className="adminnavgroup"
                            key={item.title}
                        >
                            {item.children ? (
                                <>
                                    <button
                                        type="button"
                                        className={`adminnavmain ${
                                            openMenu === item.title ||
                                            isChildActive(item.children)
                                                ? "adminnavmainactive"
                                                : ""
                                        }`}
                                        onClick={() => handleMenu(item.title)}
                                    >
                                        <span className="adminnavicon">
                                            {item.icon}
                                        </span>

                                        <span className="adminnavtitle">
                                            {item.title}
                                        </span>

                                        <span className="adminnavarrow">
                                            {openMenu === item.title ? (
                                                <FiChevronUp />
                                            ) : (
                                                <FiChevronDown />
                                            )}
                                        </span>
                                    </button>

                                    {openMenu === item.title && (
                                        <div className="adminnavsubmenu">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.path}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        isActive
                                                            ? "adminnavsubitem adminnavsubactive"
                                                            : "adminnavsubitem"
                                                    }
                                                    onClick={closeMobileMenu}
                                                >
                                                    {child.title}
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "adminnavmain adminnavmainactive"
                                            : "adminnavmain"
                                    }
                                    onClick={closeMobileMenu}
                                >
                                    <span className="adminnavicon">
                                        {item.icon}
                                    </span>

                                    <span className="adminnavtitle">
                                        {item.title}
                                    </span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </div>

                {/* LOGOUT */}
                <div className="adminnavlogout">
                    <button
                        type="button"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span>Log Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminNavbar;