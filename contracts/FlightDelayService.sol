pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import './common/Stoppable.sol';
import './common/HbStorage.sol';
import './common/KnotToken.sol';
import './FlightDelay.sol';

/** @title group smart contract. */
contract FlightDelayService is Stoppable, Ownable {
    using SafeMath for uint256;
    HbStorage hbs;
    KnotToken token;
    mapping(bytes32 => mapping(address => bool)) paidInfos;
    uint public exchanged;
    mapping(address => uint) public withdraws;
    uint public rate = 4000;

    uint public testOK;
    function setRate(uint _rate) external onlyOwner {
        rate = _rate;
    }
    struct DelayPayInfo {
        uint times;
        uint payCount;
        bool isValued;
    }
    // uint public tokenCount = 0;
    mapping(uint => DelayPayInfo) public delayPayInfos;
    function FlightDelayService(address hbsAddress, address tokenAddress) public Stoppable(msg.sender) {
        hbs = HbStorage(hbsAddress);
        token = KnotToken(tokenAddress);
        delayPayInfos[uint(HbStorage.DelayStatus.no)] = DelayPayInfo({times: 0, payCount: getDelayClaimRate(HbStorage.DelayStatus.no), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay1)] = DelayPayInfo({times: 30, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay1), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay2)] = DelayPayInfo({times: 60, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay2), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.delay3)] = DelayPayInfo({times: 120, payCount: getDelayClaimRate(HbStorage.DelayStatus.delay3), isValued: true});
        delayPayInfos[uint(HbStorage.DelayStatus.cancel)] = DelayPayInfo({times: 999, payCount: getDelayClaimRate(HbStorage.DelayStatus.cancel), isValued: true});
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
        if ( status == HbStorage.DelayStatus.cancel) {
            return 30 * 15;
        }
    }
    /** @dev start Claim check
      * 
      */  
    function claimVoteCheck(bytes32 index) public view returns (uint) {
        if(!hbs.isMemberInSF(index, msg.sender)){
            return 1; // 没有加入改航班
        }
        var (,,status,,,,) = hbs.returnSFInfo(index);
        if(status != HbStorage.SFStatus.opening && status != HbStorage.SFStatus.closed) {
            return 2; // 航班状态不对
        }
        var (,,,,,,ended,,) = hbs.voteInfos(index);
        if (ended) {
            return 3; // 投票已结束
        }
        // 将来可能还需要增加日期间隔校验
        return 0;
    }

    /** @dev user start claim vote
      * @param index 航班号+航班日期的index
      */  
    function claimVote(bytes32 index) external stopInEmergency{
        require(claimVoteCheck(index) == 0);
        // require(hbs.isMemberInSF(index, msg.sender));
        // var (,,status,,,) = hbs.returnSFInfo(index);
        // require(status == HbStorage.SFStatus.opening);
        // 改变航班状态
        hbs.changeSFStatus(index, HbStorage.SFStatus.claiming);
        // 增加一条投票记录
        // hbs.updateVote(index, vote);
        bytes32 currentVote = hbs.currentVote();
        var (,,,,,,isCurrentVoteValued) = hbs.voteInfos(currentVote);
        if (!isCurrentVoteValued) {
            //当前还没有进行中的投票就设置一个
            hbs.setCurrentVote(index);
        }
        testOK = block.number;
    }

    function claimCheck(bytes32 index) public returns(uint) {
        if(!hbs.isMemberInSF(index, msg.sender)){
            return 1; // 没有加入改航班
        }
        var (,,status,,,,) = hbs.returnSFInfo(index);
        if(status != HbStorage.SFStatus.ended) {
            return 2; // 航班状态不对
        }
        if (paidInfos[index][msg.sender]) {
            return 3; // 已经赔付过了
        }
        // 将来可能还需要增加日期间隔校验
        return 0;        
    }
    function claim(bytes32 index) external stopInEmergency {
        require(claimCheck(index) == 0);
        var (delay1Counts, delay2Counts, delay3Counts, cancelCounts, noCounts,,,,) = hbs.voteInfos(index);
        HbStorage.DelayStatus status = HbStorage.DelayStatus.no;
        if (noCounts < delay1Counts) {
            status = HbStorage.DelayStatus.delay1;
        }
        if (delay1Counts < delay2Counts) {
            status = HbStorage.DelayStatus.delay2;
        }
        if (delay2Counts < delay3Counts) {
            status = HbStorage.DelayStatus.delay3;
        }
        if (delay3Counts < cancelCounts) {
            status = HbStorage.DelayStatus.cancel;
        } 
        uint payCount = delayPayInfos[uint(status)].payCount;
        if (payCount > 0) {
            withdraws[msg.sender] = withdraws[msg.sender].add(payCount * 1 ether);
            paidInfos[index][msg.sender] == true;
        }
    }
    function withdraw() external stopInEmergency {
        uint value = withdraws[msg.sender];
        require(value > 0);
        if(token.transfer(msg.sender, value)) {
            withdraws[msg.sender] = 0;
        }
    }
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
            msg.sender.transfer(eth);
        }
    }
} 