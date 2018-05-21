pragma solidity ^0.4.18;
import '../node_modules/zeppelin-solidity/contracts/ownership/Ownable.sol';
import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';
import './WccStorage.sol';
import './common/KnotToken.sol';
import './common/Stoppable.sol';
contract WccExchanger is Ownable, Stoppable{
    using SafeMath for uint256;
    KnotToken token;
    WccStorage wccs;
    uint public rate = 100;
    uint public exchanged;
    mapping(address => uint) public withdraws;
    mapping(address => mapping(bytes32 => mapping(bytes32 => bool))) public drawList;
    mapping(address => bool) public canUserRedeem;
    bool public canRedeem = false;
    function WccExchanger(address tokenAddress, address wccsAddress) public Stoppable(msg.sender){
        token = KnotToken(tokenAddress);
        wccs = WccStorage(wccsAddress);
    }
    function setCanRedeem(bool flag) external onlyOwner{
        if (canRedeem != flag) {
            canRedeem = flag;
        }
    }
    function setUserCanRedeem(address user, bool flag) external onlyOwner {
        if (canRedeem && canUserRedeem[user] != flag) {
            canUserRedeem[user] = flag;
        }
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
    event UserExchange(address user, uint ethValue, uint tokenValue);
    /// @author Bob Clampett
    /// @notice user exchange vote token by eth
    function exchange() public payable {
        uint eth = msg.value; 
        uint tokenCount = eth.mul(rate);
        require(exchangeCheck(eth) == 0);
        if(token.transfer(msg.sender, tokenCount)) {
            exchanged = exchanged.add(tokenCount);
            withdraws[owner] = withdraws[owner].add(eth);
        }
        UserExchange(msg.sender, eth, tokenCount);
    }
    /// @author Bob Clampett
    /// @notice user redeem check
    function redeemCheck(uint tokenValue) public view returns(uint) {
        if (tokenValue < 1 ether) {
            return 2; // too small redeem
        }
        if (token.allowance(msg.sender, this) < tokenValue) {
            return 1; // no token allowance
        }
        if (canUserRedeem[msg.sender]) {
            return 3; // user can not redeem
        }
        return 0;
    }
    event UserRedeem(address user, uint ethValue, uint tokenValue);
    /// @author Bob Clampett
    /// @notice user redeem vote token for eth
    function redeem(uint tokenValue) external { 
        require(redeemCheck(tokenValue) == 0);
        uint eth = tokenValue.div(rate);
        if(token.transferFrom(msg.sender, this, tokenValue)) {
            exchanged = exchanged.sub(tokenValue);
            withdraws[msg.sender] = withdraws[msg.sender].add(eth);
        }
        UserRedeem(msg.sender, eth, tokenValue);
    }
    event UserWithdraw(address user, uint value);
    /// @author Bob Clampett
    /// @notice user withdraw eth    
    function withdraw() external stopInEmergency {
        uint value = withdraws[msg.sender];
        require(value > 0);
        require(address(this).balance >= value);
        require(msg.sender != owner);
        require(withdraws[owner] >= value);
        delete withdraws[msg.sender];
        withdraws[owner] = withdraws[owner].sub(value);
        msg.sender.transfer(value);
        UserWithdraw(msg.sender, value);
    }
    /// @author Bob Clampett
    /// @notice owner withdraw eth 
    function withdrawByOwner() external stopInEmergency onlyOwner{
        uint value = withdraws[msg.sender];
        require(value > 0);
        require(address(this).balance >= value);
        withdraws[msg.sender] = 0;
        msg.sender.transfer(value);
        UserWithdraw(msg.sender, value);
    }
    // event UserDrawToken(address user, bytes32 scoreIndex, bytes32 scoreIndex);
    function drawTokenCheck(bytes32 gameIndex, bytes32 scoreIndex) public view returns(uint) {
        var (,value,) = wccs.joinedGamesScoreInfo(gameIndex, msg.sender, scoreIndex);
        if (value == 0) {
            return 1; //user not joind game
        }
        if (drawList[msg.sender][gameIndex][scoreIndex]) {
            return 2; //already draw
        }
        if (token.balanceOf(this) < 1 ether) {
            return 3; // balance not enough
        }
        return 0;

    }
    /// @author Bob Clampett
    /// @notice user draw token 
    function drawToken(bytes32 gameIndex, bytes32 scoreIndex) external stopInEmergency {
        require(drawTokenCheck(gameIndex, scoreIndex) == 0);
        token.transfer(msg.sender, 1 ether);
        drawList[msg.sender][gameIndex][scoreIndex] = true;
        // UserDrawToken(msg.sender, 1 ether, index);
    }

    function handover(address newer) external onlyOwner {
        token.transfer(newer, token.balanceOf(this));
        selfdestruct(owner);
    }
}