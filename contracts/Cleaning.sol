pragma solidity ^0.5.0;

contract Cleaning {
    uint256 public numObjects;
    address[] public cleaned;
    address[] public used;
    uint256[] public timestamp;

    constructor(uint256 _numObjects) public {
        numObjects = _numObjects;

        cleaned = new address[](numObjects);
        used = new address[](numObjects);
        timestamp = new uint256[](numObjects);
    }

    function cleanObject(uint objectId) public returns (bool) {
        require(objectId < cleaned.length, "Invalid objectId");
        require(cleaned[objectId] == address(0), "Object already cleaned");
        
        cleaned[objectId] = msg.sender;
        used[objectId] = address(0);

        return true;
    }

    function useObject(uint objectId) public returns (bool) {
        require(objectId < used.length, "Invalid objectId");
        require(used[objectId] == address(0), "Object already used");
        
        used[objectId] = msg.sender;
        cleaned[objectId] = address(0);

        return true;
    }

    function getObjectsCleaned() public view returns (address[] memory) {
        return cleaned;
    }

    function getObjectsUsed() public view returns (address[] memory) {
        return used;
    }
}