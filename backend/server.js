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
.then(() => console.log('- Connesso a MongoDB'))
.catch(err => console.log('Errore connessione MongoDB:', err));

// ROUTES

// GET - Obtain OBJs
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
      message: 'error retrieving objects',
      error: error.message
    });
  }
});

// POST - Create OBJ
app.post('/api/objects', async (req, res) => {
  try {
    const { id, name, picture, room_id, notes } = req.body;
    console.log(req.body)
    
    if (!name || room_id === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name and room_id are required'
      });
    }
    
    let objectId = id;
    if (objectId === undefined || objectId === null) {
      const lastObject = await MedicalObject.findOne().sort({ id: -1 });
      objectId = lastObject ? lastObject.id + 1 : 0;
    }
    
    const existingObject = await MedicalObject.findOne({ id: objectId });
    if (existingObject) {
      return res.status(400).json({
        success: false,
        message: `Object with ID ${objectId} already exists`
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
      message: 'obj created',
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
    console.error('error on POST /api/objects:', error);
    res.status(400).json({
      success: false,
      message: 'obj creation error',
      error: error.message
    });
  }
});

// PUT - Aggiornare stato blockchain di un oggetto
app.put('/api/objects/:id/blockchain-status', async (req, res) => {
  try {
    const { status, txHash, userAddress } = req.body;
    
    if (!['clean', 'used', 'unknown'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'invalid status'
      });
    }
    
    const object = await MedicalObject.findOne({ 
      id: parseInt(req.params.id),
      status: 'active'
    });
    
    if (!object) {
      return res.status(404).json({
        success: false,
        message: 'obj not found'
      });
    }
    
    await object.updateBlockchainStatus(status, txHash, userAddress);
    
    res.json({
      success: true,
      message: 'blockchain status updated',
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
      message: 'blockchain status update failed',
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

// Error handling 
app.use((error, req, res, next) => {
  console.error('Errore server:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('- backend started on port ' + PORT);
});