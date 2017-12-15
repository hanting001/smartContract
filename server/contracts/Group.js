const Web3 = require('../lib/web3');

const abi = Web3.getABI('Group');
const SmartContract = require('../models/SmartContract');

class GroupContract {
    static async instance(address, name) {
        if (!address) {
            let sc = await SmartContract.findOne({
                name: name
            });
            if (sc) {
                address = sc.address;
            }
        }
        if (!address) {
            return null;
        }
        const web3 = Web3.instance();
        let instance = new GroupContract();
        instance.sc = new web3.eth.Contract(abi, address);
        return instance;
    }
    async open() {
        let accouts = await Web3.instance().eth.getAccounts();
        let from = accouts[0];
        return this.sc.methods.open().send({
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
    async isOpen(account) {
        return this.sc.methods.isOpen().call({from:account});
    }
}

module.exports = GroupContract;