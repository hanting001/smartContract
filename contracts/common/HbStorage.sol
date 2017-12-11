pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract HbStorage is Ownable {
    mapping(address => string) accounts;
    function HbStorage() public {
        // constructor
    }
}
