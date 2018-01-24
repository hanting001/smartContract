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
        instance.sc.events.allEvents()
            .on('data', (event) => {
                console.log('event fired');
            });
        return instance;
    }
    async doQueryByAdmin(flightNo, flightDate) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; // 因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
        if (global.env == 'test') { // 测试环境需要先对账户解锁
            web3.eth.personal.unlockAccount(from, 'Huibao12346', web3.utils.toHex(15000));
        }
        const abi = myWeb3.getABI('DelayOracle', 'getInfo');
        console.log(abi);
        flightDate = moment(flightDate).format('YYYY-MM-DD');
        const params = [flightNo, flightDate];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        // txObj.value = 2 * txObj.gas;
        // txObj.gas = 2 * txObj.gas;
        console.log(params);
        console.log(txObj);
        return web3.eth.sendTransaction(txObj)
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
        return this.sc.methods.results().call();
    }
}

module.exports = DelayOracle;