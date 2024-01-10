const { check, validationResult } = require('express-validator');
const dataValidator = [
  check('firstName')
  .isLength({ min: 3, max: 20 }).withMessage('First name must be between 3 and 20 characters long')
  .matches(/^[a-zA-Z]+$/).withMessage('Only characters are allowed in the first name'),
  check('lastName')
  .isLength({ min: 3, max: 20 }).withMessage('Last name must be between 3 and 20 characters long')
  .matches(/^[a-zA-Z]+$/).withMessage('Only characters are allowed in the last name'),
  check('email')
  .isEmail().withMessage('Invalid email address')
  .matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/).withMessage('Invalid email address'),
  check('password')
  .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
    check('phoneNumber')
    .isMobilePhone('any').withMessage('Invalid phone number'),
    check('DOB')
    .isDate()
    .withMessage('Invalid date format for Date of Birth')
    .custom((value) => {
      const dob = new Date(value);
      const currentDate = new Date();
      const minDate = new Date(currentDate.getFullYear() - 100, currentDate.getMonth(), currentDate.getDate());
      const maxDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

      if (dob < minDate || dob > maxDate) {
        throw new Error('Date of Birth must be between 1 and 100 years ago');
      }

      return true;
    })
];
const hi = (req,res,next)=>{
  console.log(req.body);

  next();
}
const checkValidation=async (req,res,next)=>{
  console.log(req.body);
await Promise.all(dataValidator.map(validation => validation.run(req)));  
const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
next();
}
module.exports = { checkValidation, hi };
