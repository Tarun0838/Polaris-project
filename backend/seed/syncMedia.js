require('dotenv').config();
const mongoose = require('mongoose');
const Media = require('../models/Media');
const Station = require('../models/Station');
const PolarAsset = require('../models/PolarAsset');

const mediaData = require('./media.json');
const stationsData = require('./stations.json');
const polarAssetsData = require('./polarAssets.json');

async function syncAll() {
  try {
    const uri = process.env.MONGO_URI;
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to DB:', mongoose.connection.name);

    // 1. Sync Media
    let mediaUpserted = 0;
    for (const item of mediaData) {
      await Media.updateOne(
        { mediaId: item.mediaId },
        { $set: item },
        { upsert: true }
      );
      mediaUpserted++;
    }
    const mediaCount = await Media.countDocuments();
    console.log(`Synced ${mediaUpserted} Media items. Total in DB: ${mediaCount}`);

    // 2. Sync Stations
    let stationUpserted = 0;
    for (const item of stationsData) {
      await Station.updateOne(
        { stationId: item.stationId },
        { $set: item },
        { upsert: true }
      );
      stationUpserted++;
    }
    const stationCount = await Station.countDocuments();
    console.log(`Synced ${stationUpserted} Stations. Total in DB: ${stationCount}`);

    // 3. Sync PolarAssets
    let assetUpserted = 0;
    for (const item of polarAssetsData) {
      await PolarAsset.updateOne(
        { title: item.title },
        { $set: item },
        { upsert: true }
      );
      assetUpserted++;
    }
    const assetCount = await PolarAsset.countDocuments();
    console.log(`Synced ${assetUpserted} PolarAssets. Total in DB: ${assetCount}`);

    console.log('All authentic photos synced successfully to MongoDB Atlas!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
}

syncAll();

