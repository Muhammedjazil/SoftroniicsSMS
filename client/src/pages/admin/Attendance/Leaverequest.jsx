import React, { useEffect, useMemo, useState } from "react";
import AdminService from "../../../services/admin-api-services/AdminService";
import Loader from "../../../components/common/Loader";
import { useToast } from "../../../components/common/Toast";

import {
  MdSearch,
  MdFileDownload,
  MdOutlineRemoveRedEye,
  MdCheck,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

import "./Leaverequest.css";

const Leaverequest = () => {
  const { getLeaveRequests, updateLeaveRequestStatus } = AdminService();
  const { showToast, ToastContainer } = useToast();

  const [leaverequestLoading, setLeaverequestLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [leaverequestData, setLeaverequestData] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [leaverequestSearch, setLeaverequestSearch] = useState("");
  const [leaverequestBranch, setLeaverequestBranch] = useState("All Branches");
  const [leaverequestDate, setLeaverequestDate] = useState("");
  const [leaverequestMonth, setLeaverequestMonth] = useState("All");
  const [leaverequestYear, setLeaverequestYear] = useState("All");

  const [leaverequestCurrentPage, setLeaverequestCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
  // GET LEAVE REQUESTS
  // =============================================
  const leaverequestFetchData = async () => {
    try {
      setLeaverequestLoading(true);
      const response = await getLeaveRequests();

      const requests = Array.isArray(response)
        ? response
        : response.requests || response.leaveRequests || response.data || [];

      const formattedData = requests.map((item) => {
        const intern = item.user || item.intern || {};
        const startDate = item.startDate || item.date;
        const endDate = item.endDate || item.date;

        return {
          id: item._id,
          admissionNumber: intern.admissionNumber || item.admissionNumber || "",
          internName: intern.fullName || intern.name || item.internName || "Unknown",
          email: intern.email || item.email || "",
          batch: intern.batch?.batchName || item.batch?.batchName || item.batch || "",
          course: intern.course?.courseName || item.course?.courseName || item.course || "",
          leaveType: item.leaveType || "OTHER",
          reason: item.reason || "",
          noOfDays: item.totalDays || item.noOfDays || 0,
          leaveStartDate: startDate
            ? new Date(startDate).toISOString().split("T")[0]
            : "",
          leaveEndDate: endDate
            ? new Date(endDate).toISOString().split("T")[0]
            : "",
          status: (item.status || "PENDING").toUpperCase(),
          branch: item.branch?.branchName || item.branchName || intern.branch?.branchName || "",
        };
      });

      setLeaverequestData(formattedData);
    } catch (error) {
      console.log(
        "Leave request fetch error:",
        error.response?.data || error.message
      );
      setLeaverequestData([]);
    } finally {
      setLeaverequestLoading(false);
    }
  };

  useEffect(() => {
    leaverequestFetchData();
  }, []);

  // =============================================
  // DYNAMIC BRANCH & YEAR OPTIONS
  // =============================================
  const branchOptions = useMemo(() => {
    const unique = new Set(
      leaverequestData
        .map((item) => item.branch?.trim())
        .filter(Boolean)
    );
    return Array.from(unique);
  }, [leaverequestData]);

  // =============================================
  // FILTER DATA
  // =============================================
  const leaverequestFilteredData = useMemo(() => {
    return leaverequestData.filter((item) => {
      const searchValue = leaverequestSearch.toLowerCase().trim();

      const searchMatch =
        !searchValue ||
        item.internName?.toLowerCase().includes(searchValue) ||
        item.email?.toLowerCase().includes(searchValue) ||
        item.admissionNumber?.toLowerCase().includes(searchValue) ||
        item.batch?.toLowerCase().includes(searchValue) ||
        item.leaveType?.toLowerCase().includes(searchValue) ||
        item.reason?.toLowerCase().includes(searchValue);

      const branchMatch =
        leaverequestBranch === "All Branches" ||
        item.branch?.toLowerCase() === leaverequestBranch.toLowerCase();

      const dateMatch =
        !leaverequestDate || item.leaveStartDate === leaverequestDate;

      const monthMatch =
        leaverequestMonth === "All" ||
        item.leaveStartDate?.split("-")[1] === leaverequestMonth;

      const yearMatch =
        leaverequestYear === "All" ||
        item.leaveStartDate?.split("-")[0] === leaverequestYear;

      return (
        searchMatch &&
        branchMatch &&
        dateMatch &&
        monthMatch &&
        yearMatch
      );
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
  const totalResults = leaverequestFilteredData.length;
  const leaverequestTotalPages = Math.max(
    1,
    Math.ceil(totalResults / itemsPerPage)
  );
  const leaverequestStartIndex = (leaverequestCurrentPage - 1) * itemsPerPage;
  const leaverequestCurrentData = leaverequestFilteredData.slice(
    leaverequestStartIndex,
    leaverequestStartIndex + itemsPerPage
  );
  const showingFrom = totalResults === 0 ? 0 : leaverequestStartIndex + 1;
  const showingTo = Math.min(
    leaverequestStartIndex + itemsPerPage,
    totalResults
  );

  // =============================================
  // APPROVE / REJECT REQUEST
  // =============================================
  const handleStatusChange = async (id, newStatus) => {
    try {
      setStatusUpdatingId(id);
      await updateLeaveRequestStatus(id, { status: newStatus });

      setLeaverequestData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      setSelectedRequest((prev) =>
        prev && prev.id === id ? { ...prev, status: newStatus } : prev
      );

      showToast(
        `Leave request ${newStatus.toLowerCase()} successfully`,
        "success"
      );
    } catch (error) {
      console.error("Update leave status error:", error);
      showToast(
        error.response?.data?.message || "Failed to update leave status",
        "error"
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // =============================================
  // EXPORT CSV
  // =============================================
  const leaverequestHandleExport = () => {
    if (leaverequestFilteredData.length === 0) {
      showToast("No leave requests available to export.", "error");
      return;
    }

    const leaverequestHeaders = [
      "Admission Number",
      "Intern Name",
      "Email",
      "Batch",
      "Branch",
      "Leave Type",
      "Reason",
      "No of Days",
      "Leave Start Date",
      "Leave End Date",
      "Status",
    ];

    const leaverequestRows = leaverequestFilteredData.map((item) => [
      item.admissionNumber,
      item.internName,
      item.email,
      item.batch,
      item.branch,
      item.leaveType,
      item.reason,
      item.noOfDays,
      item.leaveStartDate,
      item.leaveEndDate,
      item.status,
    ]);

    const leaverequestCSV = [leaverequestHeaders, ...leaverequestRows]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
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

  const formatLeaveDateRange = (item) => {
    if (!item?.leaveStartDate) return "-";
    if (
      item.leaveEndDate &&
      item.leaveEndDate !== item.leaveStartDate
    ) {
      return `${leaverequestFormatDate(item.leaveStartDate)} - ${leaverequestFormatDate(item.leaveEndDate)}`;
    }
    return leaverequestFormatDate(item.leaveStartDate);
  };

  const leaverequestResetPage = () => {
    setLeaverequestCurrentPage(1);
  };

  return (
    <div className="leaverequest-page">
      <ToastContainer />

      <div className="leaverequest-main-card">
        {/* FILTER SECTION */}
        <div className="leaverequest-filter-section">
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

          <select
            id="leaverequest-branch"
            value={leaverequestBranch}
            onChange={(e) => {
              setLeaverequestBranch(e.target.value);
              leaverequestResetPage();
            }}
          >
            <option value="All Branches">All Branches</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

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

          <select
            id="leaverequest-month"
            value={leaverequestMonth}
            onChange={(e) => {
              setLeaverequestMonth(e.target.value);
              leaverequestResetPage();
            }}
          >
            <option value="All">All Months</option>
            {leaverequestMonths.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>

          <select
            id="leaverequest-year"
            value={leaverequestYear}
            onChange={(e) => {
              setLeaverequestYear(e.target.value);
              leaverequestResetPage();
            }}
          >
            <option value="All">All Years</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
          </select>

          <button
            type="button"
            className="leaverequest-export-btn"
            onClick={leaverequestHandleExport}
          >
            <MdFileDownload />
            Export
          </button>
        </div>

        {/* TABLE / LOADING / EMPTY STATE */}
        {leaverequestLoading ? (
          <Loader message="Loading leave requests..." minHeight="280px" />
        ) : leaverequestCurrentData.length > 0 ? (
          <>
            <div className="leaverequest-table-wrapper">
              <table className="leaverequest-table">
                <thead>
                  <tr>
                    <th>NAME</th>
                    <th>BATCH</th>
                    <th>LEAVE TYPE</th>
                    <th className="lr-th-center">DAYS</th>
                    <th>LEAVE DATE</th>
                    <th className="lr-th-center">STATUS</th>
                    <th className="lr-th-center">ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {leaverequestCurrentData.map((item) => {
                    const initial = (item.internName || "U")
                      .charAt(0)
                      .toUpperCase();
                    const isUpdating = statusUpdatingId === item.id;

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="lr-name-cell">
                            <span className="lr-avatar">{initial}</span>
                            <div className="lr-name-meta">
                              <span className="lr-intern-name">
                                {item.internName}
                              </span>
                              <span className="lr-intern-email">
                                {item.email || "-"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="leaverequest-batch-cell">
                          {item.batch || "-"}
                        </td>

                        <td className="lr-leave-type">
                          {item.leaveType || "-"}
                        </td>

                        <td className="lr-days-cell">{item.noOfDays}</td>

                        <td className="lr-date-cell">
                          {formatLeaveDateRange(item)}
                        </td>

                        <td className="lr-td-center">
                          <span
                            className={`leaverequest-status leaverequest-status-${item.status?.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td>
                          <div className="lr-actions-row">
                            <button
                              type="button"
                              className="lr-action-btn lr-action-view"
                              onClick={() => setSelectedRequest(item)}
                            >
                              <MdOutlineRemoveRedEye />
                              <span>View</span>
                            </button>

                            <button
                              type="button"
                              className="lr-action-btn lr-action-approve"
                              disabled={
                                isUpdating || item.status === "APPROVED"
                              }
                              onClick={() =>
                                handleStatusChange(item.id, "APPROVED")
                              }
                            >
                              <MdCheck />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              className="lr-action-btn lr-action-reject"
                              disabled={
                                isUpdating || item.status === "REJECTED"
                              }
                              onClick={() =>
                                handleStatusChange(item.id, "REJECTED")
                              }
                            >
                              <MdClose />
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FOOTER PAGINATION */}
            <div className="lr-footer-bar">
              <span className="lr-results-text">
                Showing {showingFrom} to {showingTo} of {totalResults} results
              </span>

              <div className="lr-pagination-controls">
                <button
                  type="button"
                  className="lr-nav-btn"
                  disabled={leaverequestCurrentPage === 1}
                  onClick={() =>
                    setLeaverequestCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                >
                  <MdChevronLeft />
                  <span>Previous</span>
                </button>

                <span className="lr-page-indicator">
                  Page {leaverequestCurrentPage} of {leaverequestTotalPages}
                </span>

                <button
                  type="button"
                  className="lr-nav-btn"
                  disabled={leaverequestCurrentPage >= leaverequestTotalPages}
                  onClick={() =>
                    setLeaverequestCurrentPage((prev) =>
                      Math.min(leaverequestTotalPages, prev + 1)
                    )
                  }
                >
                  <span>Next</span>
                  <MdChevronRight />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="leaverequest-empty-state">
            <p>No leave requests found matching filters.</p>
          </div>
        )}
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedRequest && (
        <div
          className="lr-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="lr-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lr-modal-header">
              <h2>Leave Request: {selectedRequest.internName}</h2>

              <button
                type="button"
                className="leaverequest-back-btn"
                onClick={() => setSelectedRequest(null)}
              >
                <MdChevronLeft />
                <span>Back</span>
              </button>
            </div>

            <div className="lr-modal-section">
              <h3 className="lr-section-title">Applicant Details</h3>

              <div className="lr-detail-grid">
                <div className="lr-detail-item">
                  <span className="lr-detail-label">Name:</span>
                  <span className="lr-detail-value">
                    {selectedRequest.internName || "-"}
                  </span>
                </div>

                <div className="lr-detail-item">
                  <span className="lr-detail-label">Email:</span>
                  <span className="lr-detail-value">
                    {selectedRequest.email || "-"}
                  </span>
                </div>

                <div className="lr-detail-item">
                  <span className="lr-detail-label">Batch:</span>
                  <span className="lr-detail-value">
                    {selectedRequest.batch || "-"}
                  </span>
                </div>

                <div className="lr-detail-item">
                  <span className="lr-detail-label">Branch:</span>
                  <span className="lr-detail-value" style={{ textTransform: "lowercase" }}>
                    {selectedRequest.branch || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="lr-modal-section">
              <h3 className="lr-section-title">Leave Details</h3>

              <div className="lr-detail-grid">
                <div className="lr-detail-item">
                  <span className="lr-detail-label">Leave Type:</span>
                  <span className="lr-detail-value">
                    {selectedRequest.leaveType || "-"}
                  </span>
                </div>

                <div className="lr-detail-item">
                  <span className="lr-detail-label">Duration:</span>
                  <span className="lr-detail-value">
                    {selectedRequest.noOfDays}{" "}
                    {selectedRequest.noOfDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                <div className="lr-detail-item">
                  <span className="lr-detail-label">Date:</span>
                  <span className="lr-detail-value">
                    {formatLeaveDateRange(selectedRequest)}
                  </span>
                </div>
              </div>

              <div className="lr-reason-block">
                <span className="lr-detail-label">Reason:</span>
                <div className="lr-reason-box">
                  {selectedRequest.reason || "-"}
                </div>
              </div>
            </div>

            <div className="lr-modal-section">
              <h3 className="lr-section-title">Approval &amp; Review</h3>

              <div className="lr-detail-item">
                <span className="lr-detail-label">Status:</span>
                <span
                  className={`leaverequest-status leaverequest-status-${selectedRequest.status?.toLowerCase()}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            <div className="lr-modal-footer">
              <button
                type="button"
                className="lr-modal-btn lr-modal-btn-approve"
                disabled={
                  statusUpdatingId === selectedRequest.id ||
                  selectedRequest.status === "APPROVED"
                }
                onClick={() =>
                  handleStatusChange(selectedRequest.id, "APPROVED")
                }
              >
                Approve
              </button>

              <button
                type="button"
                className="lr-modal-btn lr-modal-btn-reject"
                disabled={
                  statusUpdatingId === selectedRequest.id ||
                  selectedRequest.status === "REJECTED"
                }
                onClick={() =>
                  handleStatusChange(selectedRequest.id, "REJECTED")
                }
              >
                Reject
              </button>

              <button
                type="button"
                className="lr-modal-btn lr-modal-btn-print"
                onClick={() => window.print()}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaverequest;
