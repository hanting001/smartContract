pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
contract WccStorage is Ownable {
    enum GameType { First_stage, Round_of_16, Quarter_finals, Semi_finals, Final }
    enum GameStatus { Playing, Voting, Paying, End}
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
        bool isValued;
        uint i;
    }
    mapping(bytes32 => GameInfo) public games;
    bytes32[] gameIndexes;
    struct ScoreTotal {
        string score;
        uint total;
        bool isValued;
    }
    // gameIndex => scoreIndex[]
    mapping(bytes32 => bytes32[]) gameScoreIndexes;
    // gameIndex => scoreIndex => scoreTotalInfo
    mapping(bytes32 => mapping(bytes32 => ScoreTotal)) gameScoreTotalInfos;
    function setGame(string _p1, string _p2, GameType _gameType, uint _time) external onlyOwner {
        bytes32 index = keccak256(_p1, _p2, _gameType);
        uint i = gameIndexes.push(index) - 1;
        games[index] = GameInfo({
            p1: _p1,
            p2: _p2,
            time: _time,
            gameType: _gameType,
            status: GameStatus.Playing,
            isValued: true,
            i: i
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
        uint i = games[_gameIndex].i;
        delete games[_gameIndex];
        arrayRemove(gameIndexes, i);
    }

    mapping(address => bytes32[]) userJoinedGameIndexes;
    struct Score {
        string score;
        uint value;
        bool isValued;
    }
    mapping(bytes32 => mapping(address => bool)) public joinedGames;
    mapping(bytes32 => mapping(address => bytes32[])) public joinedGamesScoreIndexes;
    mapping(bytes32 => mapping(address => mapping(bytes32 => Score))) public joinedGamesScoreInfo;

    struct VoteInfo {
        string target;
        uint yesCount;
        uint noCount;
        bool passed;
        bool ended;
        bool isValued;
    }
    mapping(bytes32 => VoteInfo) voteInfos;

    function userJoin(address user, uint value, string p1, string p2, WccStorage.GameType gameType, string score) external onlyAdmin{
        bytes32 gameIndex = keccak256(p1, p2, gameType);
        bytes32 scoreIndex = keccak256(score);
        
        setGameScoreTotalIndex(gameIndex, scoreIndex);
        setGameScoreTotalInfo(gameIndex, scoreIndex, score, value);
        setUserJoinedGameIndexes(user, gameIndex);
        setJoinedGame(user, gameIndex);
        setJoinedGameScoreIndex(user, gameIndex, scoreIndex);
        setJoinedGameScoreInfo(user, gameIndex, scoreIndex, score, value);
    }

    function setGameScoreTotalIndex(bytes32 _gameIndex, bytes32 _scoreIndex) private {
        if (!gameScoreTotalInfos[_gameIndex][_scoreIndex].isValued) {
            gameScoreIndexes[_gameIndex].push(_scoreIndex);
        }
    }
    function setGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) private {
        if (gameScoreTotalInfos[_gameIndex][_scoreIndex].isValued) {
            gameScoreTotalInfos[_gameIndex][_scoreIndex].total += _value;
        } else {
            gameScoreTotalInfos[_gameIndex][_scoreIndex] = ScoreTotal({
                score: _score,
                total: _value,
                isValued: true
            });
        }
    }
    function setUserJoinedGameIndexes(address _user, bytes32 _gameIndex) private {
        if(!joinedGames[_gameIndex][_user]) {
            userJoinedGameIndexes[_user].push(_gameIndex);
        }
    }
    function setJoinedGame(address _user, bytes32 _gameIndex) private {
        if(!joinedGames[_gameIndex][_user]) {
            joinedGames[_gameIndex][_user] = true;
        }
    }
    function setJoinedGameScoreIndex(address _user, bytes32 _gameIndex, bytes32 _scoreIndex) private {
        if(!joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].isValued) {
            joinedGamesScoreIndexes[_gameIndex][_user].push(_scoreIndex);
        }
    }
    function setJoinedGameScoreInfo(address _user, bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) internal {
        if(joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].isValued) {
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value += _value;
        } else {
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex] = Score({
                score: _score,
                value: _value,
                isValued: true
            });
        }
    }

    function getAllGameIndexes() public view returns(bytes32[]) {
        return gameIndexes;
    }
    function getGameInfo(bytes32 _gameIndex) public view returns(string p1, string p2, uint time, GameType gameType, GameStatus status, bool isValued) {
        return (games[_gameIndex].p1, games[_gameIndex].p2, games[_gameIndex].time, games[_gameIndex].gameType, games[_gameIndex].status, games[_gameIndex].isValued);
    }
    function getGameScoreIndexes(bytes32 _gameIndex) public view returns(bytes32[]) {
        return gameScoreIndexes[_gameIndex];
    }
    function getGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint total, bool isValued) {
        return (gameScoreTotalInfos[_gameIndex][_scoreIndex].score, gameScoreTotalInfos[_gameIndex][_scoreIndex].total, gameScoreTotalInfos[_gameIndex][_scoreIndex].isValued);
    }
    function getUserJoinedGameIndexes() public view returns(bytes32[]){
        return userJoinedGameIndexes[msg.sender];
    }
    function isJoinedGame(bytes32 _gameIndex) public view returns(bool) {
        return joinedGames[_gameIndex][msg.sender];
    }
    function getUserJoinedGameScoreIndexes(bytes32 _gameIndex) public view returns(bytes32[]) {
        return joinedGamesScoreIndexes[_gameIndex][msg.sender];
    }
    function getUserJoinedGameScoreInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint value, bool isValued) {
        return (joinedGamesScoreInfo[_gameIndex][msg.sender][_scoreIndex].score, joinedGamesScoreInfo[_gameIndex][msg.sender][_scoreIndex].value, joinedGamesScoreInfo[_gameIndex][msg.sender][_scoreIndex].isValued);
    }
}