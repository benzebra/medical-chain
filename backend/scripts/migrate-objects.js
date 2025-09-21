const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MedicalObject = require('../models/MedicalObject');

async function migrateObjects() {
  try {    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('- Connesso a MongoDB');
    
    const objectsPath = path.join(__dirname, '../../src/json/objects.json');
    const objectsData = JSON.parse(fs.readFileSync(objectsPath, 'utf8'));
    console.log(objectsData.length + ' objs in the file');
    
    const existingCount = await MedicalObject.countDocuments();
    console.log(existingCount + ' objs in the DB');

    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const objData of objectsData) {
      try {
        const existingObject = await MedicalObject.findOne({ id: objData.id });
        
        if (existingObject) {
          console.log(`error: obj ID ${objData.id} already exists`);
          skippedCount++;
          continue;
        }
        
        // Crea nuovo oggetto
        const newObject = new MedicalObject({
          id: objData.id,
          name: objData.name,
          picture: objData.picture,
          room_id: objData.room_id,
          notes: objData.notes || '',
          status: 'active',
          blockchain_status: 'unknown'
        });
        
        await newObject.save();
        console.log('- new obj created: ' + objData.name + ' (ID: ' + objData.id + ')');
        insertedCount++;
        
      } catch (error) {
        console.log('- error migrating obj ID ' + objData.id + ': ', error.message);
        errorCount++;
      }
    }

    console.log('\n Migration results:');
    console.log('-> objs inserted: ' + insertedCount);
    console.log('-> objs skipped: ' + skippedCount);
    console.log('-> errors: ' + errorCount);

  } catch (error) {
    console.log('- error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('- disconnected from MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  migrateObjects();
}

module.exports = migrateObjects;