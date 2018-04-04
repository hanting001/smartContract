pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "../installed_contracts/solidity-stringutils/strings.sol";
import './common/Stoppable.sol';
import './common/HbStorage.sol';
import './common/KnotToken.sol';
import './common/Utility.sol';

/** @title group smart contract. */
contract FlightDelay is Ownable, Stoppable {
    using strings for *; 
    using SafeMath for uint256;
    HbStorage hbs;
    KnotToken token;
    uint public interval = 24;//只能买24小时以后的产品
    uint public maxCount = 150;//每个航班最大的组员数量
    uint public rate = 4000;
    uint public exchanged;
    mapping(address => uint) withdraws;
    event UserJoin(string flightNO, string flightDate, address user);

    uint public testOK;

    function FlightDelay(address hbsAddress, address tokenAddress) public Stoppable(msg.sender){
        hbs = HbStorage(hbsAddress);
        token = KnotToken(tokenAddress);
    }
    function setInterval(uint _interval) external onlyOwner {
        interval = _interval;
    }
    function setMaxCount(uint count) external onlyOwner {
        maxCount = count;
    }
    function setRate(uint _rate) external onlyOwner {
        rate = _rate;
    }


    /** @dev 用户获取航班价格
      * @param flightNO 航班号
      */
    function getPrice(string flightNO) public view returns (uint) {
        //暂时默认价格30
        return 30;
    }
    /** @dev 获取延误状态信息
      * 
      */  
    function getFlightSts() public view returns (uint) {
        //暂时默认价格30
        return 30;
    }       
    /** @dev 用户获取购买资格
      * @param flightNO 航班号
      * @param price 价格
      */
    // function getQualification(string flightNO, uint price) public {
    //     require(!flightNO.toSlice().empty());
    //     require(price > 0);
    //     require(token.balanceOf(msg.sender) >= price);

    //     hbs.setCanBuy(msg.sender, flightNO);
    //     if (!token.transferFrom(msg.sender, this, price)) {
    //         hbs.setCanBuy(msg.sender, "");
    //     }
    // }
    /** @dev 获取已经购买该航班的用户数
      * @param _sfIndex 航班序列号（航班号+航班日期）
      */
    function getSFCount(bytes32 _sfIndex) public view returns (uint) {
        return hbs.getSFCount(_sfIndex);
    }
    /** @dev 用户查看自己是否有购买资格
      * @param flightNO 航班号
      */
    // function hasQualification(string flightNO) public view returns (bool) {
    //     require(!flightNO.toSlice().empty());
    //     return hbs.canBuy(msg.sender, flightNO);
    // }
    // /** @dev 获取当前处于投票中的航班信息
    //   */
    // function getCurrentVote() public view returns (bytes32) {
    //     bytes32 currentVote = hbs.currentVote();
    //     return currentVote;
    // }


    /** @dev 用户加入航班计划 
      * @param flightNO 航班号
      * @param flightDate 航班日期，格式:yyyy-mm-dd
      */
    function joinFlight(string flightNO, string flightDate) external stopInEmergency {
        joinFlightByVote(flightNO, flightDate, bytes32(""), HbStorage.DelayStatus.no);
    }
    function joinCheck(string flightDate, bytes32 sfIndex, uint tokenCount) public view returns(uint) {
        if (!Utility.checkDateFomat(flightDate)) {
            return 1;
        }
        if(!Utility.checkDate(flightDate, interval)) {
            return 2;
        }
        if(!(hbs.getSFCount(sfIndex) <= maxCount)){
            return 3;
        }
        if(!hbs.isOpening(sfIndex)) {
            return 4;
        }
        bool isMemberInSF = hbs.isMemberInSF(sfIndex, msg.sender);
        if(isMemberInSF){
            return 5;
        }
        if(token.balanceOf(msg.sender) < tokenCount){
            return 6;
        }
        return 0;
    }
    /** @dev 用户通过投票加入航班计划 
      * @param flightNO 航班号
      * @param flightDate 航班日期，格式:yyyy-mm-dd
      */  
    function joinFlightByVote(string flightNO, string flightDate, bytes32 votedSfIndex, HbStorage.DelayStatus vote) public stopInEmergency {
        // require(Utility.checkDateFomat(flightDate));
        // require(Utility.checkDate(flightDate, interval));
        bytes32 sfIndex = keccak256(Utility.strConcat(flightNO, flightDate));
        // require(hbs.getSFCount(sfIndex) <= maxCount);
        
        // require(hbs.isOpening(sfIndex));
        // bool isMemberNotInSF = !hbs.isMemberInSF(sfIndex, msg.sender);
        // require(isMemberNotInSF);
        uint price = getPrice(flightNO);
        uint tokenCount = price * 1 ether;
        require(joinCheck(flightDate, sfIndex, tokenCount) == 0);
        // require(token.balanceOf(msg.sender) >= tokenCount);

        require(token.transferFrom(msg.sender, this, tokenCount));

        hbs.addMemberToSF(sfIndex, flightNO, flightDate, msg.sender, votedSfIndex, vote, price);
        if (votedSfIndex != bytes32("")) {
            hbs.updateVote(votedSfIndex, vote);
            if (checkCanEndByVote(sfIndex)) {
                hbs.endVote(sfIndex, msg.sender);
            }
        }
        testOK = block.number;

        if (hbs.getSFCount(sfIndex) == maxCount) {
            hbs.setClose(sfIndex);
        }
        UserJoin(flightNO, flightDate, msg.sender);
        
    }  
    /** @dev 判断用户是否可以结束投票 
      * @param _sfIndex 航班索引
      */ 
    function checkCanEndByVote(bytes32 _sfIndex) public view  returns(bool canEnd){
        var (delay1Counts, delay2Counts, delay3Counts, cancelCounts,noCounts,startNum,,) = hbs.voteInfos(_sfIndex);
        uint totalCounts = delay1Counts.add(delay2Counts).add(delay3Counts).add(cancelCounts).add(noCounts);
        if (block.number.sub(startNum) > hbs.voteEndInterval() && totalCounts > hbs.voteEndThreshold()) {
            return true;
        } else {
            return false;
        }
    } 
    // function checkData(string flightNO, string flightDate) public returns (bool, bool, bool, bool, bool, bool) {
    //     bytes32 sfIndex = keccak256(Utility.strConcat(flightNO, flightDate));
    //     bool isMemberInSF = !hbs.isMemberInSF(sfIndex, msg.sender);
    //     uint tokenCount = getPrice(flightNO) * 1 ether;
    //     return (Utility.checkDateFomat(flightDate), Utility.checkDate(flightDate, interval), hbs.getSFCount(sfIndex) <= maxCount, 
    //     hbs.isOpening(sfIndex), isMemberInSF, token.balanceOf(msg.sender) >= tokenCount);

    // }
    /** @dev 用户兑换token 
      */  
    function exchange() public payable {
        uint eth = msg.value; 
        uint tokenCount = eth * rate;
        require( tokenCount >= 1 ether);
        require( tokenCount <= 1000 ether );
        token.transfer(msg.sender, tokenCount);
    }
    function redeemCheck(uint tokenValue) public view returns(uint) {
        if (tokenValue < 1 ether) {
            return 2; // too small redeem
        }
        if (token.allowance(msg.sender, this) < tokenValue) {
            return 1; // no token allowance
        }
        return 0;
    }
    function redeem(uint tokenValue) external { 
        require(redeemCheck(tokenValue) == 0);
        uint eth = tokenValue.div(rate);
        if(token.transferFrom(msg.sender, this, tokenValue)) {
            exchanged = exchanged.sub(tokenValue);
            withdraws[msg.sender] = withdraws[msg.sender].add(eth);
        }
    }
}