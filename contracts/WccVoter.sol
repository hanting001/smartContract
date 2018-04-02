pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';
contract WccVoter is Ownable, Stoppable{
    WccStorage wccs;
    KnotToken token;
    uint public testOK;
    function WccVoter(address wccsAddress, address tokenAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
        token = KnotToken(tokenAddress);
    }
    function startVoteCheck(bytes32 _gameIndex) public view returns(uint) {
        var (,,,,,gameValued,) = wccs.games(_gameIndex);
        if (!gameValued) {
            return 1; //game not exist
        }
        return 0;
    }
    function startVote(bytes32 _gameIndex, string _result) external stopInEmergency onlyOwner {
        require(startVoteCheck(_gameIndex) == 0);
        // change game status to Voting
        wccs.setGameStatus(_gameIndex, WccStorage.GameStatus.Voting);
        // create new Vote info
        wccs.setVote(_gameIndex, _result);
        testOK = block.number;
    }
}