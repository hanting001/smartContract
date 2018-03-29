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
} 