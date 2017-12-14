pragma solidity ^0.4.18;

import './common/KnotToken.sol';

contract Account {
    KnotToken knotToken;
    function Account(address tokenAddress) public {
        knotToken = KnotToken(tokenAddress);
    }
}