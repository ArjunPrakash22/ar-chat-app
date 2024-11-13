// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserDetails {
    struct User {
        string name;
        string uniqueId;
        string gender;
        string dob;
    }

    // Mapping of uniqueId to User struct
    mapping(string => User) private users;
    
    // Mapping of user addresses to unique IDs
    mapping(address => string) private userIds;

    event UserAdded(address indexed userAddress, string name, string uniqueId);

    function addUser(
        string memory _name,
        string memory _uniqueId,
        string memory _gender,
        string memory _dob
    ) public {
        // Check if the unique ID already exists
        require(bytes(users[_uniqueId].name).length == 0, "User with this ID already exists");
        
        // Store user details and associate the unique ID with the sender's address
        users[_uniqueId] = User(_name, _uniqueId, _gender, _dob);
        userIds[msg.sender] = _uniqueId;
        
        emit UserAdded(msg.sender, _name, _uniqueId);
    }

    function getUser() public view returns (string memory, string memory, string memory, string memory) {
        // Retrieve the unique ID for the sender's address
        string memory uniqueId = userIds[msg.sender];
        
        // Check if the user exists
        User memory user = users[uniqueId];
        require(bytes(user.name).length > 0, "User does not exist");
        
        return (user.name, user.uniqueId, user.gender, user.dob);
    }
}




