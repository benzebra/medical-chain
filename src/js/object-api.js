// src/js/object-api.js
// const PORT = process.env.PORT || 3002;
const PORT = 3002; // Use a fixed port or set via environment variable at build time if needed
const API_BASE_URL = `http://localhost:${PORT}/api`;

class ObjectAPI {
  static async getAllObjects() {
    try {
      const response = await fetch(`${API_BASE_URL}/objects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore nel recuperare gli oggetti:', error);
      return [];
    }
  }

  // Ottenere oggetti per stanza
  static async getObjectsByRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/objects`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Errore nel recuperare oggetti della stanza:', error);
      return [];
    }
  }

  // Creare nuovo oggetto
  static async createObject(objectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/objects`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(objectData)
      });

      if (!response.ok) {
        // Try to parse error message if possible
        let errorMsg = 'Errore nella creazione';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // response is not JSON
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error('Errore nella creazione dell\'oggetto:', error);
      throw error;
    }
  }

  // Aggiornare oggetto esistente
  static async updateObject(objectId, objectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/objects/${objectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(objectData)
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Errore nell\'aggiornamento');
      }else{
        console.log('Oggetto aggiornato con successo:', result);
      }
      
      return result;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'oggetto:', error);
      throw error;
    }
  }

  // Eliminare oggetto
  static async deleteObject(objectId) {
    try {
      const response = await fetch(`${API_BASE_URL}/objects/${objectId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Errore nell\'eliminazione');
      }
      
      return result;
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'oggetto:', error);
      throw error;
    }
  }

  // Aggiornare stato blockchain dell'oggetto
  static async updateBlockchainStatus(objectId, status, txHash = '', userAddress = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/objects/${objectId}/blockchain-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status,
          txHash: txHash,
          userAddress: userAddress
        })
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Errore nell\'aggiornamento status');
      }
      
      return result;
    } catch (error) {
      console.error('Errore nell\'aggiornamento status blockchain:', error);
      throw error;
    }
  }
}