import useAxiosPrivate from "../../hooks/UseAxiosPrivate";

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

  // ======== Branch Management ======== //
  const takebranch = async () => {
    const response = await axiosPrivate.get("/branchmanagement");
    return response.data;
  };

  const takebranchbyid = async (id) => {
    const response = await axiosPrivate.get(`/branchmanagement/${id}`);
    return response.data;
  };

  const createbranch = async (branchData) => {
    const response = await axiosPrivate.post("/branchmanagement", branchData);
    return response.data;
  };

  const updatebranch = async (id, branchData) => {
    const response = await axiosPrivate.put(
      `/branchmanagement/${id}`,
      branchData
    );
    return response.data;
  };

  const removebranch = async (id) => {
    const response = await axiosPrivate.delete(`/branchmanagement/${id}`);
    return response.data;
  };

  // ======== Timing Management ======== //
  const taketiming = async (branchId) => {
    const params =
      branchId && branchId !== "All Branches" ? { branch: branchId } : {};
    const response = await axiosPrivate.get("/timemanagement", { params });
    return response.data;
  };

  const createtiming = async (timingData) => {
    const response = await axiosPrivate.post("/timemanagement", timingData);
    return response.data;
  };

  const updatetiming = async (id, timingData) => {
    const response = await axiosPrivate.put(
      `/timemanagement/${id}`,
      timingData
    );
    return response.data;
  };

  const removetiming = async (id) => {
    const response = await axiosPrivate.delete(`/timemanagement/${id}`);
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
    const response = await axiosPrivate.put(
      `/batchmanagement/${id}`,
      batchData
    );
    return response.data;
  };

  const changebatchstatus = async (id, status) => {
    const response = await axiosPrivate.put(`/batchmanagement/status/${id}`, {
      status,
    });
    return response.data;
  };

  const removebatch = async (id) => {
    const response = await axiosPrivate.delete(`/batchmanagement/${id}`);
    return response.data;
  };

  const takeinternsbybranch = async (branchId) => {
    const response = await axiosPrivate.get(
      `/batchmanagement/interns/${branchId}`
    );
    return response.data;
  };

  // ======== Mentor Batches & Schedule ======== //
  const takementors = async (branchId) => {
    const params = branchId && branchId !== "All Branches" ? { branchId } : {};
    const response = await axiosPrivate.get("/mentorbatches/mentors", {
      params,
    });
    return response.data;
  };

  const takementorschedule = async (mentorId, { startDate, branchId } = {}) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (branchId && branchId !== "All Branches") params.branchId = branchId;

    const response = await axiosPrivate.get(`/mentorbatches/${mentorId}`, {
      params,
    });
    return response.data;
  };

  // ======== Weekly Schedule Matrix ======== //
  const takeweeklyschedule = async ({ branchId, startDate }) => {
    const response = await axiosPrivate.get("/weeklyschedule", {
      params: { branchId, startDate },
    });
    return response.data;
  };

  const saveweeklyschedulecell = async (cellPayload) => {
    const response = await axiosPrivate.post(
      "/weeklyschedule/cell",
      cellPayload
    );
    return response.data;
  };

  const clonenextweeklyschedule = async ({ branchId, startDate }) => {
    const response = await axiosPrivate.post("/weeklyschedule/clone-next", {
      branchId,
      startDate,
    });
    return response.data;
  };

  // ======== Module Management ======== //
  const takemodules = async (params = {}) => {
    const response = await axiosPrivate.get("/modulemanagement", { params });
    return response.data;
  };

  const takecoursesformodules = async () => {
    const response = await axiosPrivate.get("/modulemanagement/courses");
    return response.data;
  };

  const createmodule = async (moduleData) => {
    const response = await axiosPrivate.post("/modulemanagement", moduleData);
    return response.data;
  };

  const updatemodule = async (id, moduleData) => {
    const response = await axiosPrivate.put(
      `/modulemanagement/${id}`,
      moduleData
    );
    return response.data;
  };

  const removemodule = async (id) => {
    const response = await axiosPrivate.delete(`/modulemanagement/${id}`);
    return response.data;
  };

  // ======== Topic Management ======== //
  const taketopics = async (params = {}) => {
    const response = await axiosPrivate.get("/topicmanagement", { params });
    return response.data;
  };

  const createtopic = async (topicData) => {
    const response = await axiosPrivate.post("/topicmanagement", topicData);
    return response.data;
  };

  const updatetopic = async (id, topicData) => {
    const response = await axiosPrivate.put(
      `/topicmanagement/${id}`,
      topicData
    );
    return response.data;
  };

  const removetopic = async (id) => {
    const response = await axiosPrivate.delete(`/topicmanagement/${id}`);
    return response.data;
  };

  // ======== Category Management ======== //
  const createcategory = async (categoryData) => {
    const response = await axiosPrivate.post(
      "/categorymanagement",
      categoryData
    );
    return response.data;
  };

  const takecategories = async () => {
    const response = await axiosPrivate.get("/categorymanagement");
    return response.data;
  };

  const takecategorybyid = async (id) => {
    const response = await axiosPrivate.get(`/categorymanagement/${id}`);
    return response.data;
  };

  const updatecategory = async (id, categoryData) => {
    const response = await axiosPrivate.put(
      `/categorymanagement/${id}`,
      categoryData
    );
    return response.data;
  };

  const removecategory = async (id) => {
    const response = await axiosPrivate.delete(`/categorymanagement/${id}`);
    return response.data;
  };

  // ======== Course Management ======== //
  const createcourse = async (courseData) => {
    const response = await axiosPrivate.post("/coursemanagement", courseData);
    return response.data;
  };

  const takecourses = async (params = {}) => {
    const response = await axiosPrivate.get("/coursemanagement", { params });
    return response.data;
  };

  const takecoursebyid = async (id) => {
    const response = await axiosPrivate.get(`/coursemanagement/${id}`);
    return response.data;
  };

  const updatecourse = async (id, courseData) => {
    const response = await axiosPrivate.put(
      `/coursemanagement/${id}`,
      courseData
    );
    return response.data;
  };

  const removecourse = async (id) => {
    const response = await axiosPrivate.delete(`/coursemanagement/${id}`);
    return response.data;
  };

  // ======== Staff Management ======== //
  const createstaff = async (data) => {
    const response = await axiosPrivate.post("/staffmanagement", data);
    return response.data;
  };

  const getallstaff = async () => {
    const response = await axiosPrivate.get("/staffmanagement/allstaff");
    return response.data;
  };

  const updatestaff = async (id, data) => {
    const response = await axiosPrivate.put(`/staffmanagement/${id}`, data);
    return response.data;
  };

  const staffremove = async (id) => {
    const response = await axiosPrivate.delete(`/staffmanagement/${id}`);
    return response.data;
  };

  
const createintern = async (internData) => {
  const response = await axiosPrivate.post(
    "/internmanagement",
    internData
  );

  return response.data;
};
const getallinterns = async () => {
  const response = await axiosPrivate.get("/internmanagement");
  return response.data;
};


const updateintern = async (id, data) => {
  const response = await axiosPrivate.put(
    `/internmanagement/${id}`,
    data
  );
  return response.data;
};

const handledeleteintern=async(id)=>{
  let response=await axiosPrivate.delete(`/internmanagement/${id}`)
  return response.data;
}
   
  return {
    newrolecreate,
    takeroles,
    Updaterole,
    roleremove,
    changestatus,
    takeroletitle,
    takebranch,
    takebranchbyid,
    createbranch,
    updatebranch,
    removebranch,
    taketiming,
    createtiming,
    updatetiming,
    removetiming,
    createbatch,
    takebatches,
    takebatchbyid,
    updatebatch,
    changebatchstatus,
    removebatch,
    takeinternsbybranch,
    takementors,
    takementorschedule,
    takeweeklyschedule,
    saveweeklyschedulecell,
    clonenextweeklyschedule,
    takemodules,
    takecoursesformodules,
    createmodule,
    updatemodule,
    removemodule,
    taketopics,
    createtopic,
    updatetopic,
    removetopic,
    createcategory,
    takecategories,
    takecategorybyid,
    updatecategory,
    removecategory,
    createcourse,
    takecourses,
    takecoursebyid,
    updatecourse,
    removecourse,
    createstaff,
    getallstaff,
    updatestaff,
    staffremove,
    createintern,
      getallinterns,
      updateintern,
      handledeleteintern
  };
};

export default AdminService;