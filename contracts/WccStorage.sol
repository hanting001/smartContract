pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
contract WccStorage is Ownable {
    enum GameType { First_stage, Round_of_16, Quarter_finals, Semi_finals, Final }
    enum GameStatus { Playing, Voting, Paying, End}
    mapping(address => bool) admins;
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
        games[index] = GameInfo({
            p1: _p1,
            p2: _p2,
            time: _time,
            gameType: _gameType,
            status: GameStatus.Playing,
            isValued: true
        });
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

    function setGameScoreTotalIndex(bytes32 _gameIndex, bytes32 _scoreIndex) external onlyAdmin {
        if (!gameScoreTotalInfos[_gameIndex][_scoreIndex].isValued) {
            gameScoreIndexes[_gameIndex].push(_scoreIndex);
        }
    }
    function setGameScoreTotalInfo(bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) external onlyAdmin {
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
    function setUserJoinedGameIndexes(address _user, bytes32 _gameIndex) external onlyAdmin {
        if(!joinedGames[_gameIndex][_user]) {
            userJoinedGameIndexes[_user].push(_gameIndex);
        }
    }
    function setJoinedGame(address _user, bytes32 _gameIndex) external onlyAdmin {
        if(!joinedGames[_gameIndex][_user]) {
            joinedGames[_gameIndex][_user] = true;
        }
    }
    function setJoinedGameScoreIndex(address _user, bytes32 _gameIndex, bytes32 _scoreIndex) external onlyAdmin {
        if(!joinedGamesScoreInfo[_gameIndex][_user][_scoreIndex].isValued) {
            joinedGamesScoreIndexes[_gameIndex][_user].push(_scoreIndex);
        }
    }
    function setJoinedGameScoreInfo(address _user, bytes32 _gameIndex, bytes32 _scoreIndex, string _score, uint _value) external onlyAdmin {
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
}