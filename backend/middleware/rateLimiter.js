const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    // Key by user id if authenticated, else by IP (IPv6-safe helper)
    if (req.user && req.user.id) return `user:${req.user.id}`;
    return ipKeyGenerator(req, res);
  },
  message: { error: 'AI rate limit exceeded. Max 20 requests per hour. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
