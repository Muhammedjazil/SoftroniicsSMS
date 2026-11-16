
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
