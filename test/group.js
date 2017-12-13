let Group = artifacts.require("Group");

contract('Group', (accounts) => {
    
    it("test group item init", async() => {
        let instance = await Group.deployed();
        let item = await instance.getItem.call();
        assert.equal(item, '00000002', 'item not equal 00000002');
    });
    it("test group close and open", async() => {
        let instance = await Group.deployed();
        await instance.open({from: accounts[0]});
        let isOpen = await instance.isOpen.call();
        assert.equal(isOpen, true, 'group can not open');
        await instance.close({from: accounts[0]});
        isOpen = await instance.isOpen.call();
        assert.equal(isOpen, false, 'group can not close');
    });  
});