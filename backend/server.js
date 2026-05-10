const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes/api.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares de sécurité et parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api', apiRoutes);

// Error handler global (DOIT être en dernier)
app.use(errorMiddleware.errorHandler);

// Démarrer le serveur
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = { app, server };
