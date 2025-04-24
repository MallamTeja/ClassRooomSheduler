const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

module.exports = (app) => {
  // Apply security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "unpkg.com", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.tailwindcss.com", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:"]
      }
    }
  }));

  // Rate limiting
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  }));

  // Additional protection for login route
  app.use('/api/login', rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false
  }));
};
