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
        uint totalValue;
        uint totalBets;
        bool isValued;
        uint i;
    }
    mapping(bytes32 => GameInfo) public games;
    bytes32[] gameIndexes;

    struct ScoreTotal {
        string score;
        uint totalValue;
        uint totalBets;
        bool isValued;
    }
    // gameIndex => scoreIndex[]
    mapping(bytes32 => bytes32[]) gameScoreIndexes;
    // gameIndex => scoreIndex => scoreTotalInfo
    mapping(bytes32 => mapping(bytes32 => ScoreTotal)) public gameScoreTotalInfos;
    function setGame(string _p1, string _p2, GameType _gameType, uint _time) external onlyOwner {
        bytes32 index = keccak256(_p1, _p2, _gameType);
        uint i = gameIndexes.push(index) - 1;
        games[index] = GameInfo({
            p1: _p1,
            p2: _p2,
            time: _time,
            gameType: _gameType,
            status: GameStatus.Standby,
            totalValue: 0,
            totalBets: 0,
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
        bool isValued;
    }
    mapping(bytes32 => mapping(address => bool)) public joinedGames;
    mapping(bytes32 => mapping(address => bytes32[])) public joinedGamesScoreIndexes;
    mapping(bytes32 => mapping(address => mapping(bytes32 => Score))) public joinedGamesScoreInfo;

    struct VoteInfo {
        bytes32 target;
        uint yesCount;
        uint noCount;
        bool passed;
        bool ended;
        bool changed;
        bool isValued;
    }
    struct UserVote {
        bool vote;
        uint value;
        bool paid;
        bool isValued;
    }
    mapping(bytes32 => VoteInfo) public voteInfos;
    mapping(bytes32 => mapping(address => UserVote)) public userVotes;

    function userJoin(address user, uint value, bytes32 gameIndex, string score, bytes32 scoreIndex) external onlyAdmin {
        // bytes32 scoreIndex = keccak256(score);

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
            gameScoreTotalInfos[_gameIndex][_scoreIndex].totalValue = gameScoreTotalInfos[_gameIndex][_scoreIndex].totalValue.add(_value);
            gameScoreTotalInfos[_gameIndex][_scoreIndex].totalBets ++;
        } else {
            gameScoreTotalInfos[_gameIndex][_scoreIndex] = ScoreTotal({
                score: _score,
                totalValue: _value,
                totalBets: 1,
                isValued: true
            });
        }
        games[_gameIndex].totalValue = games[_gameIndex].totalValue.add(_value);
        games[_gameIndex].totalBets ++; 
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
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value = joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].value.add(_value);
        } else {
            joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex] = Score({
                score: _score,
                value: _value,
                paid: false,
                isValued: true
            });
        }
    }
    function setGameStatus(bytes32 _gameIndex, GameStatus _status) external onlyAdmin {
        if (games[_gameIndex].isValued) {
            games[_gameIndex].status = _status;
        }
    }
    function setVote(bytes32 _gameIndex, string _result) external onlyAdmin {
        if (!voteInfos[_gameIndex].isValued) {
            voteInfos[_gameIndex] = VoteInfo({
                target: keccak256(_result),
                yesCount: 0,
                noCount: 0,
                passed: false,
                ended: false,
                changed: false,
                isValued: true
            });
        } else {
            bytes32 resultIndex = keccak256(_result);
            if (voteInfos[_gameIndex].target != resultIndex) {
                voteInfos[_gameIndex].target = resultIndex;
                voteInfos[_gameIndex].changed = true;
            }
            
        }
    }
    function updateVote(bytes32 _gameIndex, bool _passed, bool _ended) external onlyAdmin {
        voteInfos[_gameIndex].passed = _passed;
        voteInfos[_gameIndex].ended = _ended;
    }
    function getAllGameIndexes() public view returns(bytes32[]) {
        return gameIndexes;
    }
    function getGameInfo(bytes32 _gameIndex) public view returns(string p1, string p2, uint time, GameType gameType, GameStatus status, uint totalValue, uint totalBets, bool isValued) {
        GameInfo storage gameInfo = games[_gameIndex];
        return (gameInfo.p1, gameInfo.p2, gameInfo.time, gameInfo.gameType, gameInfo.status, gameInfo.totalValue, gameInfo.totalBets, gameInfo.isValued);
    }
    function getGameScoreIndexes(bytes32 _gameIndex) public view returns(bytes32[]) {
        return gameScoreIndexes[_gameIndex];
    }
    function getGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint totalValue, uint totalBets, bool isValued) {
        ScoreTotal storage scoreTotal = gameScoreTotalInfos[_gameIndex][_scoreIndex];
        return (scoreTotal.score, scoreTotal.totalValue, scoreTotal.totalBets, scoreTotal.isValued);
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

    function getUserJoinedGameScoreInfo(bytes32 _gameIndex, bytes32 _scoreIndex) public view returns(string score, uint value, bool paid, bool isValued) {
        Score storage scoreInfo = joinedGamesScoreInfo[_gameIndex][msg.sender][_scoreIndex];
        return (scoreInfo.score, scoreInfo.value, scoreInfo.paid, scoreInfo.isValued);
    }

    function setUserVote(bytes32 _gameIndex, bool yesOrNo, address user, uint votes) external onlyAdmin {
        if (!userVotes[_gameIndex][user].isValued) {
            userVotes[_gameIndex][user] = UserVote({
                vote: yesOrNo,
                value: votes,
                paid: false,
                isValued: true
            });
            if (yesOrNo) {
                voteInfos[_gameIndex].yesCount = voteInfos[_gameIndex].yesCount.add(votes);
            } else {
                voteInfos[_gameIndex].noCount = voteInfos[_gameIndex].noCount.add(votes);
            }
        }
    }
    function setUserScorePaid(bytes32 _gameIndex, bytes32 _scoreIndex, address user) external onlyAdmin {
        joinedGamesScoreInfo[_gameIndex][user][_scoreIndex].paid = true;
    }
    function setUserVotePaid(bytes32 _gameIndex, address user) external onlyAdmin {
        userVotes[_gameIndex][user].paid = true;
    }
}