
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ADMIN LAYOUT
import Adminlayout from "./components/Layout/Adminlayout";

// INTERN LAYOUT
import { Internlayout } from "./components/Layout/Internlayout";

// ADMIN PAGES
import { Rolemanagement } from "./pages/admin/administration/Rolemanagement";
import { Staffmanagement } from "./pages/admin/administration/Staffmanagement";
import { Internmanagement } from "./pages/admin/administration/Internmanagement";

import { Branch } from "./pages/admin/settings/Settingsbranch";
import { Notification } from "./pages/admin/settings/Setingsnotification";

import Taskevaluation from "./pages/admin/Taskmanagement/Taskevaluation";
import Taskmaterial from "./pages/admin/Taskmanagement/Taskmaterial";
import Tasks from "./pages/admin/Taskmanagement/Tasks";

import Attendancestudent from "./pages/admin/Attendance/Attendancestudent";
import Leaverequest from "./pages/admin/Attendance/Leaverequest";

// INTERN PAGES
import { Internnotification } from "./pages/intern/Internnotification";
import { Intrentask } from "./pages/intern/interntask";

import Internattendance from "./pages/intern/Internattendance";
import Internmonthlycard from "./pages/intern/Internmonthlycard";


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

                <Route
                    path="/Taskevaluation"
                    element={
                        <Adminlayout>
                            <Taskevaluation />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/Taskmaterial"
                    element={
                        <Adminlayout>
                            <Taskmaterial />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/Tasks"
                    element={
                        <Adminlayout>
                            <Tasks />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/Attendancestudent"
                    element={
                        <Adminlayout>
                            <Attendancestudent />
                        </Adminlayout>
                    }
                />

                <Route
                    path="/Leaverequest"
                    element={
                        <Adminlayout>
                            <Leaverequest />
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
                    path="/Internattendance"
                    element={
                        <Internlayout>
                            <Internattendance />
                        </Internlayout>
                    }
                />

                <Route
                    path="/Internmonthlycard"
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
