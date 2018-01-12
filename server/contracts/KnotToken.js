const myWeb3 = require('../lib/web3');
const BN = require('bn.js');
const abi = myWeb3.getABI('KnotToken');

const SmartContract = require('../models/SmartContract');

class KnotToken {
    static async instance(address) {
        if (!address) {
            let sc = await SmartContract.findOne({
                name: 'knotCoin'
            });
            address = sc.address;
        }
        const web3 = myWeb3.instance();
        let instance = new KnotToken();
        instance.sc = new web3.eth.Contract(abi, address);
        instance.sc.events.allEvents()
            .on('data', (event) => {
                console.log('event fired');
            });;
        return instance;
    }
    async balanceOf(account) {
        //默认第一个账户发起请求
        const web3 = myWeb3.instance();
        const eth = await web3.eth.getBalance(account);
        const token = await this.sc.methods.balanceOf(account).call();
        return {
            eth: web3.utils.fromWei(eth),
            token: myWeb3.fromStrand(token)
        }
    }
    async approveByMember(account, spender, value, onConfirmation, onError) {
        const web3 = myWeb3.instance();
        const abi = myWeb3.getABI('KnotToken', 'approve');
        if (!spender) {
            const web3 = myWeb3.instance();
            const accouts = await web3.eth.getAccounts();
            spender = accouts[0];
        }
        const params = [spender, myWeb3.toStrand(value)];
        let code = web3.eth.abi.encodeFunctionCall(abi, params);
        const tokenSC = this.sc.options.address;;
        const dataObject = {
            from: account,
            to: tokenSC,
            data: code
        };
        let gas = await web3.eth.estimateGas(dataObject);
        // console.log(gas);
        return web3.eth.sendTransaction({
                from: account,
                to: tokenSC,
                data: code,
                gas: gas * 2
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                if (onConfirmation) {
                    onConfirmation(confirmationNumber, receipt);
                }
            })
            .on('error', (err, receipt) => {
                if (onError) {
                    onError(err, receipt);
                }
            });

        //下面的代码
        // return this.sc.methods.approve(to, value).send({
        //         from: account
        //     })
        //     .on('confirmation', function (confirmationNumber, receipt) {
        //         if (onConfirmation) {
        //             onConfirmation(confirmationNumber, receipt);
        //         }
        //     })
        //     .on('error', (err, receipt) => {
        //         if (onError) {
        //             onError(err, receipt);
        //         }
        //     });
    }
    async transfer(transTo, value, from, onConfirmation, onError) {
        const web3 = myWeb3.instance();
        let accouts = await web3.eth.getAccounts();
        if (!from) { // 因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
            from = accouts[0];
            if (global.env == 'test') { // 测试环境需要先对账户解锁
                web3.eth.personal.unlockAccount(from, 'Huibao12346', web3.utils.toHex(15000));
            }
        }
        if (!transTo) {
            transTo = accouts[0];
        }
        const abi = myWeb3.getABI('KnotToken', 'transfer');
        const params = [transTo, value];
        let code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        console.log(`代币转账 from: ${from}, to: ${transTo}, value: ${value}`);
        return web3.eth.sendTransaction(txObj)
            .on('confirmation', function (confirmationNumber, receipt) {
                if (onConfirmation) {
                    onConfirmation(confirmationNumber, receipt);
                }
            })
            .on('error', (err, receipt) => {
                if (onError) {
                    onError(err, receipt);
                }
            });
    }
    async transferFrom(transFrom, transTo, txFrom, value, onConfirmation, onError) {
        const web3 = myWeb3.instance();
        let accouts = await web3.eth.getAccounts();
        if (!transFrom) { // 因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
            transFrom = accouts[0];
        }
        if (!transTo) {
            transTo = accouts[0];
        }
        if (!txFrom) {
            txFrom = accouts[0];
            if (global.env == 'test') { // 测试环境需要先对账户解锁
                web3.eth.personal.unlockAccount(txFrom, 'Huibao12346', web3.utils.toHex(15000));
            }
        }
        console.log(`代币转账 from: ${transFrom}, to: ${transTo}, value: ${value}`);
        return this.sc.methods.transferFrom(transFrom, transTo, value).send({
                from: txFrom
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                if (onConfirmation) {
                    onConfirmation(confirmationNumber, receipt);
                }
            })
            .on('error', (err, receipt) => {
                if (onError) {
                    onError(err, receipt);
                }
            });
    }
}

module.exports = KnotToken;