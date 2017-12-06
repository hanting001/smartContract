const KnotCoin = artifacts.require('KnotToken')

module.exports = async (deployer, network) => {
    deployer.deploy(KnotCoin);
}