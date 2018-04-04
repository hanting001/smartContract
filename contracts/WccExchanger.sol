pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import './common/KnotToken.sol';
import './common/Stoppable.sol';
contract WccExchanger is Ownable, Stoppable{
    using SafeMath for uint256;
    KnotToken token;
    uint public rate = 1000;
    mapping(address => uint) withdraws;
    function WccExchanger(address tokenAddress) public Stoppable(msg.sender){
        token = KnotToken(tokenAddress);
    }
    function setRate(uint _rate) external onlyOwner {
        require(_rate > 0);
        rate = _rate;
    }
    function() public payable { 
        exchange();
    }
    /// @author Bob Clampett
    /// @notice user exchange check
    function exchangeCheck(uint value) public view returns(uint) {
        uint tokenCount = value.mul(rate);
        if(tokenCount < 1 ether) {
            return 1; //too small exchange
        }
        if (token.balanceOf(this) < tokenCount) {
            return 2; //no balance
        }
        return 0;
    }
    /// @author Bob Clampett
    /// @notice user exchange vote token by eth
    function exchange() public payable {
        uint eth = msg.value; 
        uint tokenCount = eth.mul(rate);
        require(exchangeCheck(eth) == 0);
        token.transfer(msg.sender, tokenCount);
    }

    function redeemCheck(uint tokenValue) public view returns(uint) {
        if (tokenValue < 1 ether) {
            return 2; // too small redeem
        }
        if (token.allowance(msg.sender, this) < tokenValue) {
            return 1; // no token allowance
        }
        return 0;
    }
    function redeem(uint tokenValue) external { 
        require(redeemCheck(tokenValue) == 0);
        uint eth = tokenValue.div(rate);
        if(token.transferFrom(msg.sender, this, tokenValue)) {
            withdraws[msg.sender] = withdraws[msg.sender].add(eth);
        }
    }
    event UserWithdraw(address user, uint value);
    /// @author Bob Clampett
    /// @notice user withdraw eth    
    function withdraw() external stopInEmergency {
        uint value = withdraws[msg.sender];
        require(value > 0);
        withdraws[msg.sender] = 0;
        msg.sender.transfer(value);
        UserWithdraw(msg.sender, value);
    }
}