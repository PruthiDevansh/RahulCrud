const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userdb = require('../models/userdata');
const maxAge = 3*24*60*60;
const indexGet = (req, res) => {
  res.send(`
    <h1>Welcome to Our Website</h1>
    <button onclick="location.href='/login'">Login</button>
    <button onclick="location.href='/register'">Register</button>
  `);
};
const regControllerGet = (req, res) => {
  res.render("register");
};
const regControllerPost = async (req, res) => {
  console.log(req.body);
  try {
    const firstName = req.body.firstName;
    const lastName= req.body.lastName;
    const email = req.body.email;
    const password= req.body.password;
    const phoneNumber = req.body.phoneNumber;
    const DOB= req.body.DOB;
    const image = req.file.path;
  
    const newUser  = await userdb({
      firstName:firstName,
      lastName: lastName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      DOB: DOB,
      image: image,
      verification_timestamp: new Date()
    });
    const userData = await newUser.save();
    const text = `<p> hii ${firstName}, please click on the link and <a href="http://127.0.0.1:8000/store/${userData._id}"> for resgiter</a> `;
    const sub = "please click on the link";

    await sendMail(email,text,sub);

    res.status(200).send({
      success: true,
      msg: "Email sent successfully",
      data: userData
    });

  } catch (error) {
    console.error("Error in regController:", error);
    res.status(500).send({ success: false, msg: error.message });
  }
};
const storeData = async(req,res)=>{
  try {
  const text = " hii , you are succesffully registered with us";
  const sub = "user registered";

    const userId = req.params.userId;
    const userData = await userdb.findById({ _id: userId });
    if(userData.is_verified == 1){
      return res.status(400).send({
        status: "failed",
        message: "Already verified"
      });
    }else {
     
      const currentTime = new Date();
      const verificationTime = userData.verification_timestamp; 

      const timeDifference = currentTime - verificationTime;
      const timeLimit = 60*1000; 
      
      if (timeDifference > timeLimit ) {
        await userdb.findByIdAndDelete(userId);
        const text = ` hii ${userData.firstName}, you are not registered with us. please try again`;
        const sub = "user not registered";

        await sendMail(userData.email,text,sub);

        return res.status(400).send({
          status: "failed",
          message: "Verification time expired. User record deleted."
        });
      } 
      const updatedData = await userdb.findByIdAndUpdate({ _id: userId },
        {$set:{
          is_verified: "1"
        }}
        )
  await sendMail(userData.email,text,sub);

    res.status(200).send({
      success: true,
      msg: "Email sent successfully",
      user: updatedData
    });
   }
   } catch (error) {
    console.error("Error in regController:", error);
    res.status(500).send({ success: false, msg: error.message });
  }
}
const loginGet = (req, res) => {
  res.render("login");
};
const loginPost = async (req, res) => {
  try {
      const user = await userdb.findOne({ email: req.body.email });

      if (!user) {
          return res.status(400).json({ error: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

      if (isPasswordValid) {
          const jwtSecretKey = process.env.JWT_SECRET_KEY;
          const token = jwt.sign({ userId: user._id }, jwtSecretKey, { expiresIn: '1h' });
          res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
          res.status(200).json({ user: user._id, token });
      } else {
          res.status(401).json({ error: "Invalid password" });
      }
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};
const userGet = async(req, res) => {
  try {
    const user = await userdb.find({});
    if(user){
     
      res.render('listuser',{ users: user});
    }else{
    
        res.status(400).json('User not found or invalid credentials');
      }
    } catch (err) {
    console.log(err.message);
    res.status(400).json('internal server error');
  }

};
const updateData =async (req,res)=>{
  try{
    const userId = req.params.userId;
    const userData = await userdb.findById({ _id: userId });
    if(!userData){
      res.status(201).send('user not found');
    } else{
      res.status(201).render('editUser',{user:userData});

    }

  } catch(err){
 res.status(501).send(`internal errror :- ${err.message}`);
  }
};
const editData = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId)
    if (!req.body.email && !req.body.firstname && !req.body.lastname && !req.body.phonenumber && !req.body.DOB) {
      return res.status(400).json({ error: 'At least one field (email, firstname, lastname, phonenumber) is required for update' });
    }
    const updateFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      DOB: req.body.DOB,
      phoneNumber: req.body.phoneNumber
    };
    const userData = await userdb.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      return res.status(200).json(userData);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Internal error: ${err.message}` });
  }
};
const delData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await userdb.findById({ _id: userId });

    if (!userData) {
      return res.status(404).send('User not found');
    }

    const imagePath = userData.image;

    if (imagePath) {
      const imagePathToDelete = path.join(__dirname, '..', imagePath);

      const fileExists = await fs.promises.access(imagePathToDelete)
        .then(() => true)
        .catch(() => false);

      if (fileExists) {
        await fs.promises.unlink(imagePathToDelete);
        console.log('Image deleted successfully');
      } else {
        console.log('Image file not found. Path:', imagePathToDelete);
      }
    }

    await userdb.findByIdAndDelete(userId);
    res.status(200).send('User deleted successfully');

  } catch (err) {
    res.status(500).send(`Internal error: ${err.message}`);
  }
};
const sendMail = async (email,text,sub) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });
    const mailOption = {
      from: process.env.email,
      to: email,
      subject: sub,
      html: text
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(info);
        console.log("mail has been sent", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  regControllerPost,
  loginGet,
  regControllerGet,
  userGet,
  indexGet,
  loginPost,
  storeData,
  delData,
  updateData,
  editData
};
