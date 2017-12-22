pragma solidity ^0.4.18;

import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';


/** @title group smart contract. */
contract Group is Ownable, Stoppable{
    // address[] members;
    mapping(address=>bool) public membersInGroup;
    address[] members;

    address public winner;
    string item;//item id
    bool public isOpen;
    // coin contract
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
    event Open (
        address indexed _sender,
        string _item,
        uint time
    );
    event Close (
        address indexed _sender,
        string _item,
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
        Open(msg.sender, item, block.timestamp);
    }
    /** @dev close group,member can not join. */
    function close() public onlyOwner {
        isOpen = false;
        closeBlockNumber = block.number;
        Close(msg.sender, item, block.timestamp);
    }
    /** @dev lottery a winner 
      * @param interval 在关闭活动后，必须经过多少个block才可以开奖.
      */
    function lottery(uint interval) external onlyOwner {
        require(!isOpen);
        require(members.length > 1);
        require((block.number - closeBlockNumber) > interval);
        require(winner == address(0));

        uint winnerIndex = getRandom(members.length, interval);
        winner = members[winnerIndex];
        // assert(knotToken.transfer(knotToken, knotToken.balanceOf(this)));
        Lottery(msg.sender, keccak256(item), block.timestamp);
    }
    /** @dev get all joined members */
    function getMembers() view external returns(address[]) {
        return members;
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

    /** @dev winner receive bonus 
      * 赢家拿走90%，创建人拿走10%
     */
    function receiveBonus() external onlyWinner {
        assert(knotToken.transfer(msg.sender, knotToken.balanceOf(this) / 10 * 9));
        assert(knotToken.transfer(owner, knotToken.balanceOf(this) / 10));
    }
    /** @dev get group item. 
      * @return item 返回活动奖品
      */
    function getItem() view public returns (string) {
        return item;
    }
    function getToken() view public returns (address) {
        return knotToken;
    }

    //utility
    // function uint2str(uint i) internal pure returns (string){
    //     if (i == 0) return "0";
    //     uint j = i;
    //     uint len;
    //     while (j != 0){
    //         len++;
    //         j /= 10;
    //     }
    //     bytes memory bstr = new bytes(len);
    //     uint k = len - 1;
    //     while (i != 0){
    //         bstr[k--] = byte(48 + i % 10);
    //         i /= 10;
    //     }
    //     return string(bstr);
    // }
    // function parseInt(string _a, uint _b) internal pure returns (uint) {
    //     bytes memory bresult = bytes(_a);
    //     uint mint = 0;
    //     bool decimals = false;
    //     for (uint i=0; i<bresult.length; i++){
    //         if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
    //             if (decimals){
    //                if (_b == 0) break;
    //                 else _b--;
    //             }
    //             mint *= 10;
    //             mint += uint(bresult[i]) - 48;
    //         } else if (bresult[i] == 46) decimals = true;
    //     }
    //     if (_b > 0) mint *= 10**_b;
    //     return mint;
    // }
    // function substring(string str, uint startIndex, uint endIndex) internal pure returns (string) {
    //     bytes memory strBytes = bytes(str);
    //     bytes memory result = new bytes(endIndex-startIndex);
    //     for(uint i = startIndex; i < endIndex; i++) {
    //         result[i-startIndex] = strBytes[i];
    //     }
    //     return string(result);
    // }
    // function toBytes(uint256 x) internal pure returns (bytes b) {
    //     b = new bytes(32);
    //     assembly { mstore(add(b, 32), x) }
    // }


    /** @dev 测试获取随机数 （暂时根据blockhash生成）
      * @param membersNumber 当前参加活动的人数.
      * @param interval 在关闭活动后，必须经过多少个block才可以开奖.
      * @return number 随机数
      */    
    function getRandom(uint membersNumber, uint interval) public view returns(uint) {
        require(2 <= interval );
        require(interval <= 8 );
        uint number = 0;
        for (uint i = interval; i < 2 ** interval; i++) {
            number += uint(block.blockhash(block.number - i));
        }
        number = number / membersNumber;
        uint index = 0;
        while(2 ** index < membersNumber) {
            index += 1;
        }
        number = number & (2 ** index - 1);
        if (number >= membersNumber) {
            number = number - membersNumber;
        }
        return number;
    }

}