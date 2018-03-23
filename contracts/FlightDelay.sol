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
    uint public rate = 4000;
    struct DelayPayInfo {
        uint times;
        uint payCount;
        bool isValued;
    }
    // uint public tokenCount = 0;
    mapping(uint => DelayPayInfo) public delayPayInfos;
    event UserJoin(string flightNO, string flightDate, address user);

    string public testOK = 'NO';

    function FlightDelay(address hbsAddress, address tokenAddress) public Stoppable(msg.sender){
        hbs = HbStorage(hbsAddress);
        token = KnotToken(tokenAddress);
        delayPayInfos[uint(HbStorage.DelayStatus.no)] = DelayPayInfo({times: 0, payCount: getDelayClaimRate(HbStorage.DelayStatus.no), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay1)] = DelayPayInfo({times: 30, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay1), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay2)] = DelayPayInfo({times: 60, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay2), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay3)] = DelayPayInfo({times: 120, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay3), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay4)] = DelayPayInfo({times: 999, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay4), isValued: true});
    }
    function setInterval(uint _interval) public onlyOwner {
        interval = _interval;
    }
    function setMaxCount(uint count) public onlyOwner {
        maxCount = count;
    }
    function setRate(uint _rate) public onlyOwner {
        rate = _rate;
    }
    /** @dev 获取各个时间段的赔付率
      * @param status 赔付时间段
      */    
    function getDelayClaimRate(HbStorage.DelayStatus status) internal returns (uint){
        if (status == HbStorage.DelayStatus.no) {
            return 0;
        }
        if (status == HbStorage.DelayStatus.delay1 ) {
            return 30 * 2;
        }
        if ( status == HbStorage.DelayStatus.delay2) {
            return 30 * 5;
        }
        if ( status == HbStorage.DelayStatus.delay3) {
            return 30 * 10;
        }
        if ( status == HbStorage.DelayStatus.delay4) {
            return 30 * 15;
        }
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

    /** @dev 用户通过投票加入航班计划 
      * @param flightNO 航班号
      * @param flightDate 航班日期，格式:yyyy-mm-dd
      */  
    function joinFlightByVote(string flightNO, string flightDate, bytes32 votedSfIndex, HbStorage.DelayStatus vote) public stopInEmergency {
        require(Utility.checkDateFomat(flightDate));
        require(Utility.checkDate(flightDate, interval));
        bytes32 sfIndex = keccak256(Utility.strConcat(flightNO, flightDate));
        require(hbs.getSFCount(sfIndex) <= maxCount);
        
        require(hbs.isOpening(sfIndex));
        bool isMemberNotInSF = !hbs.isMemberInSF(sfIndex, msg.sender);
        require(isMemberNotInSF);

        uint tokenCount = getPrice(flightNO) * 1 ether;
        require(token.balanceOf(msg.sender) >= tokenCount);
        require(token.transferFrom(msg.sender, this, tokenCount));

        hbs.addMemberToSF(sfIndex, flightNO, flightDate, msg.sender, votedSfIndex, vote);
        testOK = 'OKOKOK';

        if (hbs.getSFCount(sfIndex) == maxCount) {
            hbs.setClose(sfIndex);
        }
        UserJoin(flightNO, flightDate, msg.sender);
        
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
}