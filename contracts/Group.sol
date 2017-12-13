pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';

/** @title group smart contract. */
contract Group is Ownable, Stoppable{
    // address[] members;
    mapping(address=>bool) public members;
    string item;//item id
    bool public isOpen;
    KnotToken knotToken;

    event Join(
        address indexed _from,
        bytes32 indexed _item
    );

    function Group(string _item, address tokenAddress) public Stoppable(msg.sender) {
        item = _item;
        knotToken = KnotToken(tokenAddress);
    }

    /**
    * @dev Throws if group is not open.
    */
    modifier onlyOpen() {
        require(isOpen);
        _;
    }

    //manage
    /** @dev open group,member can join. */
    function open()  public onlyOwner {
        isOpen = true;
    }
    /** @dev close group,member can not join. */
    function close() public onlyOwner {
        isOpen = false;
    }

    //member
    /** @dev join this group. */
    function join() external onlyOpen stopInEmergency {
        uint256 value = 1 * 10 ** knotToken.decimals();
        
        require(knotToken.balanceOf(msg.sender) >= value);
        
        members[msg.sender] = true;
        //转出
        if(!knotToken.transferFrom(msg.sender, this, value)) {
            members[msg.sender] = false;
        }
        Join(msg.sender, keccak256(item));
    }

    /** @dev get group item. */
    function getItem() view public returns (string) {
        return item;
    }
    function getToken() view public returns (address) {
        return knotToken;
    }

}