pragma solidity ^0.4.18;
import "../../installed_contracts/solidity-stringutils/strings.sol";

library Utility {
    using strings for *;
    /** @dev getDatetime 
      * @param dateTimeStr 日期字符串，格式为"2018-01-30T17:23:15"
      */   
    function getDatetime(string dateTimeStr) public returns (uint) {
        var a = dateTimeStr.toSlice();
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
        uint monthDays = 0;
        for (uint i = 1; i <= aIntMonth; i ++) {
            monthDays += getMonthDays(aIntYear, i);
        }
        return aIntYear * 1 years + monthDays * 1 days  + aIntDay * 1 days;
    }
    function getTime(string hour, string minute, string second) internal pure returns (uint) {
        uint aIntHour = parseInt(hour);
        uint aIntMinute = parseInt(minute);
        uint aIntSecond = parseInt(second);
        return aIntHour * 1 hours + aIntMinute * 1 minutes + aIntSecond;
    }

    function isLeapYear(uint year) public pure returns (bool) {
                if (year % 4 != 0) {
                        return false;
                }
                if (year % 100 != 0) {
                        return true;
                }
                if (year % 400 != 0) {
                        return false;
                }
                return true;
    }
    function getMonthDays(uint year, uint month) public pure returns (uint) {
        if (month == 2) {
            if (isLeapYear(year)) {
                return 29;
            } else {
                return 28;
            }
        }
        if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
            return 31;
        }
        return 30;
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
    
    // function strConcat(string _a, string _b, string _c, string _d, string _e) public pure returns (string) {
    //     bytes memory _ba = bytes(_a);
    //     bytes memory _bb = bytes(_b);
    //     bytes memory _bc = bytes(_c);
    //     bytes memory _bd = bytes(_d);
    //     bytes memory _be = bytes(_e);
    //     string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
    //     bytes memory babcde = bytes(abcde);
    //     uint k = 0;
    //     for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
    //     for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
    //     for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
    //     for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
    //     for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
    //     return string(babcde);
    // }

    // function strConcat(string _a, string _b, string _c, string _d) public pure returns (string) {
    //     return strConcat(_a, _b, _c, _d, "");
    // }

    // function strConcat(string _a, string _b, string _c) public pure returns (string) {
    //     return strConcat(_a, _b, _c, "", "");
    // }

    function strConcat(string _a, string _b) internal returns (string) {
        bytes memory _ba = bytes(_a);
        bytes memory _bb = bytes(_b);
        string memory abcde = new string(_ba.length + _bb.length);
        bytes memory babcde = bytes(abcde);
        uint k = 0;
        for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
        for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
        return string(babcde);
    }
}