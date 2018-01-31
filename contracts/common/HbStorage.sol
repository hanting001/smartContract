pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';

contract HbStorage is Ownable {
    enum SFStatus { opening, closed, claiming, ended }
    struct SFInfo {
        address[] members;
        SFStatus status;
        bool isDelayed;
        bool isValued;
    }
    struct SFHistroy {
        uint totalCounts;
        uint delayedCounts;
    }
    struct VotedMember {
        address member;
        bool vote;
        bool isValued;
    }
    struct VoteInfo {
        VotedMember[] votedMembers;
        uint yesCounts;
        uint noCounts;
        bool isValued;
    }
    struct MemberSF {
        bytes32 joinSF;
        bytes32 votedSF;
        bool isValued;
    }
    struct MemberInfo {
        MemberSF[] scheduledFlights;
        uint winCounts;
    }

    //已出单航班信息 {keccak256(航班号+日期): [SFInfo]}
    mapping(bytes32 => SFInfo[]) scheduledFlights;
    //记录航班的投票信息 {keccak256(航班号+日期): [VoteInfo]}
    mapping(bytes32 => VoteInfo[])  votes;
    //记录航班的历史延误信息 {keccak256(航班号+日期): SFHistroy}
    mapping(bytes32 => SFHistroy) sfHistroy;
    //记录用户的航班信息
    mapping(address => MemberInfo) memberInfos;

    
    function HbStorage() public {
        // constructor
    }
    
}
