/**
 * API Routes Configuration
 * RESTful endpoints for color correction operations
 */

const express = require('express');
const router = express.Router();

const colorController = require('../controllers/color.controller');
const { uploadCCT } = require('../middleware/upload.middleware');
const { validate } = require('../middleware/validate.middleware');
const { schemas } = require('../middleware/validate.middleware');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', colorController.healthCheck);

/**
 * POST /api/parse-cct
 * Parse uploaded .cct file
 * @body {file} file - CCT file (multipart/form-data)
 */
router.post(
  '/parse-cct',
  uploadCCT,
  colorController.parseCCT
);

/**
 * POST /api/compute-corrections
 * Compute color corrections from Lab data
 * @body {Array} colors - Array of color objects
 * @body {Object} deltaWP - Optional white point delta
 */
router.post(
  '/compute-corrections',
  validate(schemas.computeCorrections),
  colorController.computeCorrections
);

/**
 * POST /api/export-cct
 * Export corrected CCT file
 * @body {string} sourceXML - Original CCT XML content
 * @body {Array} colors - Array of corrected colors
 * @body {Object} deltaWP - Optional white point delta
 */
router.post(
  '/export-cct',
  validate(schemas.exportCCT),
  colorController.exportCCT
);

module.exports = router;
