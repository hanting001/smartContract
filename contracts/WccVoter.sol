pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';
contract WccVoter is Ownable, Stoppable{
    WccStorage wccs;
    KnotToken token;
    function WccVoter(address wccsAddress, address tokenAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
        token = KnotToken(tokenAddress);
    }
}