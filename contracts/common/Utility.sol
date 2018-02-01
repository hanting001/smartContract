pragma solidity ^0.4.18;
import "../../installed_contracts/solidity-stringutils/strings.sol";

library Utility {
    using strings for *;
    /** @dev getDatetime 
      * @param dateTimeStr 日期字符串，格式为"2018-01-30T17:23:15"
      */   
    function getDatetime(string dateTimeStr) internal returns (uint) {
        var a = dateTimeStr.toSlice();
        var aDate = a.split("T".toSlice());
        var aTime = a;
        strings.slice memory aYearsl;
        aDate.split("-".toSlice(), aYearsl);
        strings.slice memory aMonthsl;
        aDate.split("-".toSlice(), aMonthsl);

        strings.slice memory aHoursl;
        aTime.split(":".toSlice(), aHoursl);
        strings.slice memory aMinutesl;
        aTime.split(":".toSlice(), aMinutesl);
        uint aReturn = getDate(aYearsl.toString(), aMonthsl.toString(), aDate.toString());
        aReturn += getTime(aHoursl.toString(), aMinutesl.toString(), aTime.toString());
        return aReturn;
    }
    function checkDateFomat(string date) internal returns (bool, uint) {
        var aDate = date.toSlice();
        // var aTime = a;
        strings.slice memory aYearsl;
        aDate.split("-".toSlice(), aYearsl);
        strings.slice memory aMonthsl;
        aDate.split("-".toSlice(), aMonthsl);
        aMonthsl.beyond("0".toSlice());
        var aDaysl = aDate.beyond("0".toSlice());
        uint aYearInt= parseInt(aYearsl.toString());
        // if (aYearsl.len() != 4) {
        //     return (false, 10);
        // }
        if (aYearInt < 2018) {
            return (false, 101);
        }
        uint aMonthInt= parseInt(aMonthsl.toString());
        // if (!(aMonthsl.len() == 2 || aMonthsl.len() == 1)) {
        //     return (false, 11);
        // }
        if (aMonthInt > 12 || aMonthInt == 0) {
            return (false, 111);
        }
        uint aDayMaxInt = getMonthDays(aYearInt, aMonthInt);
        uint aDayInt = parseInt(aDaysl.toString());
        // if (!(aDaysl.len() == 2 || aDaysl.len() == 1)) {
        //     return (false, 12);
        // }
        if (aDayInt > aDayMaxInt || aDayInt == 0) {
            return (false, 121);
        }
        if (aYearsl.compare(uint2str(aYearInt).toSlice()) != 0) {
            return (false, 20);
        }
        if (aMonthsl.compare(uint2str(aMonthInt).toSlice()) != 0) {
            return (false, 21);
        }
        if (aDaysl.compare(uint2str(aDayInt).toSlice()) != 0) {
            return (false, 22);
        }
        return (true, 0);
    }
    function checkTimeFomat(string time) internal returns (bool, uint) {
        var aTime = time.toSlice();
        // var aTime = a;
        strings.slice memory aHoursl;
        aTime.split(":".toSlice(), aHoursl);
        aHoursl.beyond("0".toSlice());
        strings.slice memory aMinutesl;
        aTime.split(":".toSlice(), aMinutesl);
        aMinutesl.beyond("0".toSlice());
        var aSecondsl = aTime.beyond("0".toSlice());
        uint aHourInt= parseInt(aHoursl.toString());
        if (aHourInt > 23 ) {
            return (false, 101);
        }
        uint aMinuteInt= parseInt(aMinutesl.toString());
        if (aMinuteInt > 59) {
            return (false, 111);
        }
        uint aSecondInt = parseInt(aSecondsl.toString());
        if (aSecondInt > 59) {
            return (false, 121);
        }
        if (aHoursl.compare(uint2str(aHourInt).toSlice()) != 0) {
            return (false, 20);
        }
        if (aMinutesl.compare(uint2str(aMinuteInt).toSlice()) != 0) {
            return (false, aMinuteInt);
        }
        if (aSecondsl.compare(uint2str(aSecondInt).toSlice()) != 0) {
            return (false, 22);
        }
        return (true, 0);
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

    function isLeapYear(uint year) internal pure returns (bool) {
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
    function getMonthDays(uint year, uint month) internal pure returns (uint) {
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
    function uint2str(uint i) internal pure returns (string){
        if (i == 0) return "0";
        uint j = i;
        uint len;
        while (j != 0){
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (i != 0){
            bstr[k--] = byte(48 + i % 10);
            i /= 10;
        }
        return string(bstr);
    }   
    // function strConcat(string _a, string _b, string _c, string _d, string _e) internal pure returns (string) {
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

    // function strConcat(string _a, string _b, string _c, string _d) internal pure returns (string) {
    //     return strConcat(_a, _b, _c, _d, "");
    // }

    // function strConcat(string _a, string _b, string _c) internal pure returns (string) {
    //     return strConcat(_a, _b, _c, "", "");
    // }

    function strConcat(string _a, string _b) internal returns (string) {
        return _a.toSlice().concat(_b.toSlice());
    }
}