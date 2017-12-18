const myWeb3 = require('../lib/web3');

const abi = myWeb3.getABI('Group');
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
        const web3 = myWeb3.instance();
        let instance = new GroupContract();
        instance.sc = new web3.eth.Contract(abi, address);
        return instance;
    }
    async open() {
        const abi = myWeb3.getABI('KnotToken', 'approve');
        let accouts = await myWeb3.instance().eth.getAccounts();
        let from = accouts[0];
        return this.sc.methods.open().send({
                from: from
            })
            .on('transactionHash', (transactionHash) => {
                console.log(transactionHash);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (confNumber == 1) {
                    console.log('confirmation');
                }
            })
            .on('error', (error) => {
                console.log(error);
            });
    }
    async joinByMember(account, onConfirmation) {
        const web3 = myWeb3.instance();
        const abi = myWeb3.getABI('Group', 'join');
        const params = [];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const to = this.sc.options.address;
        const dataObject = {
            from: account,
            to: to,
            data: code
        };
        let gas = await web3.eth.estimateGas(dataObject);
        return web3.eth.sendTransaction({
            from: account,
            to: to,
            data: code,
            gasLimit: gas * 2
        })
        .on('confirmation', function (confNumber, receipt) {
            if (confNumber == 1) {
                console.log('member join confirmation');
            }
            if (onConfirmation) {
                onConfirmation(confNumber, receipt);
            }
        })
        .on('error', (err, receipt) => {
            if (onError) {
                onError(err, receipt);
            }
        });
        // return this.sc.methods.join().send({
        //     from: account
        // })
        // .on('confirmation', (confNumber, receipt) => {
        //     if (confNumber == 1) {
        //         console.log('member join confirmation');
        //     }
        //     if (onConfirmation) {
        //         onConfirmation(confNumber, receipt);
        //     }
        // })
        // .on('error', (error) => {
        //     console.log(error);
        // });
    }
    async isOpen() {
        return this.sc.methods.isOpen().call();
    }
    async isJoined(account) {
        return this.sc.methods.members(account).call();
    }
}

module.exports = GroupContract;