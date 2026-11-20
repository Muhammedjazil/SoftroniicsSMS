import React from 'react'

import useAxiosPrivate from "../../hooks/useAxiosPrivate";                    //codes for admin pages

const AdminService = () => {

    const axiosPrivate = useAxiosPrivate()

    const newrolecreate=async(roleData)=>{
        let response=await axiosPrivate.post("Rolemanagement",roleData)
        return response.data;
    }

    const takeroles = async () => {
        const response = await axiosPrivate.get("/Rolemanagement");
        return response.data;
    };

    const Updaterole=async(id,roleData)=>{
        let response=await axiosPrivate.put(`/Rolemanagement/${id}`,roleData)
        return response.data;
    }

    const roleremove=async(id)=>{
        let response=await axiosPrivate.delete(`/Rolemanagement/${id}`)
        return response.data;
    }

    
    const changestatus=async(id)=>{
        let response=await axiosPrivate.put(`/Rolemanagement/status/${id}`)
        return response.data;
    }

    const takeroletitle=async()=>{
        let response=await axiosPrivate.get("/staffmanagement")
        return response.data;
    }

    // const createnewstaff=async(newstaff)=>{
    //     let response=await axiosPrivate.post("/staffmanagement",newstaff)
    //     return response.data;
    // }

 //========takebranch=============//
 const takebranch=async()=>{
    let response=await axiosPrivate.get("/branchmanagement")
    return response.data;
 }

 const taketiming=async()=>{
    let response=await axiosPrivate.get("/timemanagement")
    return response.data;

 }

    return{
      newrolecreate,
      takeroles,
      Updaterole,
      roleremove,
      changestatus,
      takeroletitle,
      takebranch,
      taketiming
    //   createnewstaff
    }
}
export default AdminService