pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import './WccStorage.sol';
import './common/Stoppable.sol';
contract WccPlayer is Ownable, Stoppable{
    WccStorage wccs;
    bytes32 public testOK;
    mapping(address => uint) withdraws;
    
    function WccPlayer(address wccsAddress) public Stoppable(msg.sender){
        wccs = WccStorage(wccsAddress);
    }

    function joinCheck(string p1, string p2, WccStorage.GameType gameType, uint value) public view returns(uint) {
        bytes32 index = keccak256(p1, p2, gameType);
        var (,,,,status,,gameValued,) = wccs.games(index);
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


    function isWin(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(bool win, uint value) {
        var (target,,,,,) = wccs.voteInfos(_gameIndex);
        var (, myValue,,) = wccs.joinedGamesScoreInfo(_gameIndex, msg.sender, _scoreIndex);
        return (false, 0);
        if (target == _scoreIndex) { // win
            var (,totalWinValue,) = wccs.gameScoreTotalInfos(_gameIndex, _scoreIndex);
            var (,,,,,totalValue,,) = wccs.games(_gameIndex);
            return (true, (totalValue / totalWinValue) * myValue);
        } else {
            return (false, 0);
        }
    }

    function claimCheck(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(uint) {
        var (,,, passed, ended,) = wccs.voteInfos(_gameIndex);
        var (win, winValue) = isWin(_gameIndex, _scoreIndex);
        if (!ended) {
            return 1; // vote not finish
        }
        if (!passed) {
            return 2; // vote not passed
        }
        if(!win) {
            return 3; // not win
        }
        var (,,paid,) = wccs.joinedGamesScoreInfo(_gameIndex, msg.sender, _scoreIndex);
        if (paid) {
            return 4; //paid
        }
        return 0;
    }
    event UserClaim(bytes32 _gameIndex, bytes32 _scoreIndex, address user);
    function claim(bytes32 _gameIndex, bytes32 _scoreIndex) external {
        require(claimCheck(_gameIndex, _scoreIndex) == 0);
        var (, winValue) = isWin(_gameIndex, _scoreIndex);
        wccs.setUserScorePaid(_gameIndex, _scoreIndex, msg.sender);
        withdraws[msg.sender] += winValue;
        UserClaim(_gameIndex, _scoreIndex, msg.sender);
    }

    event UserWithdraw(address user, uint value);
    function withdraw() external stopInEmergency {
        uint value = withdraws[msg.sender];
        require(value > 0);
        withdraws[msg.sender] = 0;
        msg.sender.transfer(value / 10 * 9);
        UserWithdraw(msg.sender, value / 10 * 9);
    }
}