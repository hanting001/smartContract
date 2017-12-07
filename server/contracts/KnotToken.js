const Web3 = require('../lib/web3');

const abi = require('../../build/contracts/KnotToken').abi;

module.exports = function (address) {
    const web3 = Web3.instance();
    this.instance = new web3.eth.Contract(abi, address);
    this.instance.events.Transfer((err, event) => {
        console.log('both ganache and testrpc dose not support web socket prvider');
    });
    this.balanceOf = async(address) => {
        if (!address) {
            accouts = await web3.eth.getAccounts();
            address = accouts[0];
        }
        return this.instance.methods.balanceOf(address).call();
    }
    this.transfer = async(to, value) => {
        accouts = await web3.eth.getAccounts();
        let from = accouts[0];
        // console.log(`from: ${from}, to: ${to}`);
        return this.instance.methods.transfer(to, value).send({
            from: from
        })
        .on('transactionHash', (transactionHash) => {
            console.log(transactionHash);
        })
        .on('confirmation', (confNumber, receipt) => {
            console.log('confirmation');
        })
        .on('error', (error) => {
            console.log(error);
        });
    }

}