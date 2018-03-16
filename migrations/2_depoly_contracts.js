const utility = require('./utility');

const KnotToken = artifacts.require('KnotToken');
const Group = artifacts.require('Group');
const FlightDelay = artifacts.require('FlightDelay');
const HbStorage = artifacts.require('HbStorage');
const Utility = artifacts.require('Utility');

module.exports = async (deployer, network, accounts) => {
    const args = process.argv;
    console.log(accounts);
    const account = accounts[1] ? accounts[1] : accounts[0];
    console.log(account);
    // try {
    //     if (!KnotToken.address) {
    //         await deployer.deploy(KnotToken, {form: account});
    //         utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    //         await deployer.deploy(HbStorage, {form: account});
    //         utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    //     }
    // } catch (err) {
    //     await deployer.deploy(KnotToken, {form: account});
    //     utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    //     await deployer.deploy(HbStorage, {form: account});
    //     utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    // }
    await deployer.deploy(KnotToken, {form: account, overwrite: false});
    utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    await deployer.deploy(HbStorage, {form: account});
    utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    await deployer.deploy(FlightDelay, HbStorage.address, KnotToken.address, {form: account});
    utility.updateDB('flightDelay', 'FlightDelay', FlightDelay.address);
}