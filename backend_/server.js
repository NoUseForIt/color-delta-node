/**
 * Color Delta V5 - Express Server
 * Main server configuration and startup
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const apiRoutes = require('./routes/api.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Global error handler (must be last)
app.use(errorHandler);

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Color Delta V5 API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;