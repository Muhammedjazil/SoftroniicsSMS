const express=require("express");
const router=express.Router();
const {createnewrole,takeallrole,updaterole,roleremove,changestatus}=require("../Controllers/roleController")

router.post("/",createnewrole)

router.get("/",takeallrole)

router.put("/:id/",updaterole)

router.delete("/:id",roleremove)

router.put("/status/:id",changestatus)

module.exports=router