App = {
    web3Provider: null,
    contracts: {},

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

    bindEvents: function() {
        // $(document).on('click', '.btn-cleaned', App.handleCleaning);
        // $(document).on('click', '.btn-used', App.handleUsing);
    },

    addToList: function() {
        event.preventDefault && event.preventDefault();

        var usingInstance;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Cleaning.deployed().then(function(instance) {
                usingInstance = instance;

                // console.log(account);

                var valCleaned = usingInstance.getObjectsCleaned({from: account});
                var valUsed = usingInstance.getObjectsUsed({from: account});

                App.parseTableCleaning(valCleaned);
                App.parseTableUsing(valUsed);

                return true
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    parseTableCleaning: function(val) {
        val.then(function(objects) {
            console.log(objects)
            var $tbody = $('#transactionTableCleaning tbody');
            if ($tbody.length === 0) {
                $tbody = $('<tbody>');
                $('#transactionTableCleaned').append($tbody);
            }
            $tbody.empty();
            for (var i = 0; i < objects.length; i++) {
                if(objects[i] != '0x0000000000000000000000000000000000000000'){
                    var row = '<tr>';
                    row += '<td>' + i + '</td>';
                    row += '<td>' + objects[i] + '</td>';
                    row += '</tr>';
                    $tbody.append(row);
                }
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    parseTableUsing: function(val) {
        val.then(function(objects) {
            var $tbody = $('#transactionTableUsing tbody');
            if ($tbody.length === 0) {
                $tbody = $('<tbody>');
                $('#transactionTableUsed').append($tbody);
            }
            $tbody.empty();
            for (var i = 0; i < objects.length; i++) {
                if(objects[i] != '0x0000000000000000000000000000000000000000'){
                    var row = '<tr>';
                    row += '<td>' + i + '</td>';
                    row += '<td>' + objects[i] + '</td>';
                    row += '</tr>';
                    $tbody.append(row);
                }
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    }

};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});