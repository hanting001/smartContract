pragma solidity ^0.4.18;

import '../../node_modules/zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract KnotToken is StandardToken {
    string public name = 'KnotCoin';
    string public symbol = 'KTC';
    uint public totalSupply = 0;
    uint public decimals = 18;
    uint public INITIAL_SUPPLY = 0;
    
    function KnotToken(uint initial, string _name, string _symbol) public {
        name =_name;
        symbol = _symbol;
        INITIAL_SUPPLY = initial * (10 ** decimals);
        totalSupply = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}