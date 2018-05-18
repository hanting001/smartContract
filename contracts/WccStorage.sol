pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
contract WccStorage is Ownable {
    using SafeMath for uint256;
    enum GameType { First_stage, Round_of_16, Quarter_finals, Semi_finals, For_third, Final }
    enum GameStatus { Standby, Playing, Voting, Paying, End}
    mapping(address => bool) public admins;
    modifier onlyAdmin() {
        require(admins[msg.sender]);
        _;
    }
    function setAdmin(address admin) public onlyOwner {
        if (!admins[admin]) {
            admins[admin] = true;
        }
    }
    struct GameInfo {
        string p1;
        string p2;
        uint time;
        GameType gameType;
        GameStatus status;
        uint i;
    }
    struct PlayerName {
        string p1;
        string p2;
    }
    mapping(bytes32 => GameInfo) public games;
    mapping(bytes32 => PlayerName) public playerNames;
    bytes32[] public gameIndexes;
    uint public gamesUpdated;

    struct ScoreTotal {
        string score;
        uint totalValue;
        uint totalBets;
    }
    // gameIndex => scoreIndex[]
    mapping(bytes32 => bytes32[]) gameScoreIndexes;
    // gameIndex => scoreIndex => scoreTotalInfo
    mapping(bytes32 => mapping(bytes32 => ScoreTotal)) public gameScoreTotalInfos;
    function setGame(string _p1, string _p2, GameType _gameType, uint _time) external onlyOwner {
        bytes32 index = keccak256(_p1, _p2, _gameType);
        require(games[index].time == 0);
        uint i = gameIndexes.push(index) - 1;
        games[index] = GameInfo({
            p1: _p1,
            p2: _p2,
            time: _time,
            gameType: _gameType,
            status: GameStatus.Standby,
            i: i
        });
    }
    function gamesUpdate() external onlyOwner {
        gamesUpdated = block.timestamp;
    }
    function setGame(bytes32 _index, string _p1, string _p2, GameType _gameType, uint _time) external onlyOwner {
        require(games[_index].time == 0);
        uint i = gameIndexes.push(_index) - 1;
        games[_index] = GameInfo({
            p1: _p1,
            p2: _p2,
            time: _time,
            gameType: _gameType,
            status: GameStatus.Standby,
            i: i
        });
    }
    function setPlayer(bytes32 _index, string _p1, string _p2) external onlyOwner {
        require(games[_index].time > 0);
        playerNames[_index] = PlayerName({
            p1: _p1,
            p2: _p2
        });
    }
    function arrayRemove(bytes32[] storage array, uint index) internal {
        if (index >= array.length) return;
        for (uint i = index; i<array.length-1; i++){
            array[i] = array[i+1];
        }
        array.length--;
    }
    function removeGame(bytes32 _gameIndex) external onlyOwner {
        require(games[_gameIndex].time > 0);
        require(games[_gameIndex].status == GameStatus.Standby);
        uint i = games[_gameIndex].i;
        delete games[_gameIndex];
        arrayRemove(gameIndexes, i);
    }
    mapping(address => bytes32[]) userJoinedGameIndexes;
    struct Score {
        string score;
        uint value;
        bool paid;
    }
    // mapping(bytes32 => mapping(address => bool)) public joinedGames;
    // mapping(bytes32 => mapping(address => bytes32[])) public joinedGamesScoreIndexes;
    mapping(bytes32 => mapping(address => mapping(bytes32 => Score))) public joinedGamesScoreInfo;

    
    function userJoin(address user, uint value, bytes32 gameIndex, string score, bytes32 scoreIndex) external onlyAdmin {
        // bytes32 scoreIndex = keccak256(score);

        setGameScoreTotalIndex(gameIndex, scoreIndex);
        setGameScoreTotalInfo(gameIndex, scoreIndex, score, value);
        setUserJoinedGameIndexes(user, gameIndex);
        // setJoinedGame(user, gameIndex);
        // setJoinedGameScoreIndex(user, gameIndex, scoreIndex);
        setJoinedGameScoreInfo(user, gameIndex, scoreIndex, score, value);
    }

    function setGameScoreTotalIndex(bytes32 _gameIndex, bytes32 _scoreIndex) private {
        if (gameScoreTotalInfos[_gameIndex][_scoreIndex].totalBets == 0) {
            gameScoreIndexes[_gameIndex].push(_scoreIndex);
        }
    }
    function setGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) private {
        if (gameScoreTotalInfos[_gameIndex][_scoreIndex].totalBets > 0) {
            gameScoreTotalInfos[_gameIndex][_scoreIndex].totalValue = gameScoreTotalInfos[_gameIndex][_scoreIndex].totalValue.add(_value);
            gameScoreTotalInfos[_gameIndex][_scoreIndex].totalBets ++;
        } else {
            gameScoreTotalInfos[_gameIndex][_scoreIndex] = ScoreTotal({
                score: _score,
                totalValue: _value,
                totalBets: 1
            });
        }
        // games[_gameIndex].totalValue = games[_gameIndex].totalValue.add(_value);
        // games[_gameIndex].totalBets ++; 
    }
    function setUserJoinedGameIndexes(address _user, bytes32 _gameIndex) private {
        bool exist = false;
        for (uint8 index = 0; index < userJoinedGameIndexes[_user].length; index ++) {
            if (userJoinedGameIndexes[_user][index] == _gameIndex) {
                exist = true;
                break;
            }
        }
        if(!exist) {
            userJoinedGameIndexes[_user].push(_gameIndex);
        }
    }
    // function setJoinedGame(address _user, bytes32 _gameIndex) private {
    //     if(!joinedGames[_gameIndex][_user]) {
    //         joinedGames[_gameIndex][_user] = true;
    //     }
    // }
    // function setJoinedGameScoreIndex(address _user, bytes32 _gameIndex, bytes32 _scoreIndex) private {
    //     if(joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value == 0) {
    //         joinedGamesScoreIndexes[_gameIndex][_user].push(_scoreIndex);
    //     }
    // }
    function setJoinedGameScoreInfo(address _user, bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) internal {
        if(joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value > 0) {
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value = joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value.add(_value);
        } else {
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex] = Score({
                score: _score,
                value: _value,
                paid: false
            });
        }
    }
    function setGameStatus(bytes32 _gameIndex, GameStatus _status) external onlyAdmin {
        if (games[_gameIndex].time > 0) {
            games[_gameIndex].status = _status;
        }
    }
    function getAllGameIndexes() public view returns(bytes32[]) {
        return gameIndexes;
    }
    function getGameInfo(bytes32 _gameIndex) public view returns(string p1, string p2, uint time, GameType gameType, GameStatus status, uint totalValue, uint totalBets) {
        GameInfo storage gameInfo = games[_gameIndex];
        for (uint8 index = 0; index < gameScoreIndexes[_gameIndex].length; index ++ ) {
            totalValue = totalValue.add(gameScoreTotalInfos[_gameIndex][gameScoreIndexes[_gameIndex][index]].totalValue);
            totalBets = totalBets.add(gameScoreTotalInfos[_gameIndex][gameScoreIndexes[_gameIndex][index]].totalBets);
        }
        return (gameInfo.p1, gameInfo.p2, gameInfo.time, gameInfo.gameType, gameInfo.status, totalValue, totalBets);
    }
    function getGameTotalValue(bytes32 _gameIndex) public view returns(uint totalValue) {
        for (uint8 index = 0; index < gameScoreIndexes[_gameIndex].length; index ++ ) {
            totalValue = totalValue.add(gameScoreTotalInfos[_gameIndex][gameScoreIndexes[_gameIndex][index]].totalValue);
        }
        return totalValue;
    }
    function getGameScoreIndexes(bytes32 _gameIndex) public view returns(bytes32[]) {
        return gameScoreIndexes[_gameIndex];
    }
    function getGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint totalValue, uint totalBets) {
        ScoreTotal storage scoreTotal = gameScoreTotalInfos[_gameIndex][_scoreIndex];
        return (scoreTotal.score, scoreTotal.totalValue, scoreTotal.totalBets);
    }
    function getUserJoinedGameIndexes() public view returns(bytes32[]){
        return userJoinedGameIndexes[msg.sender];
    }
    function isJoinedGame(bytes32 _gameIndex) public view returns(bool) {
        for (uint8 index = 0; index < userJoinedGameIndexes[msg.sender].length; index ++) {
            if (userJoinedGameIndexes[msg.sender][index] == _gameIndex) {
                return true;
            }
        }
        return false;
    }
    // function getUserJoinedGameScoreIndexes(bytes32 _gameIndex) public view returns(bytes32[]) {
    //     return joinedGamesScoreIndexes[_gameIndex][msg.sender];
    // }
    function getUserJoinedGameScoreInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint value, bool paid) {
        Score storage scoreInfo = joinedGamesScoreInfo[_gameIndex][msg.sender][_scoreIndex];
        return (scoreInfo.score, scoreInfo.value, scoreInfo.paid);
    }
    function setUserScorePaid(bytes32 _gameIndex, bytes32 _scoreIndex, address user) external onlyAdmin {
        joinedGamesScoreInfo[_gameIndex][user][_scoreIndex].paid = true;
    }
}
