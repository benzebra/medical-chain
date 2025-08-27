App = {
  web3Provider: null,
  contracts: {},
  
  init: async function() {
    // Load rooms.
    $.getJSON('../json/rooms.json', function(data) {
      var roomsRow = $('#roomsRow');
      var roomTemplate = $('#roomTemplate');

      for (i = 0; i < data.length; i ++) {
        roomTemplate.find('.panel-title').text(data[i].name);
        roomTemplate.find('img').attr('src', data[i].picture);
        roomTemplate.find('.room-id').text(data[i].id);
        roomTemplate.find('.room-floor').text(data[i].floor);
        roomTemplate.find('.room-depart').text(data[i].department);
        roomTemplate.find('.room-poc').text(data[i].pocid);
        roomTemplate.find('.btn-cleaned').attr('data-id', data[i].id); // TODO: add cleaning function
        roomTemplate.find('.btn-used').attr('data-id', data[i].id); // TODO: add used function

        if(data[i].clean){
          roomTemplate.find('.btn-cleaned').attr('disabled', true);
          roomTemplate.find('.btn-used').attr('disabled', false);
        }else{
          roomTemplate.find('.btn-cleaned').attr('disabled', false);
          roomTemplate.find('.btn-used').attr('disabled', true);
        }

        roomsRow.append(roomTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    console.log(web3.currentProvider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      console.log(data)
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      console.log('92 - ' + App.web3Provider)
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('.btn-adopt').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        console.log(petId + ' ' + account);

        var val = adoptionInstance.adopt(petId, {from: account})

        // Execute adopt as a transaction by sending account
        return val;
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});