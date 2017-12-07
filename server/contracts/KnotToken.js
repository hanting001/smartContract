const Web3 = require('../lib/web3');

const abi = require('../../build/contracts/KnotToken').abi;

module.exports = function (address) {
    const web3 = Web3.instance();
    this.instance = new web3.eth.Contract(abi, address);
    this.balanceOf = async (address) => {
        if (!address) {
            accouts = await web3.eth.getAccounts();
            address = accouts[0];
        }
        return this.instance.methods.balanceOf(address).call();
    }
}