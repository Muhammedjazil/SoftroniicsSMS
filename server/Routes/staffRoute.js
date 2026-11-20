const express=require("express");
const router=express.Router();
const {takeroletitle,createstaff}=require("../Controllers/staffController")

router.get("/",takeroletitle)

// router.post("/",createstaff)

module.exports=router