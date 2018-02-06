pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import "../../installed_contracts/solidity-stringutils/strings.sol";
import "./Utility.sol";

contract HbStorage is Ownable {
    using strings for *; 

    enum SFStatus { opening, closed, claiming, ended }
    enum DelayStatus { no, delay1, delay2, delay3 }

    event MemberAdded(bytes32 _sfIndex, address member);

    struct SFInfo {
        address[] members;
        SFStatus status;
        uint count;
        DelayStatus delayStatus;
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
        DelayStatus vote;
        bool isValued;
    }
    struct MemberInfo {
        mapping(bytes32 => MemberSF) memberSFInfos;
        bytes32[] scheduledFlights;
        uint winCounts;
        string canBuyFlightNO;
        bool isValued;
    }
    mapping(address => bool) admins;
    //已出单航班信息 {keccak256(航班号+日期): [SFInfo]}
    mapping(bytes32 => SFInfo) public scheduledFlights;
    //记录航班的投票信息 {keccak256(航班号+日期): [VoteInfo]}
    mapping(bytes32 => VoteInfo[])  public votes;
    //记录航班的历史延误信息 {keccak256(航班号+日期): SFHistroy}
    mapping(bytes32 => SFHistroy) public sfHistroy;
    //记录用户的航班信息
    mapping(address => MemberInfo) public memberInfos;

    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }

    /** @dev add address to admins list 
      * @param admin address
      */
    function setAdmin(address admin) public onlyOwner {
        if (!admins[admin]) {
            admins[admin] = true;
        }
    }

    /** @dev remove address from admins list 
      * @param admin address
      */
    function removeAdmin(address admin) public onlyOwner {
        admins[admin] = false;
    }

    // function HbStorage() public {
    //     // constructor
    // }
    function isMemberInSF(bytes32 _sfIndex, address member) external view returns (bool) {
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
    function getSFCount(bytes32 _sfIndex) external view returns (uint) {
        return scheduledFlights[_sfIndex].count;
    }
    function addMemberToSF(bytes32 _sfIndex, address _member, bytes32 _votedSFIndex, DelayStatus _vote) external onlyAdmin {
        if (!scheduledFlights[_sfIndex].isValued) {
            scheduledFlights[_sfIndex].isValued = true;
        }
        //航班记录中加入用户
        scheduledFlights[_sfIndex].members.push(_member);
        //用户数加1
        scheduledFlights[_sfIndex].count += 1;
        // 用户记录中加入航班
        memberInfos[_member].memberSFInfos[_sfIndex] = MemberSF({
            votedSF: _votedSFIndex,
            vote: _vote,
            isValued: true});
        memberInfos[_member].scheduledFlights.push(_sfIndex);
        memberInfos[_member].isValued = true;  

        MemberAdded(_sfIndex, _member);  
    }

    function isOpening(bytes32 _sfIndex) external returns (bool) {
        if (scheduledFlights[_sfIndex].status == SFStatus.opening) {
            return true;
        } else {
            return false;
        }
    }
    /** @dev 检查用户是否加入航班计划 
      * @param _sfIndex 航班号+航班日期
      */
    function isInSF(bytes32 _sfIndex) external view returns (bool) {
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
    function canBuy(address member, string flightNO) external returns (bool) {
        if (flightNO.toSlice().compare(memberInfos[member].canBuyFlightNO.toSlice()) == 0) {
            return true;
        } else {
            return false;
        }
    }
    function setCanBuy(address member, string flightNO) external onlyAdmin{
        memberInfos[member].canBuyFlightNO = flightNO;
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
}
