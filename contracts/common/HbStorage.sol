pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import "../../installed_contracts/solidity-stringutils/strings.sol";
import "./Utility.sol";

contract HbStorage is Ownable {
    using strings for *; 
    
    enum SFStatus { opening, closed, claiming, ended }
    struct SFInfo {
        address[] members;
        SFStatus status;
        bool isDelayed;
        bool isValued;
    }
    struct SFHistroy {
        uint totalCounts;
        uint delayedCounts;
    }
    struct VotedMember {
        address member;
        bool vote;
        bool isValued;
    }
    struct VoteInfo {
        VotedMember[] votedMembers;
        uint yesCounts;
        uint noCounts;
        bool isValued;
    }
    struct MemberSF {
        bytes32 votedSF;
        bool vote;
        bool isValued;
    }
    struct MemberInfo {
        mapping(bytes32 => MemberSF) memberSFInfos;
        bytes32[] scheduledFlights;
        uint winCounts;
        bool isValued;
    }

    //已出单航班信息 {keccak256(航班号+日期): [SFInfo]}
    mapping(bytes32 => SFInfo) public scheduledFlights;
    //记录航班的投票信息 {keccak256(航班号+日期): [VoteInfo]}
    mapping(bytes32 => VoteInfo[])  public votes;
    //记录航班的历史延误信息 {keccak256(航班号+日期): SFHistroy}
    mapping(bytes32 => SFHistroy) public sfHistroy;
    //记录用户的航班信息
    mapping(address => MemberInfo) public memberInfos;

    // function HbStorage() public {
    //     // constructor
    // }

    function isMemberInSF(bytes32 _sfIndex, address member) private view returns (bool) {
        if (memberInfos[member].isValued) {
            var sfs = memberInfos[member].memberSFInfos;
            if (sfs[_sfIndex].isValued) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /** @dev addMemberToSF 用户加入航班计划 
      * @param _flightNO 航班号
      * @param _flightDate 航班日期
      * @param _member 用户账号
      * @param _votedSFIndex 通过投票加入的航班计划
      * @param _vote 投票
      */
    function addMemberToSF(string _flightNO, string _flightDate, address _member, bytes32 _votedSFIndex, bool _vote) external onlyOwner {
        
        
        bytes32 _sfIndex = keccak256(Utility.strConcat(_flightNO, _flightDate));
        if (scheduledFlights[_sfIndex].isValued) {
            require(scheduledFlights[_sfIndex].status == SFStatus.opening);
            require(!isMemberInSF(_sfIndex, _member));
            // update scheduledFlights 的会员信息
            scheduledFlights[_sfIndex].members.push(_member);
        } else {
            SFInfo storage sfInfo = scheduledFlights[_sfIndex];
            sfInfo.members.push(_member);
            sfInfo.status = SFStatus.opening;
            sfInfo.isDelayed = false;
            sfInfo.isValued = true;
        }
        // update member info
        memberInfos[_member].memberSFInfos[_sfIndex] = MemberSF({
            votedSF: _votedSFIndex,
            vote: _vote,
            isValued: true});
        memberInfos[_member].scheduledFlights.push(_sfIndex);
        memberInfos[_member].isValued = true;    
    }
    /** @dev 检查用户是否加入航班计划 
      * @param _sfIndex 航班号+航班日期
      */
    function isInSF(bytes32 _sfIndex) public view returns (bool) {
        if (memberInfos[msg.sender].isValued) {
            var sfs = memberInfos[msg.sender].memberSFInfos;
            if (sfs[_sfIndex].isValued) {
                return true; 
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    /** @dev 返回用户的航班计划 
      */
    function returnSFs() public view returns (bytes32[]) {
        bytes32[] memory sfs = memberInfos[msg.sender].scheduledFlights;
        return sfs ;
    }
    /** @dev 返回用户的航班计划详细信息 
      * @param _sfIndex 航班号+航班日期
      */
    function returnSFInfo(bytes32 _sfIndex) public view returns (MemberSF) {
        MemberSF memory sfsInfo = memberInfos[msg.sender].memberSFInfos[_sfIndex];
        return sfsInfo ;
    }
    /** @dev 返回航班的所有加入会员 
      * @param _sfIndex 航班号+航班日期
      */
    function returnMembers(bytes32 _sfIndex) public view returns (address[]) {
        return scheduledFlights[_sfIndex].members;
    }
    
    function testDateParser(string datetime) public  returns (uint, uint, uint) {
       return Utility.checkDatetime(datetime);
    }
}
