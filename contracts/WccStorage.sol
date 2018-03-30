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

    mapping(bytes32 => mapping(address => Score)) public joinedGames;

    struct VoteInfo {
        string target;
        uint yesCount;
        uint noCount;
        bool passed;
        bool ended;
        bool isValued;
    }
    mapping(bytes32 => VoteInfo) voteInfos;
}