pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
contract WccWinner is Ownable, Stoppable{
    WccStorage wccs;
    
    function WccWinner(address wccsAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
    }


}