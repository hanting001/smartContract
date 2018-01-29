pragma solidity ^0.4.18;
import "../../installed_contracts/ethereum-api/oraclizeAPI_0.5.sol";
import "../../installed_contracts/solidity-stringutils/strings.sol";

/** @title DelayOracle smart contract. */
contract DelayOracle is usingOraclize {
    using strings for *;
    struct Info {
        string arrScheduled;
        string arrActual;
        int delays;
        bool isDelay;
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
        // strings.slice memory part;
        var s = result.toSlice();
        var d = s.split(", ".toSlice());
        d = d.beyond("[\"".toSlice());
        d = d.until("\"".toSlice());
        string memory _arrScheduled = d.toString();
        s = s.until("\"]".toSlice());
        string memory _arrActual = s.beyond("\"".toSlice()).toString();
        var (, , delays, isDelay) = checkDelay(_arrScheduled, _arrActual);
        results[keccak256(queryRecords[queryId].record)] = 
            Info({arrScheduled: _arrScheduled, arrActual: _arrActual, delays: delays, isDelay: isDelay });
        LogDelayInfoUpdated(queryRecords[queryId].record);
        
    }
    function checkDelay(string _arrScheduled, string _arrActual) internal returns (uint scheduledM, uint acrualM, int delays, bool isDelay){
        uint aReturn = getDatetime(_arrScheduled);
        uint bReturn = getDatetime(_arrActual);
        delays = int(bReturn - aReturn);
        if (delays > 3600) {
            isDelay = true;
        } else {
            isDelay = false;
        }
        return (aReturn, bReturn, delays, isDelay);
    }
    function getDatetime(string scheduled) internal returns (uint) {
        var a = scheduled.toSlice();
        var aDate = a.split("T".toSlice());
        var aTime = a;
        strings.slice memory part;
        string memory aYear = aDate.split("-".toSlice(), part).toString();
        string memory aMonth = aDate.split("-".toSlice(), part).toString();
        string memory aDay = aDate.split("-".toSlice(), part).toString();
        string memory aHour = aTime.split(":".toSlice(), part).toString();
        string memory aMinute = aTime.split(":".toSlice(), part).toString();
        string memory aSecond = aTime.split(":".toSlice(), part).toString();
        uint aReturn = getDate(aYear, aMonth, aDay);
        aReturn += getTime(aHour, aMinute, aSecond);
        return aReturn;
    }
    function getDate(string year, string month, string day) internal pure returns (uint) {
        uint aIntYear = parseInt(year);
        uint aIntMonth = parseInt(month);
        uint aIntDay = parseInt(day);
        return aIntYear * 1 years + aIntMonth * 30 days  + aIntDay * 1 days;
    }
    function getTime(string hour, string minute, string second) internal pure returns (uint) {
        uint aIntHour = parseInt(hour);
        uint aIntMinute = parseInt(minute);
        uint aIntSecond = parseInt(second);
        return aIntHour * 1 hours + aIntMinute * 1 minutes + aIntSecond;
    }
    function query(string flightNo, string flightDate) public payable {
        // require(this.balance > oraclize_getPrice("URL"));
        string memory a = "json(http://op.juhe.cn/flight/df/hfs?dtype=&flightNo=";
        string memory b = "&flightDate=";
        string memory c = "&key=a7303040ad45b48f53e11331af27cdca).result[ArrScheduled, ArrActual]";
        string memory queryStr = strConcat(a, flightNo, b, flightDate, c);
        queryStr1 = queryStr;
        bytes32 queryId = oraclize_query("URL", queryStr);
        // bytes32 queryId = oraclize_query("URL", "json(https://api.kraken.com/0/public/Ticker?pair=ETHXBT).result.XETHXXBT.c.0");
        queryID = queryId;
        LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");
        queryRecords[queryId] = Record({record: strConcat(flightNo, flightDate), isValue: true});
    }
}
