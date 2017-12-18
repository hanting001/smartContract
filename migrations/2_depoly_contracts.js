const utility = require('./utility');

const KnotCoin = artifacts.require('KnotToken');
const Group = artifacts.require('Group');

module.exports = async(deployer, network) => {
    try {
        if (!KnotCoin.address) {
            await deployer.deploy(KnotCoin);
            utility.updateDB('knotCoin', KnotCoin.address);
        }
    } catch (err) {
        await deployer.deploy(KnotCoin);
        utility.updateDB('knotCoin', KnotCoin.address);
    }
    await deployer.deploy(Group, 'G00000001', KnotCoin.address);
    utility.updateDB('G00000001', Group.address);
}