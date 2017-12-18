pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';

/** @title group smart contract. */
contract Group is Ownable, Stoppable{
    // address[] members;
    mapping(address=>bool) public membersInGroup;
    address[] members;
    address winner;
    string item;//item id
    bool public isOpen;
    KnotToken knotToken;
    uint closeBlockNumber;

    event Join(
        address indexed _sender,
        bytes32 indexed _item
    );
    event Lottery (
        address indexed _sender,
        bytes32 indexed _item,
        uint time
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
    /**
    * @dev Throws if sender is not in group.
    */
    modifier onlyWinner() {
        require(msg.sender == winner);
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
        closeBlockNumber = block.number;
    }
    function lottery(uint8 _index) external onlyOwner {
        require(!isOpen);
        require(members.length > 3);
        require(membersInGroup[_index]);

        winner = members[_index];

        Lottery(msg.sender, keccak256(item), block.timestamp);
    }

    //member
    /** @dev join this group. */
    function join() external onlyOpen stopInEmergency {
        uint256 value = 1 * 10 ** knotToken.decimals();

        require(knotToken.balanceOf(msg.sender) >= value);
        require(!membersInGroup[msg.sender]);
        
        membersInGroup[msg.sender] = true;
        uint length = members.push(msg.sender);
        //转出
        if(!knotToken.transferFrom(msg.sender, this, value)) {
            membersInGroup[msg.sender] = false;
            delete members[length - 1];
        }
        Join(msg.sender, keccak256(item));
    }

    /** @dev winner receive bonus */
    function receiveBonus() external onlyWinner {
        assert(knotToken.transfer(msg.sender, knotToken.balanceOf(this)));
    }
    /** @dev get group item. */
    function getItem() view public returns (string) {
        return item;
    }
    function getToken() view public returns (address) {
        return knotToken;
    }

}