const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/expeditions', require('./routes/expeditionRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/datasets', require('./routes/datasetRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/publications', require('./routes/publicationRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'POLARIS — Polar Knowledge & Outreach Intelligence System',
    ministry: 'Ministry of Earth Sciences (MoES)',
    theme: 'Smart Education (SIH26063)',
    timestamp: new Date().toISOString()
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5055;

// Start server after ensuring DB connection & initial seed if empty
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const Station = require('./models/Station');
    const stationCount = await Station.countDocuments();
    if (stationCount === 0) {
      console.log('[POLARIS-SERVER] No records detected. Performing automated initial seed...');
      const seedData = require('./seed/seedDatabase');
      await seedData(false);
    }

    const server = app.listen(PORT, () => {
      console.log(`===========================================================`);
      console.log(`🚀 POLARIS Backend Server running on port ${PORT}`);
      console.log(`🌐 API Endpoint: http://localhost:${PORT}/api`);
      console.log(`===========================================================`);
    });

    return server;
  } catch (error) {
    console.error(`[POLARIS-SERVER] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
