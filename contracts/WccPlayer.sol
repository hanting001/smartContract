pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
contract WccPlayer is Ownable, Stoppable{
    WccStorage wccs;
    function WccPlayer(address wccsAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
    }

    function joinCheck(string p1, string p2, WccStorage.GameType gameType) public view returns(uint) {
        bytes32 index = keccak256(p1, p2, gameType);
        var (,,,status,gameValued) = wccs.games(index);
        if (!gameValued) {
            return 1; //game not exist
        }
        if (status != WccStorage.GameStatus.Playing) {
            return 2; //wrong status
        }
        return 0;
    }
    function join(string p1, string p2, WccStorage.GameType gameType, string score) external payable stopInEmergency {
        require(joinCheck(p1, p2, gameType) == 0);
    }
}