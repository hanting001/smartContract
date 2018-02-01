const utility = require('./utility');

const KnotCoin = artifacts.require('KnotToken');
const Group = artifacts.require('Group');
const DelayOracle = artifacts.require('DelayOracle');
const HbStorage = artifacts.require('HbStorage');
const Utility = artifacts.require('Utility');

module.exports = async(deployer, network) => {
    const args = process.argv;
    // try {
    //     if (!KnotCoin.address) {
    //         await deployer.deploy(KnotCoin);
    //         utility.updateDB('knotCoin', 'KnotCoin', KnotCoin.address);
    //     }
    // } catch (err) {
    //     // if (args.indexOf('knotCoin') > 0) {
    //         await deployer.deploy(KnotCoin);
    //         utility.updateDB('knotCoin', 'KnotCoin', KnotCoin.address);
    //     // }
    // }
    // // if (args.indexOf('group') > 0) {
    //     await deployer.deploy(Group, 'G00000001', KnotCoin.address);
    //     utility.updateDB('G00000001', 'Group', Group.address);
    // // }
    // await deployer.deploy(DelayOracle, 'a7303040ad45b48f53e11331af27cdca');
    // utility.updateDB('delayOracle', 'DelayOracle', DelayOracle.address);
    // await deployer.deploy(Utility);
    // deployer.link(Utility, HbStorage);
    await deployer.deploy(HbStorage);
    utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
}