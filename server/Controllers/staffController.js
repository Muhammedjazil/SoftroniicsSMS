const Staff=require("../Models/staffModel").Staff;
const Role = require("../Models/roleModel").Staff;

const takeroletitle = async (req, res) => {
  try {
    const roles = await Role.find({ isActive: true }).select("role");

    console.log("Fetched Roles:", roles);

    res.status(200).json(roles);

  } catch (error) {
    console.log("Role Fetch Error:", error);

    res.status(500).json({
      message: "Failed to fetch roles",
      error: error.message
    });
  }
};

// const createstaff=async(req,res)=>{
//     try{
//         const {newstaff}=req.body;
//         let nstaff=await Staff.create({
           
//         })
//          res.json("jkdf")
//     }
//     catch(error){
//    res.json({message:"no"})
// }
// }


module.exports = {
  takeroletitle
};