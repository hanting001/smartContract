pragma solidity ^0.4.18;

import './common/Stoppable.sol';
import './common/HbStorage.sol';
import './common/KnotToken.sol';

/** @title group smart contract. */
contract FlightDelayService is Stoppable{
    HbStorage hbs;
    KnotToken token;
    uint public testOK;
    function FlightDelayService(address hbsAddress, address tokenAddress) public Stoppable(msg.sender){
        hbs = HbStorage(hbsAddress);
        token = KnotToken(tokenAddress);
    }

    /** @dev start Claim check
      * 
      */  
    function claimCheck(bytes32 index) public view returns (uint8) {
        if(!hbs.isMemberInSF(index, msg.sender)){
            return 1;
        }
        var (,,status,,,) = hbs.returnSFInfo(index);
        if(status != HbStorage.SFStatus.opening) {
            return 2;
        }
        // 将来可能还需要增加日期间隔校验
        return 0;
    }
    /** @dev user start claim
      * @param index 航班号+航班日期的index
      * @param vote 延误类型
      */  
    function claim(bytes32 index, HbStorage.DelayStatus vote) external stopInEmergency{
        require(claimCheck(index) == 0);
        
        // 改变航班状态
        hbs.changeSFStatus(index, HbStorage.SFStatus.claiming);
        // 增加一条投票记录
        hbs.updateVote(index, vote);
        bytes32 currentVote = hbs.currentVote();
        var (,,,,,,isCurrentVoteValued) = hbs.voteInfos(currentVote);
        if (!isCurrentVoteValued) {
            //当前还没有进行中的投票就设置一个
            hbs.setCurrentVote(index);
        }
        testOK = block.number;
    }
} 