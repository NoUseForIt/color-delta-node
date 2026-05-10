/**
 * Color Correction Controllers
 * Business logic for API endpoints
 */

const fs = require('fs').promises;
const path = require('path');

const { parseXML, buildCCT } = require('../services/cctParser.service');
const { deltaE2000 } = require('../services/labCalculations.service');
const {
  computeDerive,
  computeNewRip,
  computeSubstrateAlert
} = require('../services/colorCorrection.service');
const { labToCSS, effectiveScanPrint } = require('../services/labCalculations.service');

/**
 * GET /api/health
 * Health check endpoint
 */
exports.healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    version: '5.0.0',
    timestamp: new Date().toISOString()
  });
};

/**
 * POST /api/parse-cct
 * Parse uploaded CCT file and extract color data
 */
exports.parseCCT = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          details: ['File is required']
        }
      });
    }

    // Read uploaded file
    const xmlContent = await fs.readFile(req.file.path, 'utf-8');

    // Parse CCT
    const { colors, warnings } = parseXML(xmlContent);

    // Add CSS colors for preview and format as bench
    const enhancedColors = colors.map(color => ({
      name: color.name,
      bench: { L: color.L, a: color.a, b: color.b },
      rip: { L: color.L, a: color.a, b: color.b },
      scanPrint: null,
      css: labToCSS(color.L, color.a, color.b)
    }));

    // Clean up uploaded file
    await fs.unlink(req.file.path).catch(() => { });

    res.json({
      success: true,
      data: {
        colors: enhancedColors,
        warnings
      }
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => { });
    }
    next(error);
  }
};

/**
 * POST /api/compute-corrections
 * Compute color corrections and delta E values
 */
exports.computeCorrections = (req, res, next) => {
  try {
    const { colors, deltaWP } = req.body;

    const correctedColors = colors.map(color => {
      // Services Phase 2 utilisent 'nuancier' pas 'bench'
      const colorWithNuancier = {
        ...color,
        nuancier: color.bench
      };

      // Compute effective scan print (with substrate correction if deltaWP provided)
      const scanPrintCorrected = effectiveScanPrint(colorWithNuancier, deltaWP);

      // Compute derive
      const derive = computeDerive(color.bench, scanPrintCorrected);

      // Compute new RIP values
      const newRip = computeNewRip(color.rip, derive);

      // Compute deltaE2000 between bench and scanPrintCorrected
      const deltaE = deltaE2000(
        color.bench.L,
        color.bench.a,
        color.bench.b,
        scanPrintCorrected.L,
        scanPrintCorrected.a,
        scanPrintCorrected.b
      );

      // Compute substrate alert if deltaWP provided
      const substrateAlert = deltaWP
        ? computeSubstrateAlert(deltaWP, colorWithNuancier)
        : null;

      return {
        name: color.name,
        bench: color.bench,
        rip: color.rip,
        scanPrint: color.scanPrint,
        scanPrintCorrected,
        derive,
        newRip,
        deltaE: parseFloat(deltaE.toFixed(2)),
        substrateAlert
      };
    });

    res.json({
      success: true,
      data: {
        colors: correctedColors
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/export-cct
 * Generate corrected CCT file for download
 */
exports.exportCCT = (req, res, next) => {
  try {
    const { sourceXML, colors, deltaWP } = req.body;

    // Services Phase 2 attendent 'nuancier' pas 'bench'
    const colorsWithNuancier = colors.map(c => ({
      ...c,
      nuancier: c.bench
    }));

    // Build corrected CCT XML
    const correctedXML = buildCCT(sourceXML, colorsWithNuancier, deltaWP);

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:-]/g, '')
      .replace(/\..+/, '')
      .replace('T', '_');
    const filename = `corrected_${timestamp}.cct`;

    // Set response headers for file download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(correctedXML);
  } catch (error) {
    next(error);
  }
};
