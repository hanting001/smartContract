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
                gasLimit: gas * 2
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
    async transfer(to, value, from, onConfirmation, onError) {
        const web3 = myWeb3.instance();
        let accouts = await web3.eth.getAccounts();
        if (!from) {
            from = accouts[0];
        }
        console.log(`代币转账 from: ${from}, to: ${to}, value: ${value}`);
        return this.sc.methods.transfer(to, value).send({
                from: from
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                onConfirmation(confirmationNumber, receipt);
            })
            .on('error', (err, receipt) => {
                if (onError) {
                    onError(err, receipt);
                }
            });
    }
}

module.exports = KnotToken;