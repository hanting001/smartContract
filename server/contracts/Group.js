const Web3 = require('../lib/web3');

const abi = require('../../build/contracts/Group').abi;

const SmartContract = require('../models/SmartContract');

class GroupContract {
    static async instance(address) {
        if (!address) {
            let sc = await SmartContract.findOne({
                name: 'group'
            });
            address = sc.address;
        }
        const web3 = Web3.instance();
        let instance = new GroupContract();
        instance.sc = new web3.eth.Contract(abi, address);
        return instance;
    }
}