const jwt=require('jsonwebtoken');
const Register=require('../model/registers');

const auth=async(req,res,next)=>{
 
    try{
//getting cookies
const token=req.cookies.jwt;
//verification of cookies
const verifyUser=jwt.verify(token,process.env.SECRET_KEY);
console.log(verifyUser);

const user=await Register.findOne({_id:verifyUser._id});
req.token=token;
req.user=user;

//next is used to comeout from the function
  next();
    }
    catch(err){
        res.status(401).send(err);
    }
    
};
module.exports=auth;

