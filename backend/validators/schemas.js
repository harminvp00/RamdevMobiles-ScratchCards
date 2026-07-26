const { body, validationResult } = require('express-validator');

// Helper to run validations and return response if failed
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg })),
    });
  };
};

const otpRequestSchema = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),
];

const otpVerifySchema = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .trim(),
];

const registerSchema = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail()
    .trim(),
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number')
    .trim(),
  body('city')
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters')
    .trim()
    .escape(),
  body('otpToken')
    .notEmpty().withMessage('OTP verification session is missing or expired')
    .trim(),
];

const adminLoginSchema = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .escape(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = {
  validate,
  otpRequestSchema,
  otpVerifySchema,
  registerSchema,
  adminLoginSchema,
};
