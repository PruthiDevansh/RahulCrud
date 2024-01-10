const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
mongoose.connect(process.env.MONGOOSE_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
  const userSchema = new mongoose.Schema({
    firstName:{
      type: String,
      // required: true
    },
    lastName:{
      type: String,
      required: true 
    },
    email: {
      type: String, 
      required: true,
      unique: true,
      lowercase: true,
      // validate: [isEmail, "please enter a valid email"],
    },
    password: {
      type: String, 
      required: true,
      minlength: [6, "minimum password length is 6 characters"], 
    },
    DOB:{
      type: String,
    },
    phoneNumber:{
      type: String,
      required: true,
    },
    image:{
      // required: true,
      type: String
    },
    is_verified:{
      type: String,
      default: 0
    },
    verification_timestamp: {
      type: Date,
      default: null
    }
   
  });
  userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
  })
  const User = mongoose.model("User", userSchema);
  module.exports = User;
  