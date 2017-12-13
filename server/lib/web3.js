const Mnemonic = require('bitcore-mnemonic');
const BN = require('bn.js');
const Web3 = require('web3');

module.exports = (() => {
    return {
        init: (conf) => {
            this.web3 = new Web3();
            console.log('JSON-RPC:' + conf.get('httpProvider', 'http://localhost:8545'));
            this.web3.setProvider(conf.get('httpProvider', 'http://localhost:8545'));
        },
        instance: () => {
            return this.web3;
        },
        account: {
            new: (password) => {
                const code = new Mnemonic(Mnemonic.Words.CHINESE);
                const web3 = this.web3;
                // console.log(web3.eth.accounts.wallet);
                let mnemonic = code.toString();
                // console.log(mnemonic);
                const master = code.toHDPrivateKey(password);
                const masterPrivateKey = master.toObject().privateKey;
                console.log('0x' + masterPrivateKey);
                //child_0_1_2h = master.deriveChild("m/0/1/2'");
                let account = web3.eth.accounts.privateKeyToAccount('0x' + masterPrivateKey);
                const keystore = account.encrypt(password);
                const acc = web3.eth.accounts.decrypt(keystore, password);
                console.log(account.address);
                // console.log(keystore);
                console.log(acc.address);
                return {
                    mnemonic: mnemonic,
                    keystore: keystore,
                    address: account.address
                }
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
            }
        },
        eth: {
            estimateGas: async(abi, params, to) => {
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
            }
        }
    }
})()