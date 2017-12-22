pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract HbStorage is Ownable {
    mapping(string => mapping(address => bool)) address2bool;
    mapping(string => address[])  addressArray;
    function HbStorage() public {
        // constructor
    }
    function getBoolByAddress(string key, address by) public view returns(bool) {
        return address2bool[key][by];
    }
    function setBoolByAddress(string key, address by, bool _bool) public {
        address2bool[key][by] = _bool;
    }
    function getAddressArrayByIndex(string key, uint index) public view returns(address) {
        return addressArray[key][index];
    }
    function setAddressArray(string key, address _address) public {
        addressArray[key].push(_address);
    }
}
