import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import UserService from "../../services/user-api-services/UserService";
import Loader from "../../components/common/Loader";
import "./InternLeaveRequest.css";

const InternLeaveRequest = () => {
  const { setHeaderMeta } = useOutletContext() || {};
  const { applyinternleave, takeinternleaverequests } = UserService();

  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    if (!setHeaderMeta) return;
    setHeaderMeta({
      title: "Leave Request",
      parentPath: "Leave Requests",
      currentPath: activeTab === "apply" ? "Apply Leave" : "My Leave Requests",
      onParentClick: () => {
        setActiveTab("requests");
        setError("");
        setSuccess("");
      },
    });
  }, [activeTab, setHeaderMeta]);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    leaveDurationType: "SINGLE",
    leaveType: "",
    date: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const today = new Date().toLocaleDateString("en-CA");

  // ================= FETCH LEAVE REQUESTS ================= //

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await takeinternleaverequests();

      setLeaveRequests(response.leaveRequests || []);
    } catch (error) {
      console.error("Leave request fetching error:", error);

      setError(error.message || "Failed to load leave requests from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // ================= HANDLE INPUT ================= //

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= CHANGE DURATION ================= //

  const handleDurationChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      leaveDurationType: value,
      date: "",
      startDate: "",
      endDate: "",
    }));
  };

  // ================= RESET FORM ================= //

  const resetForm = () => {
    setFormData({
      leaveDurationType: "SINGLE",
      leaveType: "",
      date: "",
      startDate: "",
      endDate: "",
      reason: "",
    });

    setError("");
    setSuccess("");
  };

  // ================= SUBMIT LEAVE ================= //

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.leaveType) {
      setError("Please choose a leave type.");
      return;
    }

    if (formData.leaveDurationType === "SINGLE" && !formData.date) {
      setError("Please select a date.");
      return;
    }

    if (formData.leaveDurationType === "MULTIPLE") {
      if (!formData.startDate || !formData.endDate) {
        setError("Please select both start date and end date.");
        return;
      }

      if (formData.endDate < formData.startDate) {
        setError("End date cannot be before start date.");
        return;
      }
    }

    if (!formData.reason.trim()) {
      setError("Please enter the reason for your leave.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await applyinternleave({
        ...formData,
        reason: formData.reason.trim(),
      });

      const successMessage =
        response.message || "Leave request submitted successfully.";

      resetForm();
      await fetchLeaveRequests();
      setActiveTab("requests");
      setSuccess(successMessage);
    } catch (error) {
      console.error("Leave submission error:", error);

      setError(error.message || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= FORMAT DATE ================= //

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ================= GET LEAVE DATE ================= //

  const getLeaveDate = (item) => {
    if (item.leaveDurationType === "SINGLE") {
      return formatDate(item.date);
    }

    return `${formatDate(item.startDate)} - ${formatDate(item.endDate)}`;
  };

  // ================= JSX ================= //

  return (
    <div className="intern-leave-page">
      {/* PAGE HEADER */}

      {/* TABS */}

      <div className="intern-leave-tabs">
        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => {
            setActiveTab("requests");
            setError("");
            setSuccess("");
          }}
        >
          Leave Requests
        </button>

        <button
          className={activeTab === "apply" ? "active" : ""}
          onClick={() => {
            setActiveTab("apply");
            setError("");
            setSuccess("");
          }}
        >
          Apply Leave
        </button>
      </div>

      {/* ERROR MESSAGE */}

      {error && <div className="leave-error-message">{error}</div>}

      {/* ================= LEAVE REQUEST LIST ================= */}

      {activeTab === "requests" && (
        <div className="intern-leave-content">
          {loading ? (
            <Loader message="Loading leave requests..." minHeight="240px" />
          ) : leaveRequests.length === 0 ? (
            <div className="leave-empty-message">No leave requests found.</div>
          ) : (
            <div className="leave-table-wrapper">
              <table className="intern-leave-table">
                <thead>
                  <tr>
                    <th>LEAVE TYPE</th>
                    <th>DURATION</th>
                    <th>DATE</th>
                    <th>TOTAL DAYS</th>
                    <th>REASON</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {leaveRequests.map((item) => (
                    <tr key={item._id}>
                      <td>{item.leaveType}</td>

                      <td>
                        {item.leaveDurationType === "SINGLE"
                          ? "Single Day"
                          : "Multiple Days"}
                      </td>

                      <td>{getLeaveDate(item)}</td>

                      <td>{item.totalDays}</td>

                      <td className="leave-reason-cell">{item.reason}</td>

                      <td>
                        <span
                          className={`leave-status ${item.status?.toLowerCase()}`}
                        >
                          {item.status === "PENDING"
                            ? "Pending"
                            : item.status === "APPROVED"
                              ? "Approved"
                              : "Rejected"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && leaveRequests.length > 0 && (
            <div className="leave-count">
              Showing {leaveRequests.length} leave requests
            </div>
          )}
        </div>
      )}

      {/* ================= APPLY LEAVE FORM ================= */}

      {activeTab === "apply" && (
        <form className="intern-leave-form" onSubmit={handleSubmit}>
          {/* DURATION TYPE */}

          <div className="leave-form-group">
            <label>
              Duration Type <span>*</span>
            </label>

            <div className="leave-radio-group">
              <label>
                <input
                  type="radio"
                  name="leaveDurationType"
                  checked={formData.leaveDurationType === "SINGLE"}
                  onChange={() => handleDurationChange("SINGLE")}
                />
                Single Day
              </label>

              <label>
                <input
                  type="radio"
                  name="leaveDurationType"
                  checked={formData.leaveDurationType === "MULTIPLE"}
                  onChange={() => handleDurationChange("MULTIPLE")}
                />
                Multiple Days
              </label>
            </div>
          </div>

          {/* LEAVE TYPE */}

          <div className="leave-form-group">
            <label htmlFor="leaveType">
              Leave Type <span>*</span>
            </label>

            <select
              id="leaveType"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value="">Choose Leave Type</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Leave</option>
              <option value="MEDICAL">Medical Leave</option>
              <option value="FAMILY">Family Leave</option>
              <option value="EXAM">Exam Leave</option>
              <option value="EVENT">Event Leave</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* SINGLE DAY DATE */}

          {formData.leaveDurationType === "SINGLE" && (
            <div className="leave-form-group">
              <label htmlFor="date">
                Date <span>*</span>
              </label>

              <input
                type="date"
                id="date"
                name="date"
                min={today}
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* MULTIPLE DAY DATE */}

          {formData.leaveDurationType === "MULTIPLE" && (
            <div className="leave-date-row">
              <div className="leave-form-group">
                <label htmlFor="startDate">
                  From Date <span>*</span>
                </label>

                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  min={today}
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="leave-form-group">
                <label htmlFor="endDate">
                  To Date <span>*</span>
                </label>

                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  min={formData.startDate || today}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* REASON */}

          <div className="leave-form-group">
            <label htmlFor="reason">
              Reason <span>*</span>
            </label>

            <textarea
              id="reason"
              name="reason"
              rows="5"
              placeholder="Enter details about your leave..."
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          {/* BUTTONS */}

          <div className="leave-form-footer">
            <button
              type="button"
              className="leave-cancel-btn"
              onClick={() => {
                resetForm();
                setActiveTab("requests");
              }}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="leave-submit-btn"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Apply Leave"}
            </button>
          </div>
        </form>
      )}

      {/* ================= SUCCESS MODAL ================= */}
      {success && (
        <div
          className="leave-modal-overlay"
          onClick={() => setSuccess("")}
        >
          <div
            className="leave-success-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="leave-success-modal-header">
              <FiCheckCircle className="leave-success-modal-icon" />
              <h3>Success</h3>
            </div>

            <p className="leave-success-modal-text">{success}</p>

            <div className="leave-success-modal-footer">
              <button
                type="button"
                className="leave-success-modal-ok"
                onClick={() => setSuccess("")}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternLeaveRequest;
