const Web3 = require('web3');

const utility = require('./utility');
const KnotToken = require('../build/contracts/KnotToken');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:9545'));
const args = process.argv;
const code = KnotToken.bytecode;

const token = new web3.eth.Contract(KnotToken.abi);

const deploy = async function () {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    console.log(account);
    if (args[2]) {
        web3.eth.personal.unlockAccount(account, args[2], web3.utils.toHex(15000));
    }
    const obj = token.deploy({
        data: code
    });
    const gas = await obj.estimateGas();
    const newContractInstance = await obj.send({
        from: account,
        gasLimit: gas * 2
    });
    console.log(newContractInstance.options.address);
    utility.updateDB('knotCoin', newContractInstance.options.address);
}

deploy();