
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
    FiGrid,
    FiUsers,
    FiUser,
    FiShield,
    FiBook,
    FiFileText,
    FiEdit,
    FiCalendar,
    FiClock,
    FiGitBranch,
    FiBell,
    FiCheckSquare,
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
                    path: "/module"
                },
                {
                    title: "Topic",
                    path: "/topic"
                }
            ]
        },

        {
            title: "Task & Materials",
            icon: <FiEdit />,
            children: [
                {
                    title: "Syllabus",
                    path: "/syllebus"
                },
                {
                    title: "Material",
                    path: "/meterial"
                }
            ]
        },

        {
            title: "Schedule",
            icon: <FiCalendar />,
            children: [
                {
                    title: "Batches",
                    path: "/batches"
                },
                {
                    title: "Mentor Batches",
                    path: "/metorbatches"
                },
                {
                    title: "Timing",
                    path: "/timing"
                },
                {
                    title: "Weekly Schedule",
                    path: "/weeklyshedule"
                }
            ]
        },

        {
            title: "Attendance",
            icon: <FiCheckSquare />,
            children: [
                {
                    title: "Student Attendance",
                    path: "/studentattendence"
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
    // MENU TOGGLE
    // =====================================

    const handleMenu = (title) => {

        setOpenMenu((prev) =>
            prev === title ? "" : title
        );

    };


    // =====================================
    // ACTIVE MENU CHECK
    // =====================================

    const isChildActive = (children) => {

        return children?.some(
            (item) => location.pathname === item.path
        );

    };


    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {

        localStorage.removeItem("token");

        navigate("/login");

    };


    return (

        <>

            {/* MOBILE MENU BUTTON */}

            <button
                className="adminmobilemenu"
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                {mobileOpen ? <FiX /> : <FiMenu />}
            </button>


            {/* SIDEBAR */}

            <div className={`adminnavbar ${mobileOpen ? "adminnavopen" : ""}`}>

                {/* LOGO */}

                <div className="adminnavlogo">

                    <h2>
                        Softroni<span>ix</span>
                    </h2>

                </div>


                {/* MENU ITEMS */}

                <div className="adminnavitems">

                    {menuItems.map((item, index) => (

                        <div
                            className="adminnavgroup"
                            key={index}
                        >

                            {/* MAIN MENU */}

                            {item.children ? (

                                <>

                                    <div
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

                                            {openMenu === item.title
                                                ? <FiChevronUp />
                                                : <FiChevronDown />
                                            }

                                        </span>

                                    </div>


                                    {/* SUB MENU */}

                                    {openMenu === item.title && (

                                        <div className="adminnavsubmenu">

                                            {item.children.map((child, childIndex) => (

                                                <NavLink
                                                    key={childIndex}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        isActive
                                                            ? "adminnavsubitem adminnavsubactive"
                                                            : "adminnavsubitem"
                                                    }

                                                    onClick={() => setMobileOpen(false)}
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

                                    onClick={() => setMobileOpen(false)}
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

                    <button onClick={handleLogout}>

                        <FiLogOut />

                        <span>Log Out</span>

                    </button>

                </div>

            </div>


            {/* MOBILE OVERLAY */}

            {mobileOpen && (

                <div
                    className="adminnavoverlay"
                    onClick={() => setMobileOpen(false)}
                />

            )}

        </>

    );

};

export default AdminNavbar;
