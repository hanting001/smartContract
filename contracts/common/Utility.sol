pragma solidity ^0.4.18;
import "../../installed_contracts/solidity-stringutils/strings.sol";

library Utility {
    using strings for *;
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
    function parseInt(string _a) internal pure returns (uint) {
        return parseInt(_a, 0);
    }

    // parseInt(parseFloat*10^_b)
    function parseInt(string _a, uint _b) internal pure returns (uint) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i=0; i<bresult.length; i++){
            if ((bresult[i] >= 48)&&(bresult[i] <= 57)){
                if (decimals){
                   if (_b == 0) break;
                    else _b--;
                }
                mint *= 10;
                mint += uint(bresult[i]) - 48;
            } else if (bresult[i] == 46) decimals = true;
        }
        if (_b > 0) mint *= 10**_b;
        return mint;
    }
}