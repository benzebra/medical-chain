async function handleObjectCleaned(objectId, userAddress) {
  try {
    const result = await App.contracts.Cleaning.deployed().then(function(instance) {
      return instance.cleanObject(objectId, {from: userAddress});
    });
    
    await ObjectAPI.updateBlockchainStatus(
      objectId, 
      'clean', 
      result.tx, 
      userAddress
    );
        
    location.reload();
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento:', error);
    alert('Errore nell\'aggiornamento dell\'oggetto');
  }
}

async function handleObjectUsed(objectId, userAddress) {
  try {
    const result = await App.contracts.Cleaning.deployed().then(function(instance) {
      return instance.useObject(objectId, {from: userAddress});
    });
    
    await ObjectAPI.updateBlockchainStatus(
      objectId, 
      'used', 
      result.tx, 
      userAddress
    );
        
    location.reload();
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento:', error);
    alert('Errore nell\'aggiornamento dell\'oggetto');
  }
}

App = {
  web3Provider: null,
  contracts: {},
  
  init: async function() {
    ObjectAPI.getAllObjects().then(objects => {
      objects.forEach(function(object) {

        var objectRow = $('#objectTemplate').clone();
        objectRow.find('.object-id').text(object.id);
        objectRow.find('.room-id').text(object.room_id);
        objectRow.find('.panel-title').text(object.name);
        objectRow.find('.object-notes').text(object.notes);

        objectRow.find('img').attr('src', object.picture);

        objectRow.find('.btn-cleaned').attr('data-id', object.id);
        objectRow.find('.btn-used').attr('data-id', object.id);
        
        console.log(object.blockchain_status)

        if (object.blockchain_status === 'clean') {
          objectRow.find('.btn-cleaned').attr('disabled', true);
          objectRow.find('.btn-used').attr('disabled', false);
        } else if (object.blockchain_status === 'used') {
          objectRow.find('.btn-used').attr('disabled', true);
          objectRow.find('.btn-cleaned').attr('disabled', false);
        }
        
        objectRow.attr('style', 'display: block');
        $('#objectsRow').append(objectRow);
      });
    }).catch(error => {
      console.error('Errore nel caricamento oggetti:', error);
    });

    $('#newObjectBtn').on('click', function() {
      $('#newObjectRow').html($('#newObject').html());
      $('#newObjectBtn').attr('disabled', true);

      $('#addObjectForm').on('submit', async function(e) {
        console.log('sub')
        e.preventDefault();
        
        const formData = {
          id: $('#objectId').val(),
          name: $('#objectName').val(),
          picture: $('#objectPicture').val(),
          room_id: parseInt($('#objectRoomId').val()),
          notes: $('#objectNotes').val()
        };
        
        try {
          const result = await ObjectAPI.createObject(formData);
          alert('Oggetto creato con successo!');
          
          this.reset();
          $('#newObjectRow').hide();
          
          location.reload();
        } catch (error) {
          alert('Errore nella creazione dell\'oggetto: ' + error.message);
        }
      });
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {

    if (window.ethereum){
      web3 = new Web3(web3.currentProvider);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.error("User denied account access");
      }
      App.web3Provider = web3.currentProvider;
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
    
  },

  initContract: function() {
    $.getJSON('Cleaning.json', function(data) {
      var CleaningArtifact = data;
      App.contracts.Cleaning = TruffleContract(CleaningArtifact);

      App.contracts.Cleaning.setProvider(App.web3Provider);

      return true;
    });

    return App.bindEvents();
  }, 

  bindEvents: function() {
    $(document).on('click', '.btn-cleaned', App.handleCleaning);
    $(document).on('click', '.btn-used', App.handleUsing);
  },

  handleUsing: function(event) {
    event.preventDefault();
    var objectId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      handleObjectUsed(objectId, accounts[0]);
    });
  },

  handleCleaning: function(event) {
    event.preventDefault();
    var objectId = parseInt($(event.target).data('id'));

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      handleObjectCleaned(objectId, accounts[0]);
    });
  },

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});