const KnotCoin = artifacts.require('common/KnotToken')

module.exports = async(deployer, network) => {
    deployer.deploy(KnotCoin).then(async() => {
        let instance = await KnotCoin.deployed();
        console.log(`-------KnotCoin deployed at address "${instance.address}", record it to db-----------`);
    });
}