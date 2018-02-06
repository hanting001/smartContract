const myWeb3 = require('../lib/web3');
const moment = require('moment');
const abi = myWeb3.getABI('HbStorage');
const SmartContract = require('../models/SmartContract');
const secret = require('../lib/secret');

let instance;
class HbStorage {
    static async instance(address) {
        if (!instance) {
            if (!address) {
                let sc = await SmartContract.findOne({
                    name: 'hbStorage'
                });
                if (sc) {
                    address = sc.address;
                }
            }
            if (!address) {
                return null;
            }
            const web3 = myWeb3.instance();
            instance = new HbStorage();
            instance.sc = new web3.eth.Contract(abi, address);
        }
        return instance;
    }
    async setAdmin(address) {
        const web3 = myWeb3.instance();
        if (!web3.utils.isAddress(address)) {
            return {
                address: {
                    isAdmin: false
                }
            };
        }
        const params = [address];
        const abi = myWeb3.getABI('HbStorage', 'setAdmin');
        const scAddress = this.sc.options.address;
        await myWeb3.sendTransactionByAdmin(abi, params, scAddress);
        const isAdmin = await this.sc.methods.admins(address).call();
        const obj = {};
        obj[address] = {
            isAdmin: isAdmin
        };
        return obj;
    }
    async isAdmin(address) {
        const web3 = myWeb3.instance();
        if (!web3.utils.isAddress(address)) {
            return false;
        }
        return this.sc.methods.admins(address).call();
    }
}
module.exports = HbStorage;