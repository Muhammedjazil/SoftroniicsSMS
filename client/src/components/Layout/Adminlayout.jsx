import React from "react";
import { useLocation } from "react-router-dom";
import AdminNavbar from "../admin/Adminnavbar";
import PageHeader from "../admin/PageHeader";
import "./Adminlayout.css";

const ROUTE_HEADERS = {
  "/dashboard": { title: "Dashboard", parent: "Dashboard", current: "Overview" },
  "/rolemanagement": { title: "Role Management", parent: "Administration", current: "Roles" },
  "/staffmanagement": { title: "Staff Management", parent: "Administration", current: "Staff List" },
  "/internmanagement": { title: "Intern Management", parent: "Administration", current: "Interns" },
  "/categories": { title: "Categories", parent: "Category Management", current: "Categories" },
  "/course": { title: "Course", parent: "Category Management", current: "Courses" },
  "/modulemanagement": { title: "Modules Management", parent: "Syllabus Management", current: "Modules" },
  "/topicsmanagement": { title: "Topics Management", parent: "Syllabus Management", current: "Topics" },
  "/taskevaluation": { title: "Task Evaluation", parent: "Task & Materials", current: "Evaluation" },
  "/taskmaterial": { title: "Materials", parent: "Task & Materials", current: "Materials" },
  "/tasks": { title: "Tasks", parent: "Task & Materials", current: "Tasks" },
  "/batchmanagement": { title: "Batches", parent: "Schedule", current: "Batches" },
  "/mentorbatches": { title: "Mentor Batches", parent: "Schedule", current: "Mentor Batches" },
  "/timingsmanagement": { title: "Timings Management", parent: "Schedule", current: "Timings" },
  "/weeklyschedule": { title: "Weekly Schedule", parent: "Schedule", current: "Weekly Schedule" },
  "/attendancestudent": { title: "Student Attendance", parent: "Attendance", current: "Attendance" },
  "/leaverequest": { title: "Leave Request", parent: "Attendance", current: "Leave Requests" },
  "/branch": { title: "Branch", parent: "Settings", current: "Branches" },
  "/notification": { title: "Notification", parent: "Settings", current: "Notifications" },
};

const getHeaderInfo = (pathname) => {
  if (ROUTE_HEADERS[pathname]) return ROUTE_HEADERS[pathname];

  // Handle nested routes like /course/:id or /categories/edit/:id
  const matchedKey = Object.keys(ROUTE_HEADERS).find((route) =>
    pathname.startsWith(`${route}/`)
  );

  if (matchedKey) {
    return ROUTE_HEADERS[matchedKey];
  }

  return { title: "Admin Portal", parent: "Home", current: "" };
};

const Adminlayout = ({ children }) => {
  const { pathname } = useLocation();
  const headerInfo = getHeaderInfo(pathname);

  return (
    <div className="adminlayout">
      <AdminNavbar />

      <div className="adminmaincontent">
        <PageHeader
          title={headerInfo.title}
          parent={headerInfo.parent}
          current={headerInfo.current}
        />

        {children}
      </div>
    </div>
  );
};

export default Adminlayout;