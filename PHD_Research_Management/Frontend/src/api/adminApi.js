import axios from "./axios";

// Dashboard counts
export const getTotalStudents = async ()=>{
    const res = await axios.get("/admin/students");
    return res.data.length;
}
export const getTotalSupervisors = async ()=>{
    const res = await axios.get("/admin/supervisors");
    return res.data.length;
}
export const getTotalCoordinators = async ()=>{
    const res = await axios.get("/admin/coordinators");
    return res.data.length;
}
export const getTotalDepartments = async ()=>{
    const res = await axios.get("/admin/departments");
    return res.data.length;
}


// admin
export const createAdmin = async (data)=>{
    const res = await axios.post("/admin/admins", data);
    return res.data;
}


// Users
export const getAllUsers = async ()=>{
    const res = await axios.get("/admin/users");
    return res.data;
};

export const toggleUserStatus = async (id, status)=>{
    const res = await axios.put(`/admin/users/${id}/status`, {status});
    return res.data;
};

export const resetUserPassword = async (id, data)=>{
    const res = await axios.put(`/admin/users/${id}/reset-password`, data);
    return res.data;
};


// departments
export const getDepartments = async ()=>{
    const res = await axios.get("/admin/departments");
    return res.data;
}
export const createDepartment = async (data)=>{
    const res = await axios.post("/admin/departments", data);
    return res.data;
}
export const updateDepartment = async (id, data)=>{
    const res = await axios.put(`/admin/departments/${id}`, data);
    return res.data;
};
export const deleteDepartment = async (id)=>{
    const res = await axios.delete(`/admin/departments/${id}`);
    return res.data;
};


// coordinators
export const getCoordinators = async ()=>{
    const res = await axios.get("/admin/coordinators");
    return res.data;
}
export const createCoordinator = async (data)=>{
    const res = await axios.post("/admin/coordinators", data);
    return res.data;
}
export const updateCoordinator = async (id, data)=>{
    const res = await axios.put(`/admin/coordinators/${id}`, data)
    return res.data;
}

// supervisors
export const createSupervisor = async (data)=>{
    const res = await axios.post("/admin/supervisors", data);
    return res.data;
}
export const getSupervisors = async ()=>{
    const res = await axios.get("/admin/supervisors");
    return res.data;
}
export const updateSupervisor = async (id, data)=>{
    const res = await axios.put(`/admin/supervisors/${id}`, data)
    return res.data;
}


// students
export const getStudents = async ()=>{
    const res = await axios.get("/admin/students");
    return res.data;
}


// examiners
export const getExaminers = async ()=>{
    const res = await axios.get("/admin/examiners");
    return res.data;
}
export const createExaminer = async (data)=>{
    const res = await axios.post("/admin/examiners", data);
    return res.data;
}
export const updateExaminer = async (id, data)=>{
    const res = await axios.put(`/admin/examiners/${id}`, data)
    return res.data;
}