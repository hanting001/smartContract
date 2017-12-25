const request = require('request-promise-native');
const Web3 = require('web3');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider(conf.get('httpProvider')));

const conf = require('../server/lib/config');

module.exports = {
    updateDB: (name, address) => {
        let options = {
            uri: conf.get('apiHost') + '/contract/deployed',
            method: 'POST',
            body: {
                contractInfo: {
                    name: name,
                    address: address
                }
            },
            json: true
        };
        return request(options);
    },
    deploy: async(contract, password, params) => {
        const contractJson = require('../build/contracts/' + contract);
        const contractObj = new web3.eth.Contract(contractJson.abi);
        const code = contractJson.bytecode;
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        if (password) {//password
            web3.eth.personal.unlockAccount(account, password, web3.utils.toHex(15000));
        }
        let options = {
            data: code
        };
        if (params) {
            options.arguments = params;
        }
        const obj = contractObj.deploy(options);
        const gas = await obj.estimateGas();
        const newContractInstance = await obj.send({
            from: account,
            gasLimit: gas * 2
        });
        return newContractInstance.options.address;
    }
}
