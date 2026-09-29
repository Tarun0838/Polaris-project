const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri) {
      try {
        console.log(`[POLARIS-DB] Attempting to connect to configured MongoDB URI...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 3000
        });
        console.log(`[POLARIS-DB] Connected to MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn(`[POLARIS-DB] Configured MONGO_URI failed: ${err.message}. Initializing embedded in-memory MongoDB fallback...`);
      }
    }

    // Fallback: Start MongoDB Memory Server
    console.log(`[POLARIS-DB] Starting embedded MongoDB instance for seamless standalone execution...`);
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'polaris'
      }
    });
    const memoryUri = mongodInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`[POLARIS-DB] Embedded MongoDB running at: ${memoryUri}`);
    return conn;
  } catch (error) {
    console.error(`[POLARIS-DB] Critical database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
