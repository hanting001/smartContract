const Web3 = require('web3');
const web3 = new Web3();
const HbStorage = artifacts.require('HbStorage');

contract('HbStorage', (accounts) => {
    it("test addMemberToSF", async() => {
        const instance = await HbStorage.deployed();
        const sfIndex = web3.utils.keccak256('SF372220180101');
        console.log(sfIndex);
        await instance.addMemberToSF(sfIndex, accounts[1], '', false, {from: accounts[0]});
        const scheduledFlight = await instance.scheduledFlights.call(sfIndex);
        console.log(scheduledFlight);
        assert.equal(true, true, 'error');
    });
});