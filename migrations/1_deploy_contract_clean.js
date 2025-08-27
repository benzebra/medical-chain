const fs = require('fs');

var Cleaning = artifacts.require("./Cleaning");

module.exports = function(deployer) {
    const objects = JSON.parse(fs.readFileSync('./src/json/objects.json', 'utf8'));
    const numberOfObjects = objects.length;
    deployer.deploy(Cleaning, numberOfObjects);
};
