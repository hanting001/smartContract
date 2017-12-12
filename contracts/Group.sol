pragma solidity ^0.4.18;

import './common/Stoppable.sol';

contract Group is Stoppable {
    address[] members;
    string item;
    bool isOpen;
    function Group(address _curator) public
        Stoppable(_curator) {
        // constructor
    }
}