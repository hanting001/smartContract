pragma solidity ^0.4.18;

import './common/HbStorage.sol';

/** @title group smart contract. */
contract FlightDelayService {
    HbStorage hbs;
    function FlightDelayService(address hbsAddress) {
        hbs = HbStorage(hbsAddress);
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
    function claim(bytes32 index, HbStorage.DelayStatus vote) external {
        bytes32 currentVote = hbs.currentVote();
        var (,,,,,isValued) = hbs.voteInfos(currentVote);

        if (!isValued) {
            //当前还没有进行中的投票
        }
    }
} 