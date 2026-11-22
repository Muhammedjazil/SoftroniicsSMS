import React from "react";
import { FiUser, FiChevronRight } from "react-icons/fi";
import "./PageHeader.css";

const getLoggedInUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const PageHeader = ({ title, parent, current }) => {
  const user = getLoggedInUser();

  const displayName = user?.name || user?.fullName || "Admin";
  const displayRole =
    typeof user?.role === "object"
      ? user.role?.role
      : user?.role || user?.userType || "Super Admin";

  return (
    <div className="admin-page-header">
      <div className="admin-page-header-left">
        <h2>{title}</h2>

        {(parent || current) && (
          <p>
            {parent && <span>{parent}</span>}
            {parent && current && <FiChevronRight />}
            {current && <span className="admin-page-current">{current}</span>}
          </p>
        )}
      </div>

      <div className="admin-page-profile">
        <div className="admin-page-profile-icon">
          <FiUser />
        </div>

        <div className="admin-page-profile-details">
          <h5>{displayName}</h5>
          <p>{displayRole}</p>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;