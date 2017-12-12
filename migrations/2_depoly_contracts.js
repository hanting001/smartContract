const utility = require('./utility');

const KnotCoin = artifacts.require('common/KnotToken');
const Group = artifacts.require('Group');

module.exports = async(deployer, network) => {
    deployer.deploy(KnotCoin).then(async() => {
        let instance = await KnotCoin.deployed();
        let result = await utility.updateDB('knotCoin', instance.address);
        // console.log(result);
    });
    deployer.deploy(Group, '00000002').then(async() => {
        let instance = await Group.deployed();
        let result = await utility.updateDB('group', instance.address);
    });
}