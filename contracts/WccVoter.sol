pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
import './common/KnotToken.sol';
contract WccVoter is Ownable, Stoppable{
    WccStorage wccs;
    KnotToken token;
    uint public testOK;
    mapping(bytes32 => bool) canEnd;
    mapping(address => bool) judges;
    modifier onlyJudge() {
        require(judges[msg.sender]);
        _;
    }
    function setJudge(address judge) public onlyOwner {
        if (!judges[judge]) {
            judges[judge] = true;
        }
    }
    function WccVoter(address wccsAddress, address tokenAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
        token = KnotToken(tokenAddress);
        judges[msg.sender] = true;
    }
    function startVoteCheck(bytes32 _gameIndex) public view returns(uint) {
        var (,,,,status,,gameValued,) = wccs.games(_gameIndex);
        if (!gameValued) {
            return 1; //game not exist
        }
        if (status != WccStorage.GameStatus.Playing) {
            return 2; //wrong status
        }
        return 0;
    }
    event StartVote(bytes32 _gameIndex, string _result);
    function startVote(bytes32 _gameIndex, string _result) external stopInEmergency onlyJudge {
        require(startVoteCheck(_gameIndex) == 0);
        // change game status to Voting
        wccs.setGameStatus(_gameIndex, WccStorage.GameStatus.Voting);
        // create new Vote info
        wccs.setVote(_gameIndex, _result);
        testOK = block.number;
        StartVote(_gameIndex, _result);
    }


    function voteCheck(bytes32 _gameIndex) public view returns(uint) {
        var (,,,,status,,gameValued,) = wccs.games(_gameIndex);
        if (!gameValued) {
            return 1; //game not exist
        }
        if (status != WccStorage.GameStatus.Voting) {
            return 2; //wrong status
        }
        var (,,,,ended,voteValued) = wccs.voteInfos(_gameIndex);
        if (ended) {
            return 3; //vote ended
        }
        if (!voteValued) {
            return 4; //vote not exist
        }
        if (wccs.userVotes(_gameIndex, msg.sender) > 0) {
            return 5; //has voted
        }
        if (token.balanceOf(msg.sender) == 0) {
            return 6; //no vote token
        }
        return 0;
    }
    event UserVote(bytes32 _gameIndex, bool yesOrNo, address user);
    function vote(bytes32 _gameIndex, bool yesOrNo) external stopInEmergency {
        require(voteCheck(_gameIndex) == 0);
        // add vote info
        wccs.setUserVote(_gameIndex, yesOrNo, msg.sender, token.balanceOf(msg.sender));
        testOK = block.number;
        UserVote(_gameIndex, yesOrNo, msg.sender);
    }


    function setCanEnd(bytes32 _gameIndex) external stopInEmergency onlyJudge {
        // 需要增加能够设置可以结束的条件判断
        canEnd[_gameIndex] = true;
    }
    function endVoteCheck(bytes32 _gameIndex) public view returns(uint) {
        var (,,,,status,,gameValued,) = wccs.games(_gameIndex);
        if (!gameValued) {
            return 1; //game not exist
        }
        if (status != WccStorage.GameStatus.Voting) {
            return 2; //wrong status
        }
        if (!canEnd[_gameIndex]) {
            return 3; // can not end
        }
        return 0;
    }
    event EndVote(bytes32 _gameIndex);
    function endVote(bytes32 _gameIndex) external stopInEmergency {
        require(endVoteCheck(_gameIndex) == 0);
        // change game status to Voting
        wccs.setGameStatus(_gameIndex, WccStorage.GameStatus.Paying);
        // update new Vote info
        var (,yesCount,noCount,,,) = wccs.voteInfos(_gameIndex);
        // 这个结束条件还需要调整
        if ((yesCount + noCount) - noCount > (yesCount + noCount) / 10) {
            wccs.updateVote(_gameIndex, true, true);
        }
        testOK = block.number;
        EndVote(_gameIndex);
    }
}