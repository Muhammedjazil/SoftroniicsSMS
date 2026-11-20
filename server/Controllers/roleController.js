const { Staff: Role } = require("../Models/roleModel"); //we import staff model and give Role as a name

const createnewrole = async (req, res) => {
    try {
        const { role, description, permissions } = req.body;

        if (!role || !description) {
            return res.status(400).json({
                message: "Role and description are required!"
            });
        }

        const admin = await Role.create({
            role: role.trim(),
            description: description.trim(),
            permissions
        });

        return res.status(201).json({
            message: "Role created successfully",
            data: admin
        });

    } catch (error) {
        console.log("ERROR CODE:", error.code);
        console.log("ERROR MESSAGE:", error.message);
        console.log("DUPLICATE FIELD:", error.keyPattern);
        console.log("DUPLICATE VALUE:", error.keyValue);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "This role already exists",
                field: error.keyPattern,
                value: error.keyValue
            });
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

const takeallrole=async(req,res)=>{
  try{
    let allrole=await Role.find();
    res.json(allrole)
  }
  catch(error){
    res.json({message:"no role found!"})
  }
}

const updaterole=async(req,res)=>{
  try{
    const {id}=req.params;
    const {role, description, permissions }=req.body;
    let updatedrole=await Role.findByIdAndUpdate(id,
      {
        role,
        description,
        permissions
      }
    )

    res.json("Role updatedsuccessfully!")
    
  }
  catch(error){
    res.json({message:"role not updated!"})
  }
}

const roleremove=async(req,res)=>{
  try{
    const {id}=req.params;
    let remove=await Role.findByIdAndDelete(id)
    res.json("role removed successfully!")
  }
  catch(error){
    res.json({message:"role not removed!"})
  }
}

const changestatus=async(req,res)=>{
  try{
    const {id}=req.params;
    const role=await Role.findById(id)
    role.isActive=!role.isActive
    await role.save()
    res.json("status updeted")
  }
  catch(error){
    res.json({message:"ststus not changed!"})
  }
}

module.exports = {
    createnewrole,
    takeallrole,
    updaterole,
    roleremove,
    changestatus
};