import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { checkUserPermission } from "./hooks/usePermission";

// AUTH / REGISTER
import Login from "./pages/Register/Login";

// LAYOUTS
import Adminlayout from "./components/Layout/Adminlayout";
import { Internlayout } from "./components/Layout/Internlayout";

// ADMIN PAGES
import { Rolemanagement } from "./pages/admin/administration/Rolemanagement";
import { Staffmanagement } from "./pages/admin/administration/Staffmanagement";
import { Internmanagement } from "./pages/admin/administration/Internmanagement";

import BatchManagement from "./pages/admin/schedule/BatchManagement";
import MentorBatches from "./pages/admin/schedule/MentorBatches";
import TimingsManagement from "./pages/admin/schedule/TimingsManagement";
import WeeklySchedule from "./pages/admin/schedule/WeeklySchedule";

import { Branch } from "./pages/admin/settings/Settingsbranch";
import { Notification } from "./pages/admin/settings/Setingsnotification";

import Taskevaluation from "./pages/admin/Taskmanagement/Taskevaluation";
import Taskmaterial from "./pages/admin/Taskmanagement/Taskmaterial";
import Tasks from "./pages/admin/Taskmanagement/Tasks";

import Attendancestudent from "./pages/admin/Attendance/Attendancestudent";
import Leaverequest from "./pages/admin/Attendance/Leaverequest";

import ModuleManagement from "./pages/admin/syllabus/ModuleManagement";
import TopicsManagement from "./pages/admin/syllabus/TopicsManagement";

import Dashboard from "./pages/admin/Dashboard/Dashboard";
import Categories from "./pages/admin/CourseManagement/Categories";
import Course from "./pages/admin/CourseManagement/Course";


// INTERN PAGES
import { Internnotification } from "./pages/intern/Internnotification";
import { Intrentask } from "./pages/intern/Interntask";
import Internattendance from "./pages/intern/Internattendance";
import Internmonthlycard from "./pages/intern/Internmonthlycard";
import InternWeeklySchedule from "./pages/intern/InternWeeklySchedule";
import WeeklyCard from "./pages/intern/WeeklyCard";

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

const ProtectedRoute = ({ children, allowedTypes, module, action }) => {
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

  // Enforce module/action permission for staff users
  if (module && action && !checkUserPermission(user, module, action)) {
    return <Navigate to="/dashboard" replace />;
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC LOGIN ROUTES */}
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

        {/* DASHBOARD */}
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

        {/* COURSE & CATEGORY MANAGEMENT */}
        <Route
          path="/course"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="courseManagement"
              action="viewCourse"
            >
              <Adminlayout>
                <Course />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
       
        
        {/* CATEGORY MANAGEMENT */}
        <Route
          path="/categories"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="categoryManagement"
              action="viewCategory"
            >
              <Adminlayout>
                <Categories />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
       
        

        {/* ADMINISTRATION */}
        <Route
          path="/rolemanagement"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="roleManagement"
              action="viewRole"
            >
              <Adminlayout>
                <Rolemanagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staffmanagement"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="staffManagement"
              action="viewStaff"
            >
              <Adminlayout>
                <Staffmanagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/internmanagement"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="studentManagement"
              action="viewStudent"
            >
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
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="batchManagement"
              action="viewBatch"
            >
              <Adminlayout>
                <BatchManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentorbatches"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="mentorManagement"
              action="viewMentor"
            >
              <Adminlayout>
                <MentorBatches />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/timingsmanagement"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="scheduleTiming"
              action="viewTiming"
            >
              <Adminlayout>
                <TimingsManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/weeklyschedule"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="weeklySchedule"
              action="viewSchedule"
            >
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
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="branchManagement"
              action="viewBranch"
            >
              <Adminlayout>
                <Branch />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="notificationManagement"
              action="viewNotification"
            >
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
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="taskManagement"
              action="viewTask"
            >
              <Adminlayout>
                <Taskevaluation />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/taskmaterial"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="materialManagement"
              action="viewMaterial"
            >
              <Adminlayout>
                <Taskmaterial />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="taskManagement"
              action="viewTask"
            >
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
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="attendanceManagement"
              action="viewAttendance"
            >
              <Adminlayout>
                <Attendancestudent />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaverequest"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="leaveManagement"
              action="viewLeave"
            >
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
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="moduleManagement"
              action="viewModule"
            >
              <Adminlayout>
                <ModuleManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topicsmanagement"
          element={
            <ProtectedRoute
              allowedTypes={["admin", "staff"]}
              module="topicManagement"
              action="viewTopic"
            >
              <Adminlayout>
                <TopicsManagement />
              </Adminlayout>
            </ProtectedRoute>
          }
        />

        {/* INTERN ROUTES */}
        <Route
          element={
            <ProtectedRoute allowedTypes={["intern"]}>
              <Internlayout />
            </ProtectedRoute>
          }
        >
          <Route path="/internnotification" element={<Internnotification />} />
          <Route path="/interntask" element={<Intrentask />} />
          <Route path="/internattendance" element={<Internattendance />} />
          <Route path="/internweekly" element={<InternWeeklySchedule />} />
          <Route path="/internweeklycard" element={<WeeklyCard />} />
          <Route path="/internmonthlycard" element={<Internmonthlycard />} />
          {/* Aliases for /student/ paths */}
          <Route path="/student/weekly_schedule" element={<InternWeeklySchedule />} />
          <Route path="/student/weekly_card" element={<WeeklyCard />} />
          <Route path="/student/attendance" element={<Internattendance />} />
          <Route path="/student/task" element={<Intrentask />} />
          <Route path="/student/notification" element={<Internnotification />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
