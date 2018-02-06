const myWeb3 = require('../lib/web3');
const moment = require('moment');
const abi = myWeb3.getABI('FlightDelay');
const SmartContract = require('../models/SmartContract');
const secret = require('../lib/secret');

class FlightDelay {
    static async instance(address) {
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
        let instance = new FlightDelay();
        instance.sc = new web3.eth.Contract(abi, address);
        return instance;
    }
    async addMemberToSF(data, onConfirmation) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; // 默认由管理员发起交易
        if (global.env == 'test') { // 测试环境需要先对账户解锁
            web3.eth.personal.unlockAccount(from, secret.getPass(), web3.utils.toHex(15000));
        }

        const flightNo = data.flightNo;
        const flightDate = moment(data.flightDate).format('YYYY-MM-DD');;
        const account = data.account;
        const votedSFIndex = data.votedSFIndex? data.votedSFIndex: web3.utils.asciiToHex('');
        const vote = data.vote? data.vote: false;

        const abi = myWeb3.getABI('HbStorage', 'addMemberToSF');
        
        const params = [web3.utils.keccak256(flightNo + flightDate), account, votedSFIndex, vote];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        console.log(`sendTransaction from ${from} to ${this.sc.options.address}`);
        return web3.eth.sendTransaction(txObj)
            // return this.sc.methods.query(100).send({from: from})
            .on('transactionHash', (transactionHash) => {
                console.log(`FlightDelay addMemberToSF txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
            });
    }
    // async getResult(flightNo, flightDate, account) {
    //     const web3 = myWeb3.instance();
    //     const key = web3.utils.keccak256(flightNo + moment(flightDate).format('YYYY-MM-DD'));
    //     // const result = await this.sc.methods.scheduledFlights(key).call({from: account});
    //     // const isInSF = await this.sc.methods.isInSF(key).call({from: account});
    //     // const sfs = await this.sc.methods.returnSFs().call({from: account});
    //     // const members = await this.sc.methods.returnMembers(key).call();
    //     // result.members = members;
    //     // return {
    //     //     result: result,
    //     //     isInSF: isInSF,
    //     //     sfs: sfs
    //     // };
    //     const result = await this.sc.methods.testDateParser(flightNo).call();
    //     return {
    //         result: result
    //     }
    // }
    async getSFInfo(flightNO, flightDate, account) {
        const web3 = myWeb3.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        const price = await this.sc.methods.getPrice(flightNO).call();
        const hasQualification = await this.sc.methods.hasQualification(flightNO).call({from: account});
        const interval = await this.sc.methods.interval().call();
        const count = await this.sc.methods.getSFCount(key).call();
    }
}

module.exports = FlightDelay;