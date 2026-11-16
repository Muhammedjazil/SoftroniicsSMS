
import React from "react";
import AdminNavbar from "../admin/Adminnavbar";
import "./Adminlayout.css";

const Adminlayout = ({ children }) => {
    return (
        <div className="adminlayout">

            <AdminNavbar />

            <div className="adminmaincontent">
                {children}
            </div>

        </div>
    );
};

export default Adminlayout;
