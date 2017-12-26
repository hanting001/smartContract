const utility = require('./utility');

const KnotCoin = artifacts.require('KnotToken');
const Group = artifacts.require('Group');

module.exports = async(deployer, network) => {
    const args = process.argv;
    try {
        if (!KnotCoin.address) {
            await deployer.deploy(KnotCoin);
            utility.updateDB('knotCoin', KnotCoin.address);
        }
    } catch (err) {
        // if (args.indexOf('knotCoin') > 0) {
            await deployer.deploy(KnotCoin);
            utility.updateDB('knotCoin', KnotCoin.address);
        // }
    }
    // if (args.indexOf('group') > 0) {
        await deployer.deploy(Group, 'G00000001', KnotCoin.address);
        utility.updateDB('G00000001', Group.address);
    // }

}