import { NavLink, useNavigate } from "react-router-dom";

import {
    FiCalendar,
    FiFileText,
    FiEdit,
    FiBook,
    FiSend,
    FiBell,
    FiLogOut
} from "react-icons/fi";

import "./internnavbar.css";

export const Internnavbar = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const menuItems = [
        {
            name: "My Attendance",
            path: "/internattendance",
            icon: <FiCalendar />
        },
        {
            name: "Weekly Schedule",
            path: "/internweekly",
            icon: <FiCalendar />
        },
        {
            name: "Weekly Card",
            path: "/internweeklycard",
            icon: <FiFileText />
        },
        {
            name: "Monthly Card",
            path: "/internmonthlycard",
            icon: <FiCalendar />
        },
        {
            name: "Task Submission",
            path: "/interntask",
            icon: <FiEdit />
        },
        {
            name: "Material List",
            path: "/internmaterial",
            icon: <FiBook />
        },
        {
            name: "Leave Request",
            path: "/internleave",
            icon: <FiSend />
        },
        {
            name: "Notifications",
            path: "/internnotification",
            icon: <FiBell />
        }
    ];

    return (
        <div className="internnavbar">

            {/* LOGO SECTION */}
            <div className="internnavbar-logo">
                <h2>
                    Softroni<span>ix</span>
                </h2>
            </div>


            {/* NAVIGATION MENU */}
            <div className="internnavbar-menu">

                {menuItems.map((item, index) => (

                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `internnavbar-link ${
                                isActive ? "internnavbar-active" : ""
                            }`
                        }
                    >

                        <span className="internnavbar-icon">
                            {item.icon}
                        </span>

                        <span className="internnavbar-text">
                            {item.name}
                        </span>

                    </NavLink>

                ))}

            </div>


            {/* LOGOUT SECTION */}
            <div className="internnavbar-logout-section">

                <button
                    className="internnavbar-logout"
                    onClick={handleLogout}
                >

                    <FiLogOut className="internnavbar-icon" />

                    <span>Log Out</span>

                </button>

            </div>

        </div>
    );
};