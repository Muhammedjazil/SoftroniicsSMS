
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// =====================================
// APP COMPONENT
// =====================================

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =================================
                    ADMIN ROUTES
                ================================= */}

                <Route
                    path="/"
                    element={
                        <Adminlayout>
                            <Rolemanagement />
                        </Adminlayout>
                    }
                />

                {/* ADMINISTRATION */}

                <Route
                    path="/rolemanagement"
                    element={
                        <Adminlayout>
                            <Rolemanagement />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/staffmanagement"
                    element={
                        <Adminlayout>
                            <Staffmanagement />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/internmanagement"
                    element={
                        <Adminlayout>
                            <Internmanagement />
                        </Adminlayout>
                    }
                />

                {/* SCHEDULE */}

                <Route
                    path="/batchmanagement"
                    element={
                        <Adminlayout>
                            <BatchManagement />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/mentorbatches"
                    element={
                        <Adminlayout>
                            <MentorBatches />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/timingsmanagement"
                    element={
                        <Adminlayout>
                            <TimingsManagement />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/weeklyschedule"
                    element={
                        <Adminlayout>
                            <WeeklySchedule />
                        </Adminlayout>
                    }
                />

                {/* SETTINGS */}

                <Route
                    path="/branch"
                    element={
                        <Adminlayout>
                            <Branch />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/notification"
                    element={
                        <Adminlayout>
                            <Notification />
                        </Adminlayout>
                    }
                />

                {/* TASK MANAGEMENT */}

                <Route
                    path="/taskevaluation"
                    element={
                        <Adminlayout>
                            <Taskevaluation />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/taskmaterial"
                    element={
                        <Adminlayout>
                            <Taskmaterial />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/tasks"
                    element={
                        <Adminlayout>
                            <Tasks />
                        </Adminlayout>
                    }
                />

                {/* ATTENDANCE */}

                <Route
                    path="/attendancestudent"
                    element={
                        <Adminlayout>
                            <Attendancestudent />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/leaverequest"
                    element={
                        <Adminlayout>
                            <Leaverequest />
                        </Adminlayout>
                    }
                />

                {/* SYLLABUS */}

                <Route
                    path="/modulemanagement"
                    element={
                        <Adminlayout>
                            <ModuleManagement />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/topicsmanagement"
                    element={
                        <Adminlayout>
                            <TopicsManagement />
                        </Adminlayout>
                    }
                />

                {/* =================================
                    INTERN ROUTES
                ================================= */}

                <Route
                    path="/internnotification"
                    element={
                        <Internlayout>
                            <Internnotification />
                        </Internlayout>
                    }
                />

                <Route
                    path="/interntask"
                    element={
                        <Internlayout>
                            <Intrentask />
                        </Internlayout>
                    }
                />

                <Route
                    path="/internattendance"
                    element={
                        <Internlayout>
                            <Internattendance />
                        </Internlayout>
                    }
                />

                <Route
                    path="/internmonthlycard"
                    element={
                        <Internlayout>
                            <Internmonthlycard />
                        </Internlayout>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
