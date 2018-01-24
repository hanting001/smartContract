pragma solidity ^0.4.18;
import "../../installed_contracts/ethereum-api//oraclizeAPI_0.5.sol";

/** @title group smart contract. */
contract DelayOracle is usingOraclize {
    // struct Info {
    //     string depScheduled;
    //     string depActual;
    // }
    // struct Record {
    //     string record;
    //     bool isValue;
    // }
    // mapping(bytes32=>Record) public queryRecords;
    // mapping(bytes32=>string) public results;
    string public results;

    // event LogDelayInfoUpdated(string condition);
    // event LogNewOraclizeQuery(string description);
    
    function() public payable { 

    }
    // function __callback(bytes32 queryId, string result) public {
    //     require(msg.sender == oraclize_cbAddress());
    //     require(queryRecords[queryId].isValue);
    //     // results[queryRecords[queryId].record] = Info({depScheduled: result.DepScheduled, depActual: result.DepActual});
    //     // results[keccak256(queryRecords[queryId].record)] = result;
    //     LogDelayInfoUpdated(queryRecords[queryId].record);
        
    // }

    function getInfo() public  {
        // require(this.balance > oraclize_getPrice("URL"));
        
        // LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        // string memory a = "json(https://api.fixer.io/latest?dtype=&flightNo=";
        // string memory b = "&flightDate=";
        // string memory c = "&key=a7303040ad45b48f53e11331af27cdca).result";
        // string memory queryStr = strConcat(a, flightNo, b, flightDate, c);
        // bytes32 queryId = oraclize_query("URL", queryStr);

        // queryRecords[queryId] = Record({record: strConcat(flightNo, flightDate), isValue: true});
        // results = strConcat(flightNo, flightDate);
        results = "hello world!";
    }
}