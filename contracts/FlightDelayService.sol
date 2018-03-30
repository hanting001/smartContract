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

    /** @dev get user`s sf
      * 
      */  
    // function getSFs() view returns (bytes32[]) {
    //     return hbs.memberSFs(msg.sender);
    // }
    /** @dev user start claim
      * @param index 航班号+航班日期的index
      * @param vote 延误类型
      */  
    function claim(bytes32 index, HbStorage.DelayStatus vote) external stopInEmergency{
        require(hbs.isMemberInSF(index, msg.sender));
        // 将来可能还需要增加日期间隔校验
        // 改变航班状态
        hbs.changeSFStatus(index, HbStorage.SFStatus.claiming);
        // 增加一条投票记录
        hbs.updateVote(index, vote);
        bytes32 currentVote = hbs.currentVote();
        var (,,,,,,isCurrentVoteValued) = hbs.voteInfos(currentVote);
        if (!isCurrentVoteValued) {
            //当前还没有进行中的投票
            hbs.setCurrentVote(index);
        }
        testOK = block.number;
    }
} 