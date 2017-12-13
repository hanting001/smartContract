let Group = artifacts.require("Group");
let KnotCoin = artifacts.require('KnotToken');
contract('Group', (accounts) => {
    // it("test group item init", async() => {
    //     let instance = await Group.deployed();
    //     let item = await instance.getItem.call();
    //     assert.equal(item, 'G00000002', 'item not equal G00000002');
    // });
    // it("test group close and open", async() => {
    //     let instance = await Group.deployed();
    //     await instance.open({from: accounts[0]});
    //     let isOpen = await instance.isOpen.call();
    //     assert.equal(isOpen, true, 'group can not open');
    //     await instance.close({from: accounts[0]});
    //     isOpen = await instance.isOpen.call();
    //     assert.equal(isOpen, false, 'group can not close');
    // });  
    // it("test group know token", async() => {
    //     let instance = await Group.deployed();
    //     let address = await instance.getToken.call();
    //     assert.equal(address, KnotCoin.address, `address not equal ${KnotCoin.address}`);
    // });
    it("test group join", async() => {
        let instance = await Group.deployed();
        await instance.open({from: accounts[0]});
        console.log(accounts[1]);
        //add money
        let token = await KnotCoin.deployed();
        token.transfer(accounts[1], 2 * 10 ** 8, {from:accounts[0]})
        token.approve(instance.address, 2 * 10 ** 8, {from:accounts[1]});
        let result = await instance.join({from:accounts[1]});
        let join = await instance.members.call(accounts[1]);
        assert.equal(join, true, `can not join`);
    });

});