const xss = require('xss');
const { body, validationResult } = require('express-validator');

module.exports = {
  sanitizeHTML: (fields) => (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field]) req.body[field] = xss(req.body[field]);
    });
    next();
  },

  preventNoSQLInjection: () => (req, res, next) => {
    const keys = ['$where', 'mapReduce', '$accumulator', '$function'];
    keys.forEach(key => {
      if (req.query[key]) delete req.query[key];
      if (req.body[key]) delete req.body[key];
    });
    next();
  },

  validateMongoIDs: (params) => (req, res, next) => {
    const errors = [];
    params.forEach(param => {
      if (!mongoose.Types.ObjectId.isValid(req.params[param])) {
        errors.push(`Invalid ${param} ID format`);
      }
    });
    if (errors.length) return res.status(400).json({ errors });
    next();
  }
};