import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const AdminService = () => {
  const axiosPrivate = useAxiosPrivate();

  // ======== Role Management ======== //
  const newrolecreate = async (roleData) => {
    const response = await axiosPrivate.post("/Rolemanagement", roleData);
    return response.data;
  };

  const takeroles = async () => {
    const response = await axiosPrivate.get("/Rolemanagement");
    return response.data;
  };

  const Updaterole = async (id, roleData) => {
    const response = await axiosPrivate.put(`/Rolemanagement/${id}`, roleData);
    return response.data;
  };

  const roleremove = async (id) => {
    const response = await axiosPrivate.delete(`/Rolemanagement/${id}`);
    return response.data;
  };

  const changestatus = async (id) => {
    const response = await axiosPrivate.put(`/Rolemanagement/status/${id}`);
    return response.data;
  };

  const takeroletitle = async () => {
    const response = await axiosPrivate.get("/staffmanagement");
    return response.data;
  };

  // ======== Branch & Timing ======== //
  const takebranch = async () => {
    const response = await axiosPrivate.get("/branchmanagement");
    return response.data;
  };

  const taketiming = async () => {
    const response = await axiosPrivate.get("/timemanagement");
    return response.data;
  };

  // ======== Batch Management ======== //
  const createbatch = async (batchData) => {
    const response = await axiosPrivate.post("/batchmanagement", batchData);
    return response.data;
  };

  const takebatches = async (params = {}) => {
    const response = await axiosPrivate.get("/batchmanagement", { params });
    return response.data;
  };

  const takebatchbyid = async (id) => {
    const response = await axiosPrivate.get(`/batchmanagement/${id}`);
    return response.data;
  };

  const updatebatch = async (id, batchData) => {
    const response = await axiosPrivate.put(`/batchmanagement/${id}`, batchData);
    return response.data;
  };

  const changebatchstatus = async (id, status) => {
    const response = await axiosPrivate.put(`/batchmanagement/status/${id}`, { status });
    return response.data;
  };

  const removebatch = async (id) => {
    const response = await axiosPrivate.delete(`/batchmanagement/${id}`);
    return response.data;
  };

  const takeinternsbybranch = async (branchId) => {
    const response = await axiosPrivate.get(`/batchmanagement/interns/${branchId}`);
    return response.data;
  };

  // ======== Mentor Batches & Schedule ======== //
  const takementors = async (branchId) => {
    const params = branchId && branchId !== "All Branches" ? { branchId } : {};
    const response = await axiosPrivate.get("/mentorbatches/mentors", { params });
    return response.data;
  };

  const takementorschedule = async (mentorId, { startDate, branchId } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (branchId && branchId !== "All Branches") params.branchId = branchId;

    const response = await axiosPrivate.get(`/mentorbatches/${mentorId}`, { params });
    return response.data;
  };

  return {
    newrolecreate,
    takeroles,
    Updaterole,
    roleremove,
    changestatus,
    takeroletitle,
    takebranch,
    taketiming,
    createbatch,
    takebatches,
    takebatchbyid,
    updatebatch,
    changebatchstatus,
    removebatch,
    takeinternsbybranch,
    takementors,
    takementorschedule,
  };
};

export default AdminService;