const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && mongoUri.trim().length > 0) {
      try {
        console.log(`[VYOM-DB] Attempting to connect to configured MongoDB URI...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000
        });
        console.log(`[VYOM-DB] Connected to MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`[VYOM-DB] Configured MONGO_URI failed: ${err.message}. Initializing embedded in-memory MongoDB fallback...`);
      }
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Fallback: Start MongoDB Memory Server
    if (!mongodInstance || mongodInstance.state !== 'running') {
      console.log(`[VYOM-DB] Starting embedded MongoDB instance for seamless standalone execution...`);
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: 'vyom'
        },
        spawn: {
          timeout: 60000
        }
      });
    }

    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log(`[VYOM-DB] Embedded MongoDB running at: ${memoryUri}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[VYOM-DB] MongoDB connection disconnected.');
    });

    return conn;
  } catch (error) {
    console.error(`[VYOM-DB] Critical database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
  } catch (err) {
    console.warn('[VYOM-DB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
