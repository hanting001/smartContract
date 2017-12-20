const Mnemonic = require('bitcore-mnemonic');
const BN = require('bn.js');
const Web3 = require('web3');

module.exports = (() => {
    return self = {
        init: (conf) => {
            this.web3 = new Web3();
            console.log('JSON-RPC:' + conf.get('httpProvider', 'http://localhost:8545'));
            this.web3.setProvider(conf.get('httpProvider', 'http://localhost:8545'));
        },
        instance: () => {
            return this.web3;
        },
        wallet: {
            show: () => {
                const web3 = this.web3;
                return web3.eth.accounts.wallet;
            }
        },
        account: {
            new: async(password) => {
                const code = new Mnemonic(Mnemonic.Words.CHINESE);
                const web3 = this.web3;
                let mnemonic = code.toString();
                // console.log(mnemonic);
                const master = code.toHDPrivateKey(password);
                const masterPrivateKey = master.toObject().privateKey;
                // console.log('0x' + masterPrivateKey);
                //child_0_1_2h = master.deriveChild("m/0/1/2'");
                let account = web3.eth.accounts.privateKeyToAccount('0x' + masterPrivateKey);
                //加到钱包中
                // web3.eth.accounts.wallet.add(account);
                const keystore = account.encrypt(password);
                const acc = web3.eth.accounts.decrypt(keystore, password);
                // console.log(account.address);
                // console.log(keystore);
                // console.log(acc.address);
                return {
                    mnemonic: mnemonic,
                    keystore: keystore,
                    address: account.address
                }
                // const address = await web3.eth.personal.newAccount(String(password));
                // return {
                //     mnemonic: 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat',
                //     keystore: new Buffer(''),
                //     address: address
                // }
            },
            restore: (password, mnemonic) => {
                console.log(mnemonic);
                const code = new Mnemonic(mnemonic);
                const web3 = this.web3;
                const master = code.toHDPrivateKey(password);
                const masterPrivateKey = master.toObject().privateKey;
                let account = web3.eth.accounts.privateKeyToAccount('0x' + masterPrivateKey);
                return {
                    mnemonic: mnemonic,
                    address: account.address
                }
            },
            unlock: (member, password, duration) => {
                const web3 = this.web3;
                const keystore = web3.eth.accounts.decrypt(JSON.parse(member.keystore.toString()), password);
                web3.eth.accounts.wallet.add(keystore.privateKey);
                // return web3.eth.personal.unlockAccount(member.account, password, duration);
            },
            lock: (account) => {
                const web3 = this.web3;
                web3.eth.accounts.wallet.remove(account);
            }
        },
        eth: {
            estimateGas: async(contract, params, to) => {
                const abi = self.getABI(contract.name, contract.func);
                const web3 = this.web3;
                let code = web3.eth.abi.encodeFunctionCall(abi, params);
                // console.log(code);
                let dataObject = {
                    to: to,
                    data: code
                };
                let gas = await web3.eth.estimateGas(dataObject);
                let gasPrice = await web3.eth.getGasPrice();
                let total = new BN(gas * Number(gasPrice));
                // console.log(`gas:${gas}, gasPrice:${gasPrice}, total:${total}`);
                return web3.utils.fromWei(total);
            },
            sendEth: async(to, value) => {
                const web3 = this.web3;
                const accouts = await web3.eth.getAccounts();
                try {
                    value = String(value);
                } catch (err) {
                    throw err;
                }
                if (value == 0) {
                    throw 'value不能是0';
                }
                const from = accouts[0];
                const txObject = {
                    from: from,
                    to: to,
                    value: web3.utils.toWei(value)
                };
                console.log(`ETH转账 from: ${from}, to: ${to}, value: ${web3.utils.toWei(value)}`);
                return web3.eth.sendTransaction(txObject)
                    .on('transactionHash', function (hash) {
                        console.log(`sendEth: ${hash}`);
                    })
                    .on('receipt', function (receipt) {
                        console.log(receipt);
                    })
                    .on('confirmation', function (confirmationNumber, receipt) {
                        if (confirmationNumber == 6) {
                            console.log('send eth confirmed. do something');
                        }
                    })
                    .on('error', console.error);
            }
        },
        //计算代币最小单位
        toStrand: (ktc)=> {
            return Number(ktc) * 10 ** 8;
        },
        //计算代币最大单位
        fromStrand: (strand) => {
            strand = new BN(strand);
            return this.web3.utils.fromWei(strand.mul(new BN(1 * 10 ** 10)));
        },
        //得到合约的ABI接口
        getABI: function (name, func) {
            const abi = require('../../build/contracts/' + name).abi;
            if (!func) {
                return abi;
            }
            for (let i = 0; i < abi.length; i++) {
                const item = abi[i];
                if (item.name == func) {
                    return item;
                }
            }
        },
        getTransactionObj: async(from, to, code) => {
            const dataObject = {
                from: from,
                to: to,
                data: code
            };
            let gas = await this.web3.eth.estimateGas(dataObject);
            return {
                from: from,
                to: to,
                data: code,
                gasLimit: gas * 2
            }
        }
    }
})()