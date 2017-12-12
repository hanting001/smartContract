pragma solidity ^0.4.18;

contract Stoppable {
    address public curator;
    bool public stopped;
    modifier stopInEmergency { if (!stopped) _; }
    modifier onlyInEmergency { if (stopped) _; }
  
    function Stoppable(address _curator) public {
        require(_curator != 0);
        curator = _curator;
    }
  
    function emergencyStop() external {
        require(msg.sender == curator);
        stopped = true;
    }
}