const rateLimit = require('express-rate-limit');

// General API request limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict login & registration attempts limiter (max 15 registration/login requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    success: false,
    message: 'Server is busy. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Global authentication rate limiter across all users/IPs to prevent server overload
const globalAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 10, // Limit to 10 requests per minute globally for easy testing
  keyGenerator: () => 'global-auth-tracker', // Static key for system-wide aggregation
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Server is busy. Please try again later.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  globalAuthLimiter,
};

