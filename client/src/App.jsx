import { BrowserRouter, Routes, Route } from "react-router-dom";

// ADMIN LAYOUT
import Adminlayout from "./components/Layout/Adminlayout";

// INTERN LAYOUT
import { Internlayout } from "./components/Layout/Internlayout";

// ADMIN PAGES - ADMINISTRATION
import { Rolemanagement } from "./pages/admin/administration/Rolemanagement";
import { Staffmanagement } from "./pages/admin/administration/Staffmanagement";
import { Internmanagement } from "./pages/admin/administration/Internmanagement";

// ADMIN PAGES - SCHEDULE
import BatchManagement from "./pages/admin/schedule/BatchManagement";
import MentorBatches from "./pages/admin/schedule/MentorBatches";
import TimingsManagement from "./pages/admin/schedule/TimingsManagement";
import WeeklySchedule from "./pages/admin/schedule/WeeklySchedule";

// ADMIN PAGES - SETTINGS
import { Branch } from "./pages/admin/settings/Settingsbranch";
import { Notification } from "./pages/admin/settings/Setingsnotification";

// ADMIN PAGES - SYLLABUS
import ModuleManagement from "./pages/admin/syllabus/ModuleManagement";
import TopicsManagement from "./pages/admin/syllabus/TopicsManagement";

// INTERN PAGES
import { Internnotification } from "./pages/intern/Internnotification";
import { Intrentask } from "./pages/intern/interntask";

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

                {/* Administration */}
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

                {/* Schedule */}
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

                {/* Settings */}
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

                {/* Syllabus */}
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

            </Routes>

        </BrowserRouter>

    );

}

export default App;