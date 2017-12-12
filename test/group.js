let Group = artifacts.require("Group");

contract('Group', function (accounts) {
    it("test group item init", function () {
        return Group.deployed().then(function (instance) {
            return instance.getItem.call();
        }).then(function (item) {
            assert.equal(item, '00000002', 'item not equal 00000002');
        });
    });
});