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
        const web3 = Web3.instance();
        if (!account) {
            let accouts = await web3.eth.getAccounts();
            account = accouts[0];
        }
        return this.sc.methods.balanceOf(account).call();
    }
    async transfer(to, value, from, onConfirmation, onError) {
        const web3 = Web3.instance();
        let accouts = await web3.eth.getAccounts();
        if(!from) {
            from = accouts[0];
        }
        console.log(`代币转账 from: ${from}, to: ${to}, value: ${value}`);
        return this.sc.methods.transfer(to, value).send({
            from: from
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            if(onConfirmation) {
                onConfirmation(confirmationNumber, receipt);
            }
        })
        .on('error', (err, receipt) => {
            if (onError) {
                onError(err, receipt);
            }
        });;
    }
}

module.exports = KnotToken;