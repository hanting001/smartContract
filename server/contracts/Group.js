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
        instance.sc.events.allEvents()
            .on('data', (event) => {
                console.log('event fired');
            });
        return instance;
    }
    async openByAdmin(account, onConfirmation) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; //因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
        const abi = myWeb3.getABI('Group', 'open');
        const params = [];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        return web3.eth.sendTransaction(txObj)
            .on('transactionHash', (transactionHash) => {
                console.log(`group openByAdmin txHash: ${transactionHash}`);
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
    async closeByAdmin(account, onConfirmation) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; //因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
        const abi = myWeb3.getABI('Group', 'close');
        const params = [];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, this.sc.options.address, code);
        return web3.eth.sendTransaction(txObj)
            .on('transactionHash', (transactionHash) => {
                console.log(`group closeByAdmin txHash: ${transactionHash}`);
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
    async lotteryByAdmin(account, params, onConfirmation) {
        const web3 = myWeb3.instance();
        const accouts = await web3.eth.getAccounts();
        const from = accouts[0]; //因为group合约使用accounts[0]部署的，所以这里还是使用accounts[0],将来admin部署合约就要使用admin的account
        const to = this.sc.options.address;
        const abi = myWeb3.getABI('Group', 'lottery');
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, to, code);
        return web3.eth.sendTransaction(txObj)
            .on('transactionHash', (transactionHash) => {
                console.log(`lotteryByAdmin txHash: ${transactionHash}`);
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
    async receiveBonusByMember(account, onConfirmation) {
        const web3 = myWeb3.instance();
        const from = account;
        const to = this.sc.options.address;
        const abi = myWeb3.getABI('Group', 'receiveBonus');
        const params = [];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(from, to, code);
        return web3.eth.sendTransaction(txObj)
            .on('transactionHash', (transactionHash) => {
                console.log(`receiveBonusByMember txHash: ${transactionHash}`);
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
    async joinByMember(account, onConfirmation, onError) {
        const web3 = myWeb3.instance();
        const abi = myWeb3.getABI('Group', 'join');
        const params = [];
        const code = web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await myWeb3.getTransactionObj(account, this.sc.options.address, code);
        return web3.eth.sendTransaction(txObj)
            .on('confirmation', function (confNumber, receipt) {
                if (confNumber == 1) {
                    console.log('member join confirmation');
                }
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (err, receipt) => {
                console.log(err);
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
    async getWinner() {
        return this.sc.methods.winner().call();
    }
    async isOpen() {
        return this.sc.methods.isOpen().call();
    }
    async isJoined(account) {
        return this.sc.methods.membersInGroup(account).call();
    }
    async members() {
        return this.sc.methods.getMembers().call();
    }
}

module.exports = GroupContract;