const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {authenticateToken} = require("./userAuth")
//Sign-up
router.post("/sign-up",async(req , res) =>{
    try {
        const{username,email,password,address} = req.body;
       //check username length is more than 3
       if(username.length < 4) {
        return res.status(400).json({message: "Username must be greater than 3 characters"});
       }
       //check username already exists?
       const existingusername = await User.findOne({username:username});
       if(existingusername) {
        return res.status(400).json({message: "Username already exists"});
       }
       //check email already exists?
       const existingemail = await User.findOne({email:email})
       if(existingemail) {
        return res.status(400).json({message: "Email already exists"});
       }
      //check passwords length
      if(password.length <= 5){
        return res.status(400).json({message: "Password must be greater than 5 characters"});
      }
      
      //hashing
      const hashPass = await bcrypt.hash(password,10);
      //create new user
      const newUser = new User({username:username,email:email,password:hashPass,address:address});
      await newUser.save();
      res.status(200).json({message: "User created successfully"});
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}); 

//Sign-in
router.post("/sign-in",async(req , res) =>{
    try {
        const {username,password} = req.body;
        
        const existingUser = await User.findOne({ username });
        if(!existingUser)
        {
            return res.status(400).json({message: "Invalid credentials"});
        }
       await bcrypt.compare(password,existingUser.password,(err,data) => {
        if(data){
          const authClaims = [
            {name:existingUser.username},
            {role:existingUser.role},
          ];
          const token = jwt.sign({ authClaims },"bookStore123",{
            expiresIn:"30d",
          });
            res.status(200).json({id: existingUser._id,role: existingUser.role,token : token});
        }
        else{
            res.status(400).json({message: "Invalid credentials"});
        }
       });
    } catch (error) {
        res.status(500).json({message: "Internal server error"});
    }
}); 

//get-user-information
router.get("/get-user-information",authenticateToken,async(req,res) => {
  try{
    const { id } = req.headers;
    if (!id) {
      return res.status(400).json({ message: "User ID header is required" });
    }
    const data = await User.findById(id).select("-password");
    if (!data) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(data);
  }
  catch(error){
    res.status(500).json({message: "Internal server error"});
  }
});

//update address
router.put("/update-address",authenticateToken,async(req,res) => {
try{
  const { id } = req.headers;
  const { address } = req.body;
  await User.findByIdAndUpdate(id ,{address:address});
  res.status(200).json({message: "Address updated successfully"});
  } catch(error) {
     res.status(500).json({message: "Internal server error"});
  }
});

module.exports = router;