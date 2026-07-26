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

const googleAuthSchema = [
  body('idToken')
    .notEmpty().withMessage('Google ID token is required')
    .isString().withMessage('Google ID token must be a string')
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
  googleAuthSchema,
  adminLoginSchema,
};
