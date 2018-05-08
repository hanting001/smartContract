const request = require('request-promise-native');
const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3();
const conf = require('../server/lib/config');

web3.setProvider(new web3.providers.HttpProvider(conf.get('httpProvider')));

module.exports = {
    updateDB: async(name, scName, address) => {
        // let options = {
        //     uri: conf.get('apiHost') + '/contract/deployed',
        //     method: 'POST',
        //     body: {
        //         contractInfo: {
        //             name: name,
        //             scName: scName,
        //             address: address
        //         }
        //     },
        //     json: true
        // };
        // return request(options);
        const net = await web3.eth.net.getNetworkType();
        console.log(net);
        const path = `${__dirname}/db/${net}.json`;
        let raw = fs.readFileSync(path);
        console.log(raw);
        if (raw == '') {
            raw = JSON.stringify({});
        }
        const data = JSON.parse(raw);
        data[name] = {
            scName: scName,
            address: address
        };
        fs.writeFileSync(path, JSON.stringify(data));
    },
    deploy: async(contract, password, params) => {
        const contractJson = require('../build/contracts/' + contract);
        const contractObj = new web3.eth.Contract(contractJson.abi);
        const code = contractJson.bytecode;
        console.log(`-------${contract}开始部署--------`);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        // if (password) {//password
        //     web3.eth.personal.unlockAccount(account, password, web3.utils.toHex(15000));
        // }
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
            gas: gas * 2
        });
        console.log(`-------部署结束，地址:${newContractInstance.options.address}--------`)
        return newContractInstance.options.address;
    }
}
