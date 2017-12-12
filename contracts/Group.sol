pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';

/** @title group smart contract. */
contract Group is Ownable, Stoppable{
    address[] members;
    string item;//item id
    bool isOpen;

    function Group(string _item) public Stoppable(msg.sender) {
        item = _item;
    }

    /**
    * @dev Throws if group is not open.
    */
    modifier onlyOpen() {
        require(isOpen);
        _;
    }

    //manage
    function open()  public onlyOwner {
        isOpen = true;
    }
    function close() public onlyOwner {
        isOpen = false;
    }

    //member
    /** @dev join this group. */

    /** @dev get group item. */
    function getItem() view public returns (string) {
        return item;
    }

}