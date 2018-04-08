const utility = require('./utility');

const KnotToken = artifacts.require('KnotToken');
const Group = artifacts.require('Group');
const FlightDelay = artifacts.require('FlightDelay');
const HbStorage = artifacts.require('HbStorage');
const Utility = artifacts.require('Utility');

const WccPlayer = artifacts.require('WccPlayer');
const WccStorage = artifacts.require('WccStorage');
const WccVoter = artifacts.require('WccVoter');
const WccExchanger = artifacts.require('WccExchanger');

module.exports = async(deployer, network, accounts) => {
    const args = process.argv;
    console.log(accounts);
    const account = accounts[0];
    console.log(account);
    // try {
    //     if (!KnotToken.address) {
    //         await deployer.deploy(KnotToken, {from: account});
    //         utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    //         await deployer.deploy(HbStorage, {from: account});
    //         utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    //     }
    // } catch (err) {
    await deployer.deploy(KnotToken, {
        from: account
    });
    utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    // await deployer.deploy(HbStorage, {
    //     from: account
    // });
    // utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    // // }
    // await deployer.deploy(KnotToken, {
    //     from: account
    // });
    // utility.updateDB('knotToken', 'KnotToken', KnotToken.address);
    // await deployer.deploy(HbStorage, {
    //     from: account
    // });
    // utility.updateDB('hbStorage', 'HbStorage', HbStorage.address);
    // await deployer.deploy(FlightDelay, HbStorage.address, KnotToken.address, {
    //     from: account
    // });
    // utility.updateDB('flightDelay', 'FlightDelay', FlightDelay.address);


    await deployer.deploy(WccStorage, {
        from: account
    });
    utility.updateDB('wccStorage', 'WccStorage', WccStorage.address);

    await deployer.deploy(WccPlayer, WccStorage.address, {
        from: account
    });
    utility.updateDB('wccPlayer', 'WccPlayer', WccPlayer.address);

    await deployer.deploy(WccVoter, WccStorage.address, KnotToken.address, {
        from: account
    });
    utility.updateDB('wccVoter', 'WccVoter', WccVoter.address);


    await deployer.deploy(WccExchanger, KnotToken.address, {
        from: account
    });
    utility.updateDB('wccExchanger', 'WccExchanger', WccExchanger.address);
}