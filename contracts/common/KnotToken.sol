pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol';

contract KnotToken is StandardToken {
    string public name = 'KnotCoin';
    string public symbol = 'KTC';
    uint public decimals = 8;
    uint public INITIAL_SUPPLY = 100000000 * (10 ** decimals);
    
    function KnotToken() public {
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}