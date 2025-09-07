const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import del modello
const MedicalObject = require('../models/MedicalObject');

async function migrateObjects() {
  try {    
    // Connessione a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('- Connesso a MongoDB Atlas');
    
    // Leggi il file objects.json
    const objectsPath = path.join(__dirname, '../../src/json/objects.json');
    const objectsData = JSON.parse(fs.readFileSync(objectsPath, 'utf8'));
    console.log(objectsData.length + ' oggetti nel file JSON');
    
    const existingCount = await MedicalObject.countDocuments();
    console.log(existingCount + ' oggetti nel database');
    
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Migra ogni oggetto
    for (const objData of objectsData) {
      try {
        // Controlla se l'oggetto esiste già
        const existingObject = await MedicalObject.findOne({ id: objData.id });
        
        if (existingObject) {
          console.log(`⏭️  Oggetto ID ${objData.id} già esistente, saltato`);
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
        console.log('- Migrato oggetto: ' + objData.name + ' (ID: ' + objData.id + ')');
        insertedCount++;
        
      } catch (error) {
        console.log('- Errore migrando oggetto ID ' + objData.id + ': ', error.message);
        errorCount++;
      }
    }
    
    console.log('\n Risultati migrazione:');
    console.log('- Oggetti inseriti: ' + insertedCount);
    console.log('- Oggetti saltati: ' + skippedCount);
    console.log('- Errori: ' + errorCount);
    console.log('- Totale oggetti nel database: ' + await MedicalObject.countDocuments());

  } catch (error) {
    console.log('! Errore durante la migrazione:', error);
  } finally {
    await mongoose.disconnect();
    console.log('! Disconnesso da MongoDB');
    process.exit(0);
  }
}

if (require.main === module) {
  migrateObjects();
}

module.exports = migrateObjects;