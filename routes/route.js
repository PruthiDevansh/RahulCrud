const express = require('express');
const router = express.Router();
const {checkValidation, hi} = require('../middleware/validation');
const authentication = require('../middleware/authentication');
const multer = require("multer");
const {regControllerPost, regControllerGet,loginGet,userGet,indexGet,loginPost,storeData,delData,updateData,editData}= require('../controllers/controller');
const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
      return cb(null, 'uploads/')
    },
    filename:  (req, file, cb)=> {
      return cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
  const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only image format is allowed!'), false); // Reject the file
    }
  };

  const upload = multer({storage, fileFilter: imageFilter });
router.use(express.json());
router.get('/', indexGet);
router.get('/register',regControllerGet);
router.post('/register', hi,checkValidation, upload.single('image'), regControllerPost);
router.get('/login',loginGet);
router.post('/login', loginPost);
router.get('/list',userGet);
router.delete('/del/:userId',delData);
router.get('/update/:userId',updateData);
router.put('/updateput/:userId',checkValidation, editData);
router.get('/store/:userId',storeData);
module.exports=router;
