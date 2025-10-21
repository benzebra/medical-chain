// const { init } = require("../../backend/models/MedicalObjects");

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

App = {
    web3Provider: null,
    contracts: {},

    init: async function() {
        ObjectAPI.getAllObjects().then(objects => {
            // objects = objects.slice(-20);
            objects.forEach(function(object) {
                if (object.blockchain_status === 'clean') {
                    var $tbody = $('#transactionTableCleaning tbody');
                    if ($tbody.length === 0) {
                        $tbody = $('<tbody>');
                        $('#transactionTableCleaning').append($tbody);
                    }
                    var row = '<tr>';
                    row += '<td>' + object.id + '</td>';
                    row += '<td>' + object.name + '</td>';
                    row += '<td>' + object.last_user + '</td>';
                    row += '<td>' + formatTimestamp(object.timestamp) + '</td>';
                    row += '</tr>';
                    $tbody.append(row);
                }else if (object.blockchain_status === 'used') {
                    var $tbody = $('#transactionTableUsing tbody');
                    if ($tbody.length === 0) {
                        $tbody = $('<tbody>');
                        $('#transactionTableUsing').append($tbody);
                    }
                    var row = '<tr>';
                    row += '<td>' + object.id + '</td>';
                    row += '<td>' + object.name + '</td>';
                    row += '<td>' + object.last_user + '</td>';
                    row += '<td>' + formatTimestamp(object.timestamp) + '</td>';
                    row += '</tr>';
                    $tbody.append(row); 
                }
            });
        }).catch(error => {
        console.error('Errore nel caricamento oggetti:', error);
        });

        await App.initWeb3();
        await App.initContract();
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

            return App.addToList();
        });
    }, 

    // bindEvents: function() {
    //     // $(document).on('click', '.btn-cleaned', App.handleCleaning);
    //     // $(document).on('click', '.btn-used', App.handleUsing);
    // },

    // addToList: function() {
    //     event.preventDefault && event.preventDefault();

    //     var usingInstance;

    //     web3.eth.getAccounts(function(error, accounts) {
    //         if (error) {
    //             console.log(error);
    //         }

    //         var account = accounts[0];

    //         App.contracts.Cleaning.deployed().then(function(instance) {
    //             usingInstance = instance;

    //             // console.log(account);

    //             var valCleaned = usingInstance.getObjectsCleaned({from: account});
    //             var valUsed = usingInstance.getObjectsUsed({from: account});

    //             // App.parseTableCleaning(valCleaned);
    //             // App.parseTableUsing(valUsed);

    //             return true
    //         }).catch(function(err) {
    //             console.log(err.message);
    //         });
    //     });
    // },
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});