require("dotenv").config();   //for secret key
const express = require("express");
const app = express();
const bcrypt=require('bcryptjs');
const path=require("path");
const hbs=require("hbs");
const cookieParser=require('cookie-parser'); //for accessing the token
const Register=require("./model/registers");
const jwt = require("jsonwebtoken");
const auth=require("./middleware/auth");
const { clear } = require("console");
const port = process.env.PORT || 4000;


require("./db/connection")
const templatepath=path.join(__dirname,"./templates/views");
const partialpath=path.join(__dirname,"./templates/partials");
const staticpath=path.join(__dirname,'./public');

//to get cookie value
app.use(cookieParser());
//jason file is coming
app.use(express.json());
//form ke under ke value lene ke liye
app.use(express.urlencoded({extended:false}))
//for static path
app.use(express.static(staticpath));
//for dyanamic file
app.set("view engine","hbs");
app.set("views",templatepath);
hbs.registerPartials(partialpath);
app.get("/",(req,res)=>{
    res.render("index");
})
app.get("/register",(req,res)=>{
    res.render("register");
})

//for post
app.post('/register', async(req, res) => {

    try{
    const password=req.body.password;
    const cpassword=req.body.confirmpassword;
    //if both password is same then save it
    if(password===cpassword)
    {
        //data is coming from from
     const registerEmpolyee= new Register({
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        gender:req.body.gender,
        phone:req.body.phone,
        age:req.body.age,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword
     });
    //generating token
    const token= await registerEmpolyee.generateAuthToken();

    //this function is used to set the cookie name to value
    //storing on cookie
res.cookie("jwt",token,{
expires:new Date(Date.now()+300000),
httpOnly:true
    });    
    

     //data is stored in database
     const registered =await registerEmpolyee.save();
     res.status(201).render("index");
    }else{
        res.send("pasword is not matching");
    }
    
    }
    catch(err){
        res.status(400).send(err);
    }  ;
   
});        //auth is middleware for confirmation
        //it can be used in any pages
app.get("/secret",auth,(req,res)=>{
    //secret page par jane par show karega
    console.log(` the cookie value is ${req.cookies.jwt}`);
    res.render("secret");
})

app.get("/logout",auth,async(req,res)=>{
   try{
     //logout par click karne se cookies delete ho jayega so, we cannot access secret page
    res.clearCookie("jwt");
    await req.user.save();
    res.render('login');
   console.log('logout successfully');

   }
   catch(err){
    res.status(500).send(err);
}  
   

   
})
//loginpage
app.get("/login",(req,res)=>{
    res.render("login");
})
//login check
app.post("/login",async(req,res)=>{
   
    try{
        //entered email getting
      const email=req.body.email;
      const password=req.body.password;
      //findding with  email
    const userdata=await Register.findOne({email:email});
    
     //matching password
     isMatch= await bcrypt.compare(password,userdata.password);

      //generating token
      const token= await userdata.generateAuthToken();
      //storing on cookies
      res.cookie("jwt",token,{
        expires:new Date(Date.now()+900000),
        httpOnly:true
            });

    

     if(isMatch){
         res.status(201).render("index");
     }
     else{
         res.send("invalid password");
     }
    


    }
    catch(err){
        res.status(400).send("invalid email or password")
    }
})


//bcrypt for  password security
// const  bcrypt=require("bcryptjs");

// const securepassword=async(password)=>{

//                                             //for ten round
// const passwordHash=await bcrypt.hash(password,10)
// console.log(passwordHash);
// //comparing the passsword
// const passwordMatch =await bcrypt.compare("ramji",passwordHash);
// console.log(passwordMatch);
// }

//           //entered password
// securepassword('sdsd@cd');


//jsonwebtoken for authentication
// const jwt=require("jsonwebtoken");                                    
//  const createToken=async()=>{                                 //secret key of minimum 32 char.required
//  const token = await jwt.sign( {_id:'63ce15a97bc62fb260af904f'} ,'mynameisravikumarjasdsdnjdnsjdnsd',{expiresIn:"4 seconds"} );
//  console.log(token);
//  //verification
//  const userverification=await jwt.verify(token,'mynameisravikumarjasdsdnjdnsjdnsd');
//  console.log(userverification)
// }
// createToken();



app.listen(port, () => {
    console.log(`server is running at port ${port} `);
});
