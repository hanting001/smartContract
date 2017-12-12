pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';

contract Group is Stoppable,  Ownable {
    address[] members;
    string item;
    bool isOpen;

    function Group() public
        Stoppable(msg.sender) {
        // constructor
    }

    /**
    * @dev Throws if group is not open.
    */
    modifier onlyOpen() {
        require(isOpen);
        _;
    }

    //manage
    function open() onlyOwner public  {
        isOpen = true;
    }
    function close() onlyOwner public {
        isOpen = false;
    }
}