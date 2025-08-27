pragma solidity ^0.5.0;

contract Cleaning {
    // struct ObjectStatus {
    //     address account;
    //     bool isCleaned;
    // }

    // ObjectStatus[] public objects;
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
        // require(objectId < objects.length, "Invalid objectId");
        // require(objects[objectId].account == address(0), "Object already cleaned");

        // objects[objectId].account = msg.sender;
        // objects[objectId].isCleaned = true;
        cleaned[objectId] = msg.sender;
        used[objectId] = address(0);

        return true;
    }

    function useObject(uint objectId) public returns (bool) {
        require(objectId < used.length, "Invalid objectId");
        require(used[objectId] == address(0), "Object already used");
        // require(objectId < objects.length, "Invalid objectId");
        // require(objects[objectId].account == address(0), "Object already cleaned");
        
        // objects[objectId].account = msg.sender;
        // objects[objectId].isCleaned = false;
        used[objectId] = msg.sender;
        cleaned[objectId] = address(0);

        return true;
    }

    function getObjectsCleaned() public view returns (address[] memory) {
        // address[] memory cleaned = new address[](objects.length);

        // for (uint i = 0; i < objects.length; i++) {
        //     if (objects[i].isCleaned) {
        //         cleaned[i] = objects[i].account;
        //     }else{
        //         cleaned[i] = address(0);
        //     }
        // }

        return cleaned;
    }

    function getObjectsUsed() public view returns (address[] memory) {
        // address[] memory used = new address[](objects.length);

        // for (uint i = 0; i < objects.length; i++) {
        //     if (!objects[i].isCleaned) {
        //         used[i] = objects[i].account;
        //     }else{
        //         used[i] = address(0);
        //     }
        // }

        return used;
    }
}