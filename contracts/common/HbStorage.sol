pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import "../../installed_contracts/solidity-stringutils/strings.sol";
import "./Utility.sol";

contract HbStorage is Ownable {
    using strings for *; 
    using SafeMath for uint256;
    uint public voteEndInterval = 100; // 投票可以结束的最小间隔
    uint public voteEndThreshold = 10; // 投票可以结束的最小投票数
    function setVoteEndInterval(uint _interval) external onlyOwner {
        voteEndInterval = _interval;
    }
    function setVoteThreshold(uint _threshold) external onlyOwner {
        voteEndThreshold = _threshold;
    }
    enum SFStatus { opening, closed, claiming, ended }
    enum DelayStatus { no, delay1, delay2, delay3, cancel }

    event MemberAdded(bytes32 _sfIndex, address member);

    struct SFInfo {
        address[] members;
        string flightNO;
        string flightDate;
        SFStatus status;
        uint count;
        uint price;
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
        // VotedMember[] votedMembers;
        uint delay1Counts;
        uint delay2Counts;
        uint delay3Counts;
        uint cancelCounts;
        uint noCounts;
        uint startNum;
        bool ended;
        address ender;
        bool isValued;
    }
    struct MemberSF {
        // bytes32 flightIndex;
        // string flightNO;
        // string flightDate;
        uint time;
        bytes32 votedSF;
        DelayStatus vote;
        bool isValued;
    }
    struct MemberInfo {
        mapping(bytes32 => MemberSF) memberSFs;
        uint winCounts;
        mapping(bytes32 => bool) canClaim;
        bool isValued;
    }
    // struct MemberInfo {
    //     bytes32[] scheduledFlights;
    //     mapping(bytes32 => MemberSF) memberSFs;
    //     // uint winCounts;
    //     // mapping(bytes32 => bool) canClaim;
    //     bool isValued;
    // }
    mapping(address => bool) public admins;
    //已出单航班信息 {keccak256(航班号+日期): [SFInfo]}
    mapping(bytes32 => SFInfo) public scheduledFlights;
    //记录航班的投票信息 {keccak256(航班号+日期): [VoteInfo]}
    mapping(bytes32 => VoteInfo)  public voteInfos;
    //当前需要投票的航班，该投票结束后清零或者赋值下一个需要投票的航班
    bytes32[] public  currentVotes;
    //记录航班的历史延误信息 {keccak256(航班号+日期): SFHistroy}
    mapping(bytes32 => SFHistroy) public sfHistroy;
    //记录用户的航班信息
    mapping(address => MemberInfo) public memberInfos;
    mapping(address => bytes32[]) public memberSFs;

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
    function isMemberInSF(bytes32 _sfIndex, address member) public view returns (bool) {
        if (memberInfos[member].isValued) {
            var sfs = memberInfos[member].memberSFs;
            if (sfs[_sfIndex].isValued) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    function getSFCount(bytes32 _sfIndex) public view returns (uint) {
        return scheduledFlights[_sfIndex].count;
    }
    function getScheduledFlights() external view returns (bytes32[]) {
        return memberSFs[msg.sender];
    }
    function addMemberToSF(bytes32 _sfIndex, string _flightNO, string _flightDate, address _member, bytes32 _votedSFIndex, DelayStatus _vote,uint _price) public onlyAdmin {
        if (!scheduledFlights[_sfIndex].isValued) {
            scheduledFlights[_sfIndex].isValued = true;
        }
        //航班记录中加入用户
        scheduledFlights[_sfIndex].members.push(_member);
        //用户数加1
        scheduledFlights[_sfIndex].count += 1;
        scheduledFlights[_sfIndex].flightNO = _flightNO;
        scheduledFlights[_sfIndex].flightDate = _flightDate;
        scheduledFlights[_sfIndex].price = _price;
        // 用户记录中加入航班
        memberInfos[_member].memberSFs[_sfIndex] = MemberSF({
            // flightIndex: _sfIndex,
            time: block.timestamp,
            votedSF: _votedSFIndex,
            vote: _vote,
            isValued: true});
        memberSFs[_member].push(_sfIndex);
        memberInfos[_member].isValued = true;  

        MemberAdded(_sfIndex, _member);  
    }
    function setClose(bytes32 _sfIndex) public onlyAdmin{
        scheduledFlights[_sfIndex].status = SFStatus.closed;
    }
    function isOpening(bytes32 _sfIndex) public view returns (bool) {
        if (scheduledFlights[_sfIndex].status == SFStatus.opening) {
            return true;
        } else {
            return false;
        }
    }
    /** @dev 检查用户是否加入航班计划 
      * @param _sfIndex 航班号+航班日期
      */
    function isInSF(bytes32 _sfIndex) public view returns (bool) {
        return isMemberInSF(_sfIndex, msg.sender);
    }
    // function canClaim(address member, bytes32 _sfIndex) public returns (bool) {
    //     // if (flightNO.toSlice().compare(memberInfos[member].canClaim.toSlice()) == 0) {
    //     //     return true;
    //     // } else {
    //     //     return false;
    //     // }
    //     // return memberInfos[member].canClaim[_sfIndex];
    //     return false;
    // }
    // function setCanBuy(address member, bytes32 _sfIndex) public onlyAdmin{
    //     memberInfos[member].canClaim[_sfIndex] = true;
    // }
    /** @dev 返回用户的航班计划详细信息 
      * @param _sfIndex 航班号+航班日期
      */
    function returnMemberSFInfo(bytes32 _sfIndex) public view returns (
        uint time,
        bytes32 votedSF, 
        DelayStatus vote, 
        bool isValued) {
        MemberSF memory sfsInfo = memberInfos[msg.sender].memberSFs[_sfIndex];
        return (sfsInfo.time, sfsInfo.votedSF, sfsInfo.vote, sfsInfo.isValued) ;
    }
    /** @dev 返回航班的所有加入会员 
      * @param _sfIndex 航班号+航班日期
      */
    function returnMembers(bytes32 _sfIndex) public view returns (address[]) {
        return scheduledFlights[_sfIndex].members;
    }
    /** @dev 返回会员的所有航班 
      */   
    function returnMemberSFs() public view returns(bytes32[]) {
        return memberSFs[msg.sender];
    }
    /** @dev 返回航班相关信息 
      * @param _sfIndex 航班号+航班日期
      */
    function returnSFInfo(bytes32 _sfIndex) public view returns (string flightNO,
        string flightDate, SFStatus status, uint count,
        DelayStatus delayStatus,
        bool isValued,uint price) {
        return (scheduledFlights[_sfIndex].flightNO,  scheduledFlights[_sfIndex].flightDate, scheduledFlights[_sfIndex].status, scheduledFlights[_sfIndex].count, scheduledFlights[_sfIndex].delayStatus, scheduledFlights[_sfIndex].isValued, scheduledFlights[_sfIndex].price);
    }
    function changeSFStatus(bytes32 index, SFStatus status) external onlyAdmin{
        if (scheduledFlights[index].status != status) {
            scheduledFlights[index].status = status;
        }
    }
    function endVote(bytes32 index, address user) external onlyAdmin {
        scheduledFlights[index].status = SFStatus.ended;
        voteInfos[index].ended = true;
        voteInfos[index].ender = user;
        toNextVote();
    }
    function endVoteByAdmin(bytes32 index) external onlyOwner {
        require(checkCanEndByAdmin(index));
        scheduledFlights[index].status = SFStatus.ended;
        voteInfos[index].ended = true;
        voteInfos[index].ender = msg.sender;
        toNextVote();
    }
     /** @dev 判段管理员是否可以结束投票 
      * @param _sfIndex 航班索引
      */ 
    function checkCanEndByAdmin(bytes32 _sfIndex) internal view returns(bool canEnd){
        VoteInfo storage voteInfo = voteInfos[_sfIndex];
        uint totalCounts = voteInfo.delay1Counts.add(voteInfo.delay2Counts).add(voteInfo.delay3Counts).add(voteInfo.cancelCounts).add(voteInfo.noCounts);
        if (block.number.sub(voteInfo.startNum) > voteEndInterval && totalCounts <= voteEndThreshold) {
            return true;
        } else {
            return false;
        }
    }

    //vote a vote
    function updateVote(bytes32 _sfIndex, DelayStatus vote) external onlyAdmin{
        VoteInfo storage voteInfo = voteInfos[_sfIndex];
        if (!voteInfo.isValued) {
            voteInfo.isValued = true;
            voteInfo.startNum = block.number;
        }
        if (vote == DelayStatus.no) {
            voteInfo.noCounts += 1;
        }
        if (vote == DelayStatus.delay1) {
            voteInfo.delay1Counts += 1;
        }
        if (vote == DelayStatus.delay2) {
            voteInfo.delay2Counts += 1;
        }
        if (vote == DelayStatus.delay3) {
            voteInfo.delay3Counts += 1;
        }
        if (vote == DelayStatus.cancel) {
            voteInfo.cancelCounts += 1;
        }
    }

    //add a new vote process
    //when duplicate, do nothing    
    function addVote(bytes32 _sfIndex) external onlyAdmin {
        for (uint i = 0; i<currentVotes.length; i++){
            if(currentVotes[i] == _sfIndex){
                return;
            }
        }
        currentVotes.push(_sfIndex);
        return;
    }

    //step to next vote process
    function toNextVote() internal {
        arrayRemove(currentVotes, 0);
    }

     function getCurrentVotes() external returns(bytes32[]){
        return currentVotes;
    }



    /** utilities */

    function arrayRemove(bytes32[] storage array, uint index) internal {
        if (index >= array.length) return;
        for (uint i = index; i<array.length-1; i++){
            array[i] = array[i+1];
        }
        array.length--;
    }

}
