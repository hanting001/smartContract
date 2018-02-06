pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import "../installed_contracts/solidity-stringutils/strings.sol";
import './common/Stoppable.sol';
import './common/HbStorage.sol';
import './common/KnotToken.sol';
import './common/Utility.sol';

/** @title group smart contract. */
contract FlightDelay is Ownable, Stoppable {
    using strings for *; 
    HbStorage hbs;
    KnotToken token;
    uint public interval = 24;//只能买24小时以后的产品
    uint public maxCount = 150;//每个航班最大的组员数量

    event UserJoin(string flightNO, string flightDate, address user);


    function FlightDelay(address hbsAddress, address tokenAddress) public Stoppable(msg.sender){
        hbs = HbStorage(hbsAddress);
        token = KnotToken(tokenAddress);
    }
    function setInterval(uint _interval) public onlyOwner {
        interval = _interval;
    }
    function setMaxCount(uint count) public onlyOwner {
        maxCount = count;
    }

    /** @dev 用户获取航班价格
      * @param flightNO 航班号
      */
    function getPrice(string flightNO) public view returns (uint) {
        //暂时默认价格30
        return 30;
    }
    /** @dev 用户获取购买资格
      * @param flightNO 航班号
      * @param price 价格
      */
    function getQualification(string flightNO, uint price) public {
        require(!flightNO.toSlice().empty());
        require(price > 0);
        require(token.balanceOf(msg.sender) >= price);

        hbs.setCanBuy(msg.sender, flightNO);
        if (!token.transferFrom(msg.sender, this, price)) {
            hbs.setCanBuy(msg.sender, "");
        }
    }
    function getSFCount(bytes32 _sfIndex) public view returns (uint) {
        return hbs.getSFCount(_sfIndex);
    }
    /** @dev 用户查看自己是否有购买资格
      * @param flightNO 航班号
      */
    function hasQualification(string flightNO) public view returns (bool) {
        require(!flightNO.toSlice().empty());
        return hbs.canBuy(msg.sender, flightNO);
    }


    /** @dev 用户加入航班计划 
      * @param flightNO 航班号
      * @param flightDate 航班日期，格式:yyyy-mm-dd
      */
    function joinFlight(string flightNO, string flightDate) public stopInEmergency {
        joinFlightByVote(flightNO, flightDate, bytes32(""), HbStorage.DelayStatus.no);
    }
    /** @dev 用户通过投票加入航班计划 
      * @param flightNO 航班号
      * @param flightDate 航班日期，格式:yyyy-mm-dd
      */  
    function joinFlightByVote(string flightNO, string flightDate, bytes32 votedSfIndex, HbStorage.DelayStatus vote) public stopInEmergency {
        require(Utility.checkDateFomat(flightDate));
        require(Utility.checkDate(flightDate, interval));
        bytes32 sfIndex = keccak256(Utility.strConcat(flightNO, flightDate));
        require(hbs.getSFCount(sfIndex) <= maxCount);
        //check user can buy
        require(hbs.canBuy(msg.sender, flightNO));
        
        require(hbs.isOpening(sfIndex));
        require(!hbs.isMemberInSF(sfIndex, msg.sender));

        hbs.addMemberToSF(sfIndex, msg.sender, votedSfIndex, vote);
        hbs.setCanBuy(msg.sender, "");
        UserJoin(flightNO, flightDate, msg.sender);
    }  

    
}