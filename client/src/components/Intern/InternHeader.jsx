import React from "react";
import { LuUser } from "react-icons/lu";
import "./InternHeader.css";

const InternHeader = ({
    title = "Student Attendance",
    parentPath = "Student Attendance",
    currentPath = "Attendance Details",
    onParentClick,
    userName,
    userRole = "Intern"
}) => {
    // Read logged-in intern name from localStorage if userName prop isn't explicitly passed
    const storedUser = (() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    })();

    const displayName =
        userName || storedUser?.name || storedUser?.username || "ADEEB N";
    const displayRole = storedUser?.role || userRole;

    return (
        <header className="wk-card-header">
            <div className="wk-card-title-group">
                <h1 className="wk-card-heading">{title}</h1>
                <nav className="wk-card-breadcrumb" aria-label="Breadcrumb">
                    {onParentClick ? (
                        <button
                            type="button"
                            onClick={onParentClick}
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                font: "inherit",
                                color: "inherit",
                                cursor: "pointer",
                            }}
                        >
                            {parentPath}
                        </button>
                    ) : (
                        <span>{parentPath}</span>
                    )}
                    {currentPath && (
                        <>
                            <span className="wk-card-breadcrumb-sep">&gt;</span>
                            <span>{currentPath}</span>
                        </>
                    )}
                </nav>
            </div>

            <div className="wk-card-profile-card">
                <div className="wk-card-profile-avatar">
                    <LuUser />
                </div>
                <div className="wk-card-profile-info">
                    <span className="wk-card-username">{displayName}</span>
                    <span className="wk-card-role">{displayRole}</span>
                </div>
            </div>
        </header>
    );
};

export default InternHeader;