const utility = require('./utility');

const KnotCoin = artifacts.require('common/KnotToken');

module.exports = async(deployer, network) => {
    deployer.deploy(KnotCoin).then(async() => {
        let instance = await KnotCoin.deployed();
        let result = await utility.updateDB('knotCoin', instance.address);
        console.log(result);
    });
}