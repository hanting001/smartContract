pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
contract WccPlayer is Ownable, Stoppable{
    WccStorage wccs;
    bytes32 public testOK;
    function WccPlayer(address wccsAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
    }

    function joinCheck(string p1, string p2, WccStorage.GameType gameType, uint value) public view returns(uint) {
        bytes32 index = keccak256(p1, p2, gameType);
        var (,,,,status,gameValued,) = wccs.games(index);
        if (!gameValued) {
            return 1; //game not exist
        }
        if (status != WccStorage.GameStatus.Playing) {
            return 2; //wrong status
        }
        if (value < 1 finney) {
            return 3; // too small chip
        }
        return 0;
    }
    event UserJoin(string p1, string p2, WccStorage.GameType gameType, string score, address user);
    function join(string p1, string p2, WccStorage.GameType gameType, string score) external payable stopInEmergency {
        require(joinCheck(p1, p2, gameType, msg.value) == 0);
        bytes32 scoreIndex = keccak256(score);
        
        wccs.userJoin(msg.sender, msg.value, p1, p2, gameType, score);
        testOK = scoreIndex;
        UserJoin(p1, p2, gameType, score, msg.sender);
    }
}