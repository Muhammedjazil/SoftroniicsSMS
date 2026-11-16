
import { Internnavbar } from "../Intern/Internnavbar";
import "./Internlayout.css";

export const Internlayout = ({ children }) => {

    return (
        <div className="internlayout">

            {/* SIDEBAR */}
            <div className="internlayout-sidebar">
                <Internnavbar />
            </div>

            {/* PAGE CONTENT */}
            <div className="internlayout-content">
                {children}
            </div>

        </div>
    );
};
