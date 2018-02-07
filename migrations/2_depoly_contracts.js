const utility = require('./utility');

const KnotCoin = artifacts.require('KnotToken');
const Group = artifacts.require('Group');
const FlightDelay = artifacts.require('FlightDelay');
const HbStorage = artifacts.require('HbStorage');
const Utility = artifacts.require('Utility');

module.exports = async (deployer, network) => {
    const args = process.argv;
    try {
        if (!KnotCoin.address) {
            await deployer.deploy(KnotCoin);
            utility.updateDB('knotCoin', 'KnotCoin', KnotCoin.address);
            await deployer.deploy(HbStorage);
            utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
        }
    } catch (err) {
        await deployer.deploy(KnotCoin);
        utility.updateDB('knotCoin', 'KnotCoin', KnotCoin.address);
        await deployer.deploy(HbStorage);
        utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    }
    await deployer.deploy(FlightDelay, HbStorage.address, KnotCoin.address);
    utility.updateDB('flightDelay', 'FlightDelay', FlightDelay.address);
}