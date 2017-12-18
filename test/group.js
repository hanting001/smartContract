let Group = artifacts.require("Group");
let KnotCoin = artifacts.require('KnotToken');
contract('Group', (accounts) => {
    // it("test group item init", async() => {
    //     let instance = await Group.deployed();
    //     let item = await instance.getItem.call();
    //     assert.equal(item, 'G00000001', 'item not equal G00000001');
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
        //add money
        let token = await KnotCoin.deployed();
        await token.transfer(accounts[1], 1 * 10 ** 8, {from:accounts[0]})
        await token.approve(instance.address, 1 * 10 ** 8, {from:accounts[1]});
        let result = await instance.join({from:accounts[1]});
        let join = await instance.membersInGroup.call(accounts[1]);
        assert.equal(join, true, `can not join`);

        const balanceOfGroup = await token.balanceOf.call(instance.address);
        assert.equal(balanceOfGroup.toString(), '100000000', 'group token not add 1');

        const balanceOfMember = await token.balanceOf.call(accounts[1]);
        assert.equal(balanceOfMember.toString(), '0', 'member token not subtract 1');
    });
    it("test lottery", async() => {
        const group = await Group.deployed();
        const token = await KnotCoin.deployed();


        await group.close({from: accounts[0]});
        await group.lottery(0, {from: accounts[0]});
        
        const winner = await group.winner.call();
        console.log(winner);
        assert(winner, accounts[1], "winner not index 0");

        await group.receiveBonus({from:accounts[1]});

        const balanceOfGroup = await token.balanceOf.call(group.address);
        assert.equal(balanceOfGroup.toString(), '0', 'group token not pay winner');

        const balanceOfWinner = await token.balanceOf.call(accounts[1]);
        assert.equal(balanceOfWinner.toString(), '100000000', 'winner not get bonus');
    });

});