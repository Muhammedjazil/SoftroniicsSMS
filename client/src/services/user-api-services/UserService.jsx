import useAxiosPrivate from "../../hooks/UseAxiosPrivate";

const UserService = () => {
  const axiosPrivate = useAxiosPrivate();

  // ======== Intern Weekly Schedule ======== //
  const takeinternweeklyschedule = async ({ internId, email, startDate } = {}) => {
    try {
      const params = {};
      if (internId) params.internId = internId;
      if (email) params.email = email;
      if (startDate) params.startDate = startDate;

      const response = await axiosPrivate.get("/internschedule", { params });
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

      const response = await axiosPrivate.get("/internschedule/weeklycard", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  };

  // ======== Notifications ======== //
  const takeallnotification = async () => {
    try {
      const response = await axiosPrivate.get("/notificationmanagement/my-notifications");
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


   // ======== Intern Attendance ======== //
  const getMyAttendance = async () => {
    try {
      const response = await axiosPrivate.get(
        "/attendancemanagement/my-attendance"
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
    getMyAttendance
  };
};

export default UserService;