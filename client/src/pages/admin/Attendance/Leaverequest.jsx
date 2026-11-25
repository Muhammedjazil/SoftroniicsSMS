import React, { useEffect, useMemo, useState } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";

import {
  MdPersonOutline,
  MdSearch,
  MdFileDownload,
  MdOutlineRemoveRedEye,
  MdDeleteOutline,
} from "react-icons/md";

import "./Leaverequest.css";

// =============================================
// SAMPLE DATA
// Initially empty to match the new UI.
// Replace with API response when integrating.
// =============================================

const leaverequestInitialData = [];

const Leaverequest = () => {
  const { getLeaveRequests, deleteLeaveRequest } = AdminService();

  const [leaverequestLoading, setLeaverequestLoading] = useState(false);
  // =============================================
  // STATES
  // =============================================

  const [leaverequestData, setLeaverequestData] = useState(
    leaverequestInitialData,
  );

  const [leaverequestSearch, setLeaverequestSearch] = useState("");

  const [leaverequestBranch, setLeaverequestBranch] = useState("All Branches");

  const [leaverequestDate, setLeaverequestDate] = useState("");

  const [leaverequestMonth, setLeaverequestMonth] = useState("11");

  const [leaverequestYear, setLeaverequestYear] = useState("2026");

  const [leaverequestCurrentPage, setLeaverequestCurrentPage] = useState(1);

  const leaverequestItemsPerPage = 5;

  // =============================================
  // GET LEAVE REQUESTS
  // =============================================

  const leaverequestFetchData = async () => {
    try {
      setLeaverequestLoading(true);

      const response = await getLeaveRequests();

      console.log("Leave Requests:", response);

      // Support common response formats
      const requests = Array.isArray(response)
        ? response
        : response.requests || response.leaveRequests || response.data || [];

      const formattedData = requests.map((item) => {
        const intern = item.user || item.intern || {};

        const startDate = item.startDate || item.date;
        const endDate = item.endDate || item.date;

        return {
          id: item._id,

          admissionNumber: intern.admissionNumber || "",

          internName: intern.fullName || intern.name || "Unknown",

          batch: intern.batch?.batchName || item.batch?.batchName || "",

          course: intern.course?.courseName || item.course?.courseName || "",

          reason: item.reason || "",

          noOfDays: item.totalDays || 0,

          leaveStartDate: startDate
            ? new Date(startDate).toISOString().split("T")[0]
            : "",

          leaveEndDate: endDate
            ? new Date(endDate).toISOString().split("T")[0]
            : "",

          status: item.status || "PENDING",

          branch: item.branch?.branchName || "",
        };
      });

      setLeaverequestData(formattedData);
    } catch (error) {
      console.log(
        "Leave request fetch error:",
        error.response?.data || error.message,
      );

      setLeaverequestData([]);
    } finally {
      setLeaverequestLoading(false);
    }
  };

  // FETCH WHEN PAGE LOADS
  useEffect(() => {
    leaverequestFetchData();
  }, []);
  // =============================================
  // MONTHS
  // =============================================

  const leaverequestMonths = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // =============================================
  // FILTER DATA
  // =============================================

  const leaverequestFilteredData = useMemo(() => {
    return leaverequestData.filter((item) => {
      const searchValue = leaverequestSearch.toLowerCase();

      const searchMatch =
        item.internName?.toLowerCase().includes(searchValue) ||
        item.admissionNumber?.toLowerCase().includes(searchValue) ||
        item.batch?.toLowerCase().includes(searchValue) ||
        item.reason?.toLowerCase().includes(searchValue);

      const branchMatch =
        leaverequestBranch === "All Branches" ||
        item.branch === leaverequestBranch;

      let dateMatch = true;

      if (leaverequestDate) {
        dateMatch = item.leaveStartDate === leaverequestDate;
      }

      let monthMatch = true;

      if (leaverequestMonth !== "All") {
        monthMatch = item.leaveStartDate?.split("-")[1] === leaverequestMonth;
      }

      let yearMatch = true;

      if (leaverequestYear !== "All") {
        yearMatch = item.leaveStartDate?.split("-")[0] === leaverequestYear;
      }

      return searchMatch && branchMatch && dateMatch && monthMatch && yearMatch;
    });
  }, [
    leaverequestData,
    leaverequestSearch,
    leaverequestBranch,
    leaverequestDate,
    leaverequestMonth,
    leaverequestYear,
  ]);

  // =============================================
  // PAGINATION
  // =============================================

  const leaverequestTotalPages = Math.ceil(
    leaverequestFilteredData.length / leaverequestItemsPerPage,
  );

  const leaverequestStartIndex =
    (leaverequestCurrentPage - 1) * leaverequestItemsPerPage;

  const leaverequestCurrentData = leaverequestFilteredData.slice(
    leaverequestStartIndex,
    leaverequestStartIndex + leaverequestItemsPerPage,
  );

  // =============================================
  // DELETE REQUEST
  // =============================================

  // =============================================
// DELETE REQUEST
// =============================================

const leaverequestHandleDelete = async (id) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to delete this leave request?"
    );

    if (!confirmDelete) return;

    try {
        await deleteLeaveRequest(id);

        setLeaverequestData(previous =>
            previous.filter(item => item.id !== id)
        );

        alert("Leave request deleted successfully");

    } catch (error) {
        console.log(
            "Delete leave request error:",
            error.response?.data || error.message
        );

        alert("Failed to delete leave request");
    }
};
  // =============================================
  // VIEW REQUEST
  // =============================================

  const leaverequestHandleView = (item) => {
    console.log("Selected Leave Request:", item);

    // Add navigation or open the details component here.
  };

  // =============================================
  // EXPORT CSV
  // =============================================

  const leaverequestHandleExport = () => {
    if (leaverequestFilteredData.length === 0) {
      alert("No leave requests available to export.");
      return;
    }

    const leaverequestHeaders = [
      "Admission Number",
      "Intern Name",
      "Batch",
      "Course",
      "Reason",
      "Number of Days",
      "Leave Start Date",
      "Leave End Date",
      "Status",
      "Branch",
    ];

    const leaverequestRows = leaverequestFilteredData.map((item) => [
      item.admissionNumber,
      item.internName,
      item.batch,
      item.course,
      item.reason,
      item.noOfDays,
      item.leaveStartDate,
      item.leaveEndDate,
      item.status,
      item.branch,
    ]);

    const leaverequestCSV = [leaverequestHeaders, ...leaverequestRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const leaverequestBlob = new Blob([leaverequestCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const leaverequestURL = URL.createObjectURL(leaverequestBlob);

    const leaverequestLink = document.createElement("a");

    leaverequestLink.href = leaverequestURL;
    leaverequestLink.download = "Leave_Requests.csv";

    document.body.appendChild(leaverequestLink);
    leaverequestLink.click();
    document.body.removeChild(leaverequestLink);

    URL.revokeObjectURL(leaverequestURL);
  };

  // =============================================
  // FORMAT DATE
  // =============================================

  const leaverequestFormatDate = (date) => {
    if (!date) return "-";

    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  // =============================================
  // RESET PAGINATION WHEN FILTER CHANGES
  // =============================================

  const leaverequestResetPage = () => {
    setLeaverequestCurrentPage(1);
  };

  // =============================================
  // JSX
  // =============================================

  return (
    <div className="leaverequest-page">
      {/* =================================
                HEADER
            ================================= */}

      {/* =================================
                MAIN CONTENT
            ================================= */}

      <div className="leaverequest-main-card">
        {/* =================================
                    FILTER SECTION
                ================================= */}

        <div className="leaverequest-filter-section">
          {/* SEARCH */}

          <div className="leaverequest-search-box">
            <MdSearch />

            <input
              id="leaverequest-search"
              type="text"
              placeholder="Search Leave Requests..."
              value={leaverequestSearch}
              onChange={(e) => {
                setLeaverequestSearch(e.target.value);
                leaverequestResetPage();
              }}
            />
          </div>

          {/* BRANCH FILTER */}

          <select
            id="leaverequest-branch"
            value={leaverequestBranch}
            onChange={(e) => {
              setLeaverequestBranch(e.target.value);
              leaverequestResetPage();
            }}
          >
            <option value="All Branches">All Branches</option>
            <option value="Calicut">Calicut</option>
            <option value="Kochi">Kochi</option>
            <option value="Palakkad">Palakkad</option>
          </select>

          {/* DATE FILTER */}

          <input
            id="leaverequest-date"
            className="leaverequest-date-filter"
            type="date"
            value={leaverequestDate}
            onChange={(e) => {
              setLeaverequestDate(e.target.value);
              leaverequestResetPage();
            }}
            aria-label="Filter by leave date"
          />

          {/* MONTH FILTER */}

          <select
            id="leaverequest-month"
            value={leaverequestMonth}
            onChange={(e) => {
              setLeaverequestMonth(e.target.value);
              leaverequestResetPage();
            }}
          >
            {leaverequestMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}

            <option value="All">All Months</option>
          </select>

          {/* YEAR FILTER */}

          <select
            id="leaverequest-year"
            value={leaverequestYear}
            onChange={(e) => {
              setLeaverequestYear(e.target.value);
              leaverequestResetPage();
            }}
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="All">All Years</option>
          </select>

          {/* EXPORT */}

          <button
            type="button"
            className="leaverequest-export-btn"
            onClick={leaverequestHandleExport}
          >
            <MdFileDownload />
            Export
          </button>
        </div>

        {/* =================================
                    TABLE / EMPTY STATE
                ================================= */}

        {leaverequestCurrentData.length > 0 ? (
          <>
            <div className="leaverequest-table-wrapper">
              <table className="leaverequest-table">
                <thead>
                  <tr>
                    <th>Intern Name</th>
                    <th>Batch</th>
                    <th>Reason</th>
                    <th>No of Days</th>
                    <th>Leave Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leaverequestCurrentData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.internName}</td>

                      <td className="leaverequest-batch-cell">{item.batch}</td>

                      <td>{item.reason}</td>

                      <td>{item.noOfDays}</td>

                      <td className="leaverequest-date-cell">
                        {leaverequestFormatDate(item.leaveStartDate)}

                        {item.leaveEndDate !== item.leaveStartDate && (
                          <>
                            {" || "}
                            {leaverequestFormatDate(item.leaveEndDate)}
                          </>
                        )}
                      </td>

                      <td>
                        <span
                          className={`leaverequest-status leaverequest-status-${item.status?.toLowerCase()}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="leaverequest-actions">
                          <button
                            type="button"
                            title="View"
                            onClick={() => leaverequestHandleView(item)}
                          >
                            <MdOutlineRemoveRedEye />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            className="leaverequest-delete-btn"
                            onClick={() => leaverequestHandleDelete(item.id)}
                          >
                            <MdDeleteOutline />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="leaverequest-pagination">
              <span>
                {leaverequestCurrentPage} of {leaverequestTotalPages}
              </span>

              <button
                type="button"
                disabled={leaverequestCurrentPage === 1}
                onClick={() =>
                  setLeaverequestCurrentPage((previous) =>
                    Math.max(1, previous - 1),
                  )
                }
              >
                ‹
              </button>

              <button
                type="button"
                disabled={leaverequestCurrentPage >= leaverequestTotalPages}
                onClick={() =>
                  setLeaverequestCurrentPage((previous) =>
                    Math.min(leaverequestTotalPages, previous + 1),
                  )
                }
              >
                ›
              </button>
            </div>
          </>
        ) : (
          /* EMPTY STATE */

          <div className="leaverequest-empty-state">
            <p>No leave requests found matching filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaverequest;
