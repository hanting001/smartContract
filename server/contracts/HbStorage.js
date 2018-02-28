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
    async removeAdmin(address) {
        const web3 = myWeb3.instance();
        if (!web3.utils.isAddress(address)) {
            return {
                address: {
                    isAdmin: false
                }
            };
        }
        const params = [address];
        const abi = myWeb3.getABI('HbStorage', 'removeAdmin');
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
    async getVotingInfo() {
        const web3 = myWeb3.instance();
        const currentVote = await this.sc.methods.currentVote().call();
        // if (currentVote != '') {
        return {
            sfIndex: currentVote,
            sfinfo: await this.sc.methods.voteInfos(currentVote).call()
        }
        // }
    }
    //查询航班是否开放购买
    async isOpening(flightNO, flightDate) {
        const web3 = myWeb3.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        return this.sc.methods.isOpening(key).call();
    }
    //查询用户是否已经购买了该航班
    async isInSF(flightNO, flightDate, account) {
        const web3 = myWeb3.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        return this.sc.methods.isInSF(key).call({from: account});
    }
} 
module.exports = HbStorage;