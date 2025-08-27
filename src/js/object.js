// const fs = require('fs');
// const path = require('path');

App = {
  web3Provider: null,
  contracts: {},
  
  init: async function() {
    // Load objects.
    $.getJSON('../json/objects.json', function(data) {
      var objectsRow = $('#objectsRow');
      var objectTemplate = $('#objectTemplate');

      for (i = 0; i < data.length; i ++) {
        objectTemplate.find('.panel-title').text(data[i].name);
        objectTemplate.find('img').attr('src', data[i].picture);
        objectTemplate.find('.object-id').text(data[i].id);
        objectTemplate.find('.object-room').text(data[i].room_id);
        objectTemplate.find('.object-name').text(data[i].name);
        objectTemplate.find('.object-notes').text(data[i].notes);
        objectTemplate.find('.btn-cleaned').attr('data-id', data[i].id); // TODO: add cleaning function
        objectTemplate.find('.btn-used').attr('data-id', data[i].id); // TODO: add used function

        objectsRow.append(objectTemplate.html());
      }
    });

    $('#newObjectBtn').on('click', function() {
      $('#newObjectRow').html($('#newObject').html());
      $('#newObjectBtn').attr('disabled', true);
    });

    $('#newObjectForm').on('submit', function(event) {
      event.preventDefault();
      App.addObj();
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
      console.log("modern dapp browser");
    }
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
      console.log("legacy dapp browser");
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

      return App.markCleaned(), App.markUsed();
    });

    return App.bindEvents();
  }, 

  bindEvents: function() {
    $(document).on('click', '.btn-cleaned', App.handleCleaning);
    $(document).on('click', '.btn-used', App.handleUsing);
  },

  markCleaned: function() {
    var cleaningInstance;

    App.contracts.Cleaning.deployed().then(function(instance) {
      cleaningInstance = instance;

      // return cleaningInstance.getObjects.call();
      return cleaningInstance.getObjectsCleaned.call();
    }).then(function(cleaned) {
      console.log(cleaned)
      for (i = 0; i < cleaned.length; i++) {

        if (cleaned[i] == '0x0000000000000000000000000000000000000000'){
          // $('.panel').eq(i).find('.btn-cleaned').attr('disabled', false);
          // $('.panel').eq(i).find('.btn-used').attr('disabled', true);
          console.log('pass obj ' + (i))
        }else{
          $('.panel').eq(i).find('.btn-cleaned').attr('disabled', true);
          $('.panel').eq(i).find('.btn-used').attr('disabled', false);
          console.log('cleaned obj ' + (i))
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    // }).then(function(objects) {
    //   console.log(objects)
    //   for (i = 0; i < objects.length; i++) {

    //     if (objects[i] == '0x0000000000000000000000000000000000000000'){
    //       $('.panel').eq(i).find('.btn-cleaned').attr('disabled', false);
    //       $('.panel').eq(i).find('.btn-used').attr('disabled', true);
    //       console.log('used obj ' + (i))
    //     }else{
    //       $('.panel').eq(i).find('.btn-cleaned').attr('disabled', true);
    //       $('.panel').eq(i).find('.btn-used').attr('disabled', false);
    //       console.log('cleaned obj ' + (i))
    //     }
    //   }
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },

  markUsed: function() {
    var usingInstance;

    App.contracts.Cleaning.deployed().then(function(instance) {
      usingInstance = instance;

      // return usingInstance.getObjects.call();
      console.log(usingInstance)
      return usingInstance.getObjectsUsed.call();
    }).then(function(objects) {
      console.log(objects)
      for (i = 0; i < objects.length; i++) {

        if (objects[i] == '0x0000000000000000000000000000000000000000'){
          // $('.panel').eq(i).find('.btn-cleaned').attr('disabled', false);
          // $('.panel').eq(i).find('.btn-used').attr('disabled', true);
          console.log('pass obj ' + i);
        }else{
          $('.panel').eq(i).find('.btn-cleaned').attr('disabled', false);
          $('.panel').eq(i).find('.btn-used').attr('disabled', true);
          console.log('cleaned obj ' + i);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    // }).then(function(objects) {
    //   console.log(objects)
    //   for (i = 0; i < objects.length; i++) {

    //     if (objects[i] == '0x0000000000000000000000000000000000000000'){
    //       $('.panel').eq(i).find('.btn-cleaned').attr('disabled', false);
    //       $('.panel').eq(i).find('.btn-used').attr('disabled', true);
    //       console.log('used obj ' + i);
    //     }else{
    //       $('.panel').eq(i).find('.btn-cleaned').attr('disabled', true);
    //       $('.panel').eq(i).find('.btn-used').attr('disabled', false);
    //       console.log('cleaned obj ' + i);
    //     }
    //   }
    // }).catch(function(err) {
    //   console.log(err.message);
    // });
  },

  handleUsing: function(event) {
    event.preventDefault();

    var objectId = parseInt($(event.target).data('id'));

    var usingInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Cleaning.deployed().then(function(instance) {
        usingInstance = instance;

        console.log('used: ' + objectId + ' ' + account);

        var val = usingInstance.useObject(objectId, {from: account})

        console.log(val)
        // Execute adopt as a transaction by sending account
        return val;
      }).then(function(result) {
        return App.markUsed();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleCleaning: function(event) {
    event.preventDefault();

    var objectId = parseInt($(event.target).data('id'));

    var cleaningInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Cleaning.deployed().then(function(instance) {
        cleaningInstance = instance;

        console.log('cleaned: ' + objectId + ' ' + account);

        var val = cleaningInstance.cleanObject(objectId, {from: account})

        // Execute adopt as a transaction by sending account
        return val;
      }).then(function(result) {
        return App.markCleaned();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  addObj: function() {
    var newObject = $('#newObject').val();
    console.log(newObject);

    // Node.js: Add new object to objects.json
    const objectsPath = path.join(__dirname, '../json/objects.json');

    // Read existing objects
    let data = [];
    try {
      data = JSON.parse(fs.readFileSync(objectsPath, 'utf8'));
    } catch (err) {
      console.error('Failed to read objects.json:', err);
    }

    // Generate a new id for the object
    var newId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
    var obj = {
      id: newId,
      name: newObject,
      picture: "images/default.png",
      room_id: "",
      notes: ""
    };
    data.push(obj);

    // Write updated data back to objects.json
    try {
      fs.writeFileSync(objectsPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('Object added:', obj);
      location.reload();
    } catch (err) {
      console.error('Failed to write objects.json:', err);
      alert('Failed to add object.');
    }

    App.contracts.Cleaning.deployed().then(function(instance) {
      return instance.addObject(newObject);
    }).then(function(result) {
      console.log('Object added: ' + newObject);
      App.markUsed();
    }).catch(function(err) {
      console.log(err.message);
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});