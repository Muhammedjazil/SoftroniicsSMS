import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// =====================================
// AUTH / REGISTER
// =====================================

import Login from "./pages/Register/Login";

// =====================================
// ADMIN LAYOUT
// =====================================

import Adminlayout from "./components/Layout/Adminlayout";

// =====================================
// INTERN LAYOUT
// =====================================

import { Internlayout } from "./components/Layout/Internlayout";

// =====================================
// ADMIN PAGES - ADMINISTRATION
// =====================================

import { Rolemanagement } from "./pages/admin/administration/Rolemanagement";
import { Staffmanagement } from "./pages/admin/administration/Staffmanagement";
import { Internmanagement } from "./pages/admin/administration/Internmanagement";

// =====================================
// ADMIN PAGES - SCHEDULE
// =====================================

import BatchManagement from "./pages/admin/schedule/BatchManagement";
import MentorBatches from "./pages/admin/schedule/MentorBatches";
import TimingsManagement from "./pages/admin/schedule/TimingsManagement";
import WeeklySchedule from "./pages/admin/schedule/WeeklySchedule";

// =====================================
// ADMIN PAGES - SETTINGS
// =====================================

import { Branch } from "./pages/admin/settings/Settingsbranch";
import { Notification } from "./pages/admin/settings/Setingsnotification";

// =====================================
// ADMIN PAGES - TASK MANAGEMENT
// =====================================

import Taskevaluation from "./pages/admin/Taskmanagement/Taskevaluation";
import Taskmaterial from "./pages/admin/Taskmanagement/Taskmaterial";
import Tasks from "./pages/admin/Taskmanagement/Tasks";

// =====================================
// ADMIN PAGES - ATTENDANCE
// =====================================

import Attendancestudent from "./pages/admin/Attendance/Attendancestudent";
import Leaverequest from "./pages/admin/Attendance/Leaverequest";

// =====================================
// ADMIN PAGES - SYLLABUS
// =====================================

import ModuleManagement from "./pages/admin/syllabus/ModuleManagement";
import TopicsManagement from "./pages/admin/syllabus/TopicsManagement";

// =====================================
// INTERN PAGES
// =====================================

import { Internnotification } from "./pages/intern/Internnotification";
import { Intrentask } from "./pages/intern/interntask";

import Internattendance from "./pages/intern/Internattendance";
import Internmonthlycard from "./pages/intern/Internmonthlycard";
import InternWeeklySchedule from "./pages/intern/InternWeeklySchedule";
import WeeklyCard from "./pages/intern/WeeklyCard";
import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Categories from "./pages/admin/CourseManagement/Categories";
import Course from "./pages/admin/CourseManagement/Course";
import CategoryView from "./pages/admin/CourseManagement/CategoryView";

import ViewCourse from "./pages/admin/CourseManagement/ViewCourse";
import EditCourse from "./pages/admin/CourseManagement/EditCourse";
import CategoryEdit from "./pages/admin/CourseManagement/CategoryEdit";
// =====================================
// AUTH HELPERS & ROUTE GUARDS
// =====================================

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem("SMStoken");
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
};

const ProtectedRoute = ({ children, allowedTypes }) => {
  const { token, user } = getStoredAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.userType)) {
    return (
      <Navigate
        to={user.userType === "intern" ? "/internweekly" : "/dashboard"}
        replace
      />
    );
  }

  return children;
};

const PublicLoginRoute = ({ children }) => {
  const { token, user } = getStoredAuth();

  if (token && user) {
    return (
      <Navigate
        to={user.userType === "intern" ? "/internweekly" : "/dashboard"}
        replace
      />
    );
  }

  return children;
};

// =====================================
// APP COMPONENT
// =====================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================
                    PUBLIC LOGIN ROUTES
                ================================= */}

        <Route
          path="/"
          element={
            <PublicLoginRoute>
              <Login />
            </PublicLoginRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicLoginRoute>
              <Login />
            </PublicLoginRoute>
          }
        />

        {/* =================================
                    ADMIN & STAFF ROUTES
                ================================= */}

        <Route
          path="/courses/:id"
          element={
            <Adminlayout>
              <ViewCourse />
            </Adminlayout>
          }
        />

        <Route
          path="/courses/:id/edit"
          element={
            <Adminlayout>
              <EditCourse />
            </Adminlayout>
          }
        />
        <Route
          path="/course"
          element={
            <Adminlayout>
              <Course />
            </Adminlayout>
          }
        />

        <Route
          path="/categories"
          element={
            <Adminlayout>
              <Categories />
            </Adminlayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Dashboard />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        {/* COURSE MANAGEMENT */}
        <Route
          path="/categories/view/:id"
          element={
            <Adminlayout>
              <CategoryView />
            </Adminlayout>
          }
        />

        <Route
          path="/categories/edit/:id"
          element={
            <Adminlayout>
              <CategoryEdit />
            </Adminlayout>
          }
        />
        {/* ADMINISTRATION */}

        <Route
          path="/rolemanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Rolemanagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staffmanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Staffmanagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/internmanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Internmanagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* SCHEDULE */}

        <Route
          path="/batchmanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <BatchManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentorbatches"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <MentorBatches />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/timingsmanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <TimingsManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/weeklyschedule"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <WeeklySchedule />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}

        <Route
          path="/branch"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Branch />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notification"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Notification />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* TASK MANAGEMENT */}

        <Route
          path="/taskevaluation"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Taskevaluation />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/taskmaterial"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Taskmaterial />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Tasks />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* ATTENDANCE */}

        <Route
          path="/attendancestudent"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Attendancestudent />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leaverequest"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <Leaverequest />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* SYLLABUS */}

        <Route
          path="/modulemanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <ModuleManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/topicsmanagement"
          element={
            <ProtectedRoute allowedTypes={["admin", "staff"]}>
              <Adminlayout>
                <TopicsManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* =================================
                    INTERN ROUTES
                ================================= */}

        <Route
          path="/internnotification"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <Internnotification />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interntask"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <Intrentask />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/internattendance"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <Internattendance />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/internweekly"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <InternWeeklySchedule />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/internweeklycard"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <WeeklyCard />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/internmonthlycard"
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout>
                <Internmonthlycard />
              </Internlayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback for unknown URLs */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;