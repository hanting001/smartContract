const Web3 = require('web3');
const KnotToken = require('../build/contracts/KnotToken');

const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:9545'));

let account = web3.eth.accounts[0];
let args = process.argv;

if (args[2]) {
    web3.personal.unlockAccount(account, args[2], web3.toHex(15000));
}

const code = KnotToken.bytecode;

const token = new web3.eth.Contract(KnotToken.abi);

const deploy = async function () {
    const obj = token.deploy({
        data: code
    });
    console.log(obj);
}

deploy();