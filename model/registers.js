const mongoose=require("mongoose");
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken"); 
//schema defining
const empolyeesSchema= new mongoose.Schema({
    firstname:{
        type:String,
        reqired:true,
        minlength:2,

    },
    lastname:{
        type:String,
        reqired:true,
        minlength:2,

    },
    gender:{
        type:String,
        reqired:true,
        

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        min:10,
    
        required:true,
        unique:true,
    },
    age:{
        type:Number,
        required:true,
    
    },
    password:{
        type:String,
        required:true,
    
    },
    confirmpassword:{
        type:String,
        required:true,
    
    },
    tokens:[{
        token:{
            type:String,
            required:true,
        }
    }]
    
});
//generating token
empolyeesSchema.methods.generateAuthToken=async function(){
  try{
    
 const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
 //token value assigining
 this.tokens=this.tokens.concat({token:token});
 await this.save();
 
 return token;
  }
  catch(err){
   res.send("error has occured");

  }
}
//password hashing
empolyeesSchema.pre("save",async function(next){
if(this.isModified("password")){

   // console.log(this.password);
this.password=await bcrypt.hash(this.password,10);
this.confirmpassword=await bcrypt.hash(this.confirmpassword,10);
  //  console.log(this.password);
   
}
next();
});


//creating new collection
const Reigster= new mongoose.model("Register",empolyeesSchema);

//exporting the collection
module.exports=Reigster;