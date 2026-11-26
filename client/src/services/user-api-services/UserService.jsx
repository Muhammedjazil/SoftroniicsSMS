
import useAxiosPrivate from "../../hooks/UseAxiosPrivate";

const UserService = () => {
  const axiosPrivate = useAxiosPrivate();

  // ======== Intern Weekly Schedule ======== //
  const takeinternweeklyschedule = async ({
    internId,
    email,
    startDate,
  } = {}) => {
    try {
      const params = {};
      if (internId) params.internId = internId;
      if (email) params.email = email;
      if (startDate) params.startDate = startDate;

      const response = await axiosPrivate.get("/internschedule", {
        params,
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ======== Intern Weekly Card ======== //
  const takeinternweeklycard = async ({ internId, email } = {}) => {
    try {
      const params = {};
      if (internId) params.internId = internId;
      if (email) params.email = email;

      const response = await axiosPrivate.get(
        "/internschedule/weeklycard",
        { params }
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ======== Notifications ======== //
  const takeallnotification = async () => {
    try {
      const response = await axiosPrivate.get(
        "/notificationmanagement/my-notifications"
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const marknotificationread = async (notificationId) => {
    try {
      const response = await axiosPrivate.patch(
        `/notificationmanagement/my-notifications/${notificationId}/read`
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  const markallnotificationsread = async () => {
    try {
      const response = await axiosPrivate.patch(
        "/notificationmanagement/my-notifications/read-all"
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ======== Intern Materials ======== //
  const takematerials = async () => {
    try {
      const response = await axiosPrivate.get(
        "/materialmanagement/intern"
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ======== Get Material By ID ======== //
  const takematerialbyid = async (id) => {
    try {
      const response = await axiosPrivate.get(
        `/materialmanagement/${id}`
      );

      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };
// ================= APPLY INTERN LEAVE ================= //

const applyinternleave = async (leaveData) => {
  try {
    const response = await axiosPrivate.post(
      "/leaverequestmanagement/intern/apply",
      leaveData
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ================= GET MY LEAVE REQUESTS ================= //

const takeinternleaverequests = async () => {
  try {
    const response = await axiosPrivate.get(
      "/leaverequestmanagement/intern/my-requests"
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
  return {
    takeinternweeklyschedule,
    takeinternweeklycard,
    takeallnotification,
    marknotificationread,
    markallnotificationsread,
    takematerials,
    takematerialbyid,
     applyinternleave,
  takeinternleaverequests,
  };
};

export default UserService;