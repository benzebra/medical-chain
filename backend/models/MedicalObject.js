// backend/models/MedicalObject.js
const mongoose = require('mongoose');

const MedicalObjectSchema = new mongoose.Schema({
  // Mantieni la stessa struttura del tuo objects.json
  id: {
    type: Number,
    required: [true, 'ID è obbligatorio'],
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Nome è obbligatorio'],
    trim: true,
    maxlength: [100, 'Nome non può superare 100 caratteri']
  },
  picture: {
    type: String,
    required: [true, 'Immagine è obbligatoria'],
    default: 'https://placehold.co/140x140'
  },
  room_id: {
    type: Number,
    required: [true, 'Room ID è obbligatorio'],
    index: true
  },
  notes: {
    type: String,
    default: '',
    maxlength: [500, 'Note non possono superare 500 caratteri']
  },
  
  // Campi aggiuntivi per integrazione blockchain
  blockchain_status: {
    type: String,
    enum: ['clean', 'used', 'unknown'],
    default: 'unknown'
  },
  last_transaction: {
    type: String,
    default: ''
  },
  last_user: {
    type: String,
    default: ''
  },
  
  // Metadati
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  }
}, {
  timestamps: true,
  collection: 'medical_objects'
});

// Indici per performance
MedicalObjectSchema.index({ room_id: 1 });
MedicalObjectSchema.index({ status: 1 });
MedicalObjectSchema.index({ blockchain_status: 1 });
MedicalObjectSchema.index({ id: 1, room_id: 1 });

// Metodi statici
MedicalObjectSchema.statics.findByRoomId = function(roomId) {
  return this.find({ room_id: roomId, status: 'active' }).sort({ id: 1 });
};

MedicalObjectSchema.statics.findActive = function() {
  return this.find({ status: 'active' }).sort({ id: 1 });
};

// MedicalObjectSchema.statics.getNextId = async function() {
//   const lastObject = await this.findOne().sort({ id: -1 });
//   return lastObject ? lastObject.id + 1 : 0;
// };

// Metodi dell'istanza
MedicalObjectSchema.methods.updateBlockchainStatus = function(status, txHash, userAddress) {
  this.blockchain_status = status;
  this.last_transaction = txHash || '';
  this.last_user = userAddress || '';
  return this.save();
};

MedicalObjectSchema.methods.setMaintenance = function() {
  this.status = 'maintenance';
  return this.save();
};

module.exports = mongoose.model('MedicalObject', MedicalObjectSchema);