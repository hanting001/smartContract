const Web3 = require('../lib/web3');

const abi = require('../../build/contracts/KnotToken').abi;

const SmartContract = require('../models/SmartContract');

class KnotToken {
    static async instance(address) {
        if (!address) {
            let sc = await SmartContract.findOne({name: 'knotCoin'});
            address = sc.address;
        }
        const web3 = Web3.instance();
        let instance = new KnotToken();
        instance.sc = new web3.eth.Contract(abi, address);
        instance.sc.events.Transfer((err, event) => {
            console.log('both ganache and testrpc dose not support web socket prvider');
        });
        return instance;
    }
    async balanceOf(account) {
        if (!account) {
            let accouts = await web3.eth.getAccounts();
            address = accouts[0];
        }
        return this.sc.methods.balanceOf(account).call();
    }
    async transfer(to, value) {
        const web3 = Web3.instance();
        let accouts = await web3.eth.getAccounts();
        let from = accouts[0];
        // console.log(`from: ${from}, to: ${to}`);
        return this.sc.methods.transfer(to, value).send({
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

module.exports = KnotToken;