pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './common/Stoppable.sol';
import './common/HbStorage.sol';
import './common/Utility.sol';

/** @title group smart contract. */
contract FlightDelay is Ownable, Stoppable {
    HbStorage hbs;
    uint interval = 24;//只能买24小时以后的产品

    event UserJoin(string flightNO, string flightDate, address user);


    function FlightDelay(address hbsAddress) public {
        hbs = HbStorage(hbsAddress);
    }

    function setInterval(uint _interval) public onlyOwner{
        interval = _interval;
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
        require(hbs.isOpening(sfIndex));
        require(!hbs.isMemberInSF(sfIndex, msg.sender));

        hbs.addMemberToSF(sfIndex, msg.sender, votedSfIndex, vote);
        UserJoin(flightNO, flightDate, msg.sender);
    }  
}