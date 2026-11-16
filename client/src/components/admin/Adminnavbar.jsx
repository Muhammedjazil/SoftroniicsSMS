
import { useEffect, useState } from "react";
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

import "./Adminnavbar.css";

export const AdminNavbar = () => {

    const location = useLocation();
    const navigate = useNavigate();

    const [openMenu, setOpenMenu] = useState("Administration");
    const [mobileOpen, setMobileOpen] = useState(false);

    // =====================================
    // MENU DATA
    // =====================================

    const menuItems = [
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
                    path: "/rolemanagement"
                },
                {
                    title: "Staff Management",
                    path: "/staffmanagement"
                },
                {
                    title: "Intern Management",
                    path: "/internmanagement"
                }
            ]
        },

        {
            title: "Category Management",
            icon: <FiBook />,
            children: [
                {
                    title: "Categories",
                    path: "/categories"
                },
                {
                    title: "Course",
                    path: "/course"
                }
            ]
        },

        {
            title: "Syllabus Management",
            icon: <FiFileText />,
            children: [
                {
                    title: "Module",
                    path: "/modulemanagement"
                },
                {
                    title: "Topic",
                    path: "/topicsmanagement"
                }
            ]
        },

        {
            title: "Task & Materials",
            icon: <FiEdit />,
            children: [
                {
                    title: "Task Evaluation",
                    path: "/taskevaluation"
                },
                {
                    title: "Materials",
                    path: "/taskmaterial"
                },
                {
                    title: "Tasks",
                    path: "/tasks"
                }
            ]
        },

        {
            title: "Schedule",
            icon: <FiCalendar />,
            children: [
                {
                    title: "Batches",
                    path: "/batchmanagement"
                },
                {
                    title: "Mentor Batches",
                    path: "/mentorbatches"
                },
                {
                    title: "Timing",
                    path: "/timingsmanagement"
                },
                {
                    title: "Weekly Schedule",
                    path: "/weeklyschedule"
                }
            ]
        },

        {
            title: "Attendance",
            icon: <FiCheckSquare />,
            children: [
                {
                    title: "Student Attendance",
                    path: "/attendancestudent"
                },
                {
                    title: "Leave Request",
                    path: "/leaverequest"
                }
            ]
        },

        {
            title: "Settings",
            icon: <FiShield />,
            children: [
                {
                    title: "Branch",
                    path: "/branch"
                },
                {
                    title: "Notification",
                    path: "/notification"
                }
            ]
        }
    ];

    // =====================================
    // OPEN ACTIVE MENU AUTOMATICALLY
    // =====================================

    useEffect(() => {

        const activeMenu = menuItems.find((item) =>
            item.children?.some(
                (child) => child.path === location.pathname
            )
        );

        if (activeMenu) {
            setOpenMenu(activeMenu.title);
        }

        setMobileOpen(false);

    }, [location.pathname]);

    // =====================================
    // MENU TOGGLE
    // =====================================

    const handleMenu = (title) => {

        setOpenMenu((prev) =>
            prev === title ? "" : title
        );

    };

    // =====================================
    // ACTIVE CHILD CHECK
    // =====================================

    const isChildActive = (children) => {

        return children?.some(
            (item) => item.path === location.pathname
        );

    };

    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        setMobileOpen(false);

        navigate("/login");

    };

    // =====================================
    // CLOSE MOBILE MENU
    // =====================================

    const closeMobileMenu = () => {
        setMobileOpen(false);
    };

    // =====================================
    // JSX
    // =====================================

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

                            {/* PARENT MENU */}

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
                                        onClick={() =>
                                            handleMenu(item.title)
                                        }
                                    >

                                        <span className="adminnavicon">
                                            {item.icon}
                                        </span>

                                        <span className="adminnavtitle">
                                            {item.title}
                                        </span>

                                        <span className="adminnavarrow">

                                            {openMenu === item.title
                                                ? <FiChevronUp />
                                                : <FiChevronDown />
                                            }

                                        </span>

                                    </button>


                                    {/* SUBMENU */}

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

                                /* NORMAL MENU LINK */

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
