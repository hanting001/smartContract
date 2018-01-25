pragma solidity ^0.4.18;
import "../../installed_contracts/ethereum-api/oraclizeAPI_0.5.sol";
import "../../installed_contracts/solidity-stringutils/strings.sol";

/** @title DelayOracle smart contract. */
contract DelayOracle is usingOraclize {
    using strings for *;
    struct Info {
        string depScheduled;
        string depActual;
    }
    struct Record {
        string record;
        bool isValue;
    }
    bytes32 public queryID;
    string public queryStr1;
    mapping(bytes32=>Record) public queryRecords;
    mapping(bytes32=>Info) public results;
    // string public results;
    event LogDelayInfoUpdated(string condition);
    event LogNewOraclizeQuery(string description);
    
    function() public payable { 

    }
    function __callback(bytes32 queryId, string result) public {
        // require(msg.sender == oraclize_cbAddress());
        // require(queryRecords[queryId].isValue);
        // results[queryRecords[queryId].record] = Info({depScheduled: result.DepScheduled, depActual: result.DepActual});
        // results[keccak256(queryRecords[queryId].record)] = result;
        strings.slice memory part;
        var s = result.toSlice();
        string memory _depScheduled = s.split(",".toSlice(), part).toString();
        string memory _depActual = s.split(",".toSlice(), part).toString();
        results[keccak256(queryRecords[queryId].record)] = Info({depScheduled: _depScheduled, depActual: _depActual});
        LogDelayInfoUpdated(queryRecords[queryId].record);
        
    }

    function query(string flightNo, string flightDate) public payable {
        require(this.balance > oraclize_getPrice("URL"));
        
        
        string memory a = "json(http://op.juhe.cn/flight/df/hfs?dtype=&flightNo=";
        string memory b = "&flightDate=";
        string memory c = "&key=a7303040ad45b48f53e11331af27cdca).result[DepScheduled, DepActual]";
        string memory queryStr = strConcat(a, flightNo, b, flightDate, c);
        queryStr1 = queryStr;
        bytes32 queryId = oraclize_query("URL", queryStr);
        // bytes32 queryId = oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
        queryID = queryId;
        LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        queryRecords[queryId] = Record({record: strConcat(flightNo, flightDate), isValue: true});
    }
}