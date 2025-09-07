const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const MedicalObject = require('./models/MedicalObject');

app.use(cors());
app.use(express.json());

// Connessione a MongoDB 
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log(' - Connesso a MongoDB'))
.catch(err => console.log(' - Errore connessione MongoDB:', err));

// ROUTES

// GET - Ottenere tutti gli oggetti
app.get('/api/objects', async (req, res) => {
  try {
    const { room_id, status } = req.query;
    let query = {};
    
    if (room_id) query.room_id = parseInt(room_id);
    if (status) query.status = status;
    else query.status = 'active';
    
    const objects = await MedicalObject.find(query).sort({ id: 1 });
    
    const formattedObjects = objects.map(obj => ({
      id: obj.id,
      name: obj.name,
      picture: obj.picture,
      room_id: obj.room_id,
      notes: obj.notes,
      blockchain_status: obj.blockchain_status,
      last_transaction: obj.last_transaction,
      last_user: obj.last_user,
      timestamp: obj.updatedAt
    }));
    
    res.json(formattedObjects);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nel recuperare gli oggetti',
      error: error.message
    });
  }
});

// // GET - Ottenere un oggetto specifico per ID
// app.get('/api/objects/:id', async (req, res) => {
//   try {
//     const object = await MedicalObject.findOne({ 
//       id: parseInt(req.params.id),
//       status: 'active'
//     });
    
//     if (!object) {
//       return res.status(404).json({
//         success: false,
//         message: 'Oggetto non trovato'
//       });
//     }
    
//     res.json({
//       success: true,
//       data: {
//         id: object.id,
//         name: object.name,
//         picture: object.picture,
//         room_id: object.room_id,
//         notes: object.notes,
//         blockchain_status: object.blockchain_status,
//         last_transaction: object.last_transaction,
//         last_user: object.last_user
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Errore nel recuperare l\'oggetto',
//       error: error.message
//     });
//   }
// });

// POST - Creare oggetto
app.post('/api/objects', async (req, res) => {
  try {
    const { id, name, picture, room_id, notes } = req.body;
    console.log(req.body)
    
    // Validazione
    if (!name || room_id === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nome e Room ID sono obbligatori'
      });
    }
    
    // Se non viene fornito un ID, genera il prossimo disponibile
    let objectId = id;
    if (objectId === undefined || objectId === null) {
      const lastObject = await MedicalObject.findOne().sort({ id: -1 });
      objectId = lastObject ? lastObject.id + 1 : 0;
    }
    
    // Controlla se l'ID è già in uso
    const existingObject = await MedicalObject.findOne({ id: objectId });
    if (existingObject) {
      return res.status(400).json({
        success: false,
        message: `Oggetto con ID ${objectId} già esistente`
      });
    }
    
    const newObject = new MedicalObject({
      id: parseInt(objectId),
      name: name.trim(),
      picture: picture || 'https://placehold.co/140x140',
      room_id: parseInt(room_id),
      notes: notes || '',
      status: 'active',
      blockchain_status: 'clean'
    });

    const savedObject = await newObject.save();
    
    res.status(201).json({
      success: true,
      message: 'Oggetto creato con successo',
      data: {
        id: savedObject.id,
        name: savedObject.name,
        picture: savedObject.picture,
        room_id: savedObject.room_id,
        notes: savedObject.notes,
        blockchain_status: savedObject.blockchain_status
      }
    });
    
  } catch (error) {
    console.error('Errore POST /api/objects:', error);
    res.status(400).json({
      success: false,
      message: 'Errore nella creazione dell\'oggetto',
      error: error.message
    });
  }
});

// PUT - Aggiornare un oggetto esistente
// app.put('/api/objects/:id', async (req, res) => {
//   try {
//     const { name, picture, room_id, notes } = req.body;
    
//     const updatedObject = await MedicalObject.findOneAndUpdate(
//       { id: parseInt(req.params.id), status: 'active' },
//       { 
//         name,
//         picture,
//         room_id: parseInt(room_id),
//         notes
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedObject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Oggetto non trovato'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Oggetto aggiornato con successo',
//       data: {
//         id: updatedObject.id,
//         name: updatedObject.name,
//         picture: updatedObject.picture,
//         room_id: updatedObject.room_id,
//         notes: updatedObject.notes
//       }
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: 'Errore nell\'aggiornamento dell\'oggetto',
//       error: error.message
//     });
//   }
// });

// DELETE - Eliminare un oggetto (soft delete)
// app.delete('/api/objects/:id', async (req, res) => {
//   try {
//     const deletedObject = await MedicalObject.findOneAndUpdate(
//       { id: parseInt(req.params.id), status: 'active' },
//       { status: 'inactive' },
//       { new: true }
//     );
    
//     if (!deletedObject) {
//       return res.status(404).json({
//         success: false,
//         message: 'Oggetto non trovato'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Oggetto eliminato con successo',
//       data: { id: deletedObject.id }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Errore nell\'eliminazione dell\'oggetto',
//       error: error.message
//     });
//   }
// });

// PUT - Aggiornare stato blockchain di un oggetto
app.put('/api/objects/:id/blockchain-status', async (req, res) => {
  try {
    const { status, txHash, userAddress } = req.body;
    
    if (!['clean', 'used', 'unknown'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve essere: clean, used, o unknown'
      });
    }
    
    const object = await MedicalObject.findOne({ 
      id: parseInt(req.params.id),
      status: 'active'
    });
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'Oggetto non trovato'
      });
    }
    
    await object.updateBlockchainStatus(status, txHash, userAddress);
    
    res.json({
      success: true,
      message: 'Status blockchain aggiornato',
      data: {
        id: object.id,
        blockchain_status: object.blockchain_status,
        last_transaction: object.last_transaction,
        last_user: object.last_user
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore nell\'aggiornamento dello status',
      error: error.message
    });
  }
});

// // GET - Ottenere oggetti per stanza
// app.get('/api/rooms/:room_id/objects', async (req, res) => {
//   try {
//     const objects = await MedicalObject.findByRoomId(parseInt(req.params.room_id));
    
//     const formattedObjects = objects.map(obj => ({
//       id: obj.id,
//       name: obj.name,
//       picture: obj.picture,
//       room_id: obj.room_id,
//       notes: obj.notes,
//       blockchain_status: obj.blockchain_status
//     }));
    
//     res.json(formattedObjects);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Errore nel recuperare oggetti della stanza',
//       error: error.message
//     });
//   }
// });

// // GET - Esportare tutti i dati (backup compatibile con objects.json)
// app.get('/api/export', async (req, res) => {
//   try {
//     const objects = await MedicalObject.findActive();
    
//     const exportData = objects.map(obj => ({
//       id: obj.id,
//       name: obj.name,
//       picture: obj.picture,
//       room_id: obj.room_id,
//       notes: obj.notes
//     }));
    
//     res.setHeader('Content-Type', 'application/json');
//     res.setHeader('Content-Disposition', 'attachment; filename="objects-backup.json"');
//     res.json(exportData);
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Errore nell\'esportazione dei dati',
//       error: error.message
//     });
//   }
// });

// GET - Health check e info API
// app.get('/', (req, res) => {
//   res.json({
//     message: ' Medical-Chain Backend API',
//     version: '1.0.0',
//     status: 'active',
//     endpoints: {
//       'GET /api/objects': 'Ottieni tutti gli oggetti medici',
//       'GET /api/objects/:id': 'Ottieni oggetto specifico',
//       'POST /api/objects': 'Crea nuovo oggetto',
//       'PUT /api/objects/:id': 'Aggiorna oggetto',
//       'DELETE /api/objects/:id': 'Elimina oggetto',
//       'PUT /api/objects/:id/blockchain-status': 'Aggiorna status blockchain',
//       'GET /api/rooms/:room_id/objects': 'Oggetti per stanza',
//       'GET /api/export': 'Esporta tutti i dati'
//     }
//   });
// });

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Errore server:', error);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('- Medical-Chain Backend avviato su porta ' + PORT);
});