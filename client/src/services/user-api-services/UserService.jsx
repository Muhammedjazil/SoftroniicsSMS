import useAxiosPrivate from "../../hooks/UseAxiosPrivate";

const UserService = () => {
  const axiosPrivate = useAxiosPrivate();

  // ======== Intern Weekly Schedule ======== //
  const takeinternweeklyschedule = async ({ internId, email, startDate } = {}) => {
    const params = {};
    if (internId) params.internId = internId;
    if (email) params.email = email;
    if (startDate) params.startDate = startDate;

    const response = await axiosPrivate.get("/internschedule", { params });
    return response.data;
  };

  return {
    takeinternweeklyschedule,
  };
};

export default UserService;