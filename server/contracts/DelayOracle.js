const myWeb3 = require('../lib/web3');
const moment = require('moment');
const abi = myWeb3.getABI('DelayOracle');
const SmartContract = require('../models/SmartContract');

class DelayOracle {
    static async instance(address) {
        if (!address) {
            let sc = await SmartContract.findOne({
                name: 'delayOracle'
            });
            if (sc) {
                address = sc.address;
            }
        }
        if (!address) {
            return null;
        }
        const web3 = myWeb3.instance();
        let instance = new DelayOracle();
        instance.sc = new web3.eth.Contract(abi, address);
        instance.sc.events.LogDelayInfoUpdated()
            .on('data', (event) => {
                console.log('LogDelayInfoUpdated fired');
            })
            .on('error', console.error);
        instance.sc.events.LogNewOraclizeQuery()
            .on('data', (event) => {
                console.log('LogNewOraclizeQuery fired');
            })
            .on('error', console.error);
        return instance;
    }
    async doQueryByAdmin(flightNo, flightDate, onConfirmation) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; // 因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
        if (global.env == 'test') { // 测试环境需要先对账户解锁
            web3.eth.personal.unlockAccount(from, 'Huibao12346', web3.utils.toHex(15000));
        }
        const abi = myWeb3.getABI('DelayOracle', 'query');
        flightDate = moment(flightDate).format('YYYY-MM-DD');
        const params = [flightNo, flightDate];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        txObj.value = 2 * txObj.gas;
        console.log(`sendTransaction from ${from} to ${this.sc.options.address}`);
        return web3.eth.sendTransaction(txObj)
            // return this.sc.methods.query(100).send({from: from})
            .on('transactionHash', (transactionHash) => {
                console.log(`delayOracle doQueryByAdmin txHash: ${transactionHash}`);
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
    async getResult(flightNo, flightDate) {
        const web3 = myWeb3.instance();
        const key = web3.utils.keccak256(flightNo + moment(flightDate).format('YYYY-MM-DD'));
        console.log(`key: ${key}`);
        const queryID = await this.sc.methods.queryID().call();
        console.log(`queryID: ${queryID}`);
        const record = await this.sc.methods.queryRecords(queryID).call();
        const result = await this.sc.methods.results(key).call();
        const queryStr = await this.sc.methods.queryStr1().call();
        return {
            queryID: queryID,
            record: record,
            result: result,
            queryStr: queryStr
        }
    }
    async test() {
        return this.sc.methods.checkDelay().call();
    }
}

module.exports = DelayOracle;