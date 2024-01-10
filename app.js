const express = require('express');
const dotenv = require('dotenv').config();
// const { validationResult } = require('express-validator');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use('/uploads', express.static('uploads'));
const route = require('./routes/route');
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }))
app.set('view engine','ejs');
app.use(route);
app.use(cors());
app.use(express.json());
app.listen(process.env.PORT,()=>{
    console.log(`App is listen at ${process.env.PORT}`)
})