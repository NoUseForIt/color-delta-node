/**
 * Global Error Handler Middleware
 * Centralized error handling for Express app
 */

/**
 * Error handler middleware
 * Must be registered last in middleware chain
 */
exports.errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'File too large',
        details: ['Maximum file size is 10MB']
      }
    });
  }

  if (err.message === 'Only .cct files are allowed') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid file type',
        details: ['Only .cct files are accepted']
      }
    });
  }

  // XML parsing errors
  if (err.message && err.message.includes('XML')) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Invalid CCT file',
        details: ['The file could not be parsed as valid XML']
      }
    });
  }

  // Default internal server error
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? [err.message] : []
    }
  });
};
