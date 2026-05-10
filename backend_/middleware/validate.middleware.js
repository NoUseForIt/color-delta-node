/**
 * Request Validation Middleware
 * Joi schema validation for API endpoints
 */

const Joi = require('joi');

/**
 * Lab color object schema
 */
const labSchema = Joi.object({
  L: Joi.number().min(0).max(100).required(),
  a: Joi.number().min(-127).max(127).required(),
  b: Joi.number().min(-127).max(127).required()
});

/**
 * Delta white point schema
 */
const deltaWPSchema = Joi.object({
  dL: Joi.number().required(),
  da: Joi.number().required(),
  db: Joi.number().required()
});

/**
 * Color object schema for compute corrections
 */
const colorSchema = Joi.object({
  name: Joi.string().required(),
  bench: labSchema.required(),
  rip: labSchema.required(),
  scanPrint: labSchema.allow(null).optional()
});

/**
 * Color object schema for export
 */
const exportColorSchema = Joi.object({
  name: Joi.string().required(),
  bench: labSchema.required(),
  rip: labSchema.required(),
  scanPrint: labSchema.optional(),
  newRip: labSchema.optional()
});

/**
 * Validation schemas for each endpoint
 */
exports.schemas = {
  /**
   * POST /api/compute-corrections
   */
  computeCorrections: Joi.object({
    colors: Joi.array().items(colorSchema).min(1).required(),
    deltaWP: deltaWPSchema.allow(null).optional()
  }),

  /**
   * POST /api/export-cct
   */
  exportCCT: Joi.object({
    sourceXML: Joi.string().min(1).required(),
    colors: Joi.array().items(exportColorSchema).min(1).required(),
    deltaWP: deltaWPSchema.allow(null).optional()
  })
};

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 */
exports.validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details
        }
      });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};
