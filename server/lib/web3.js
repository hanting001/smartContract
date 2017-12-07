const Web3 = require('web3');

module.exports =( () => {
    return {
        init: (conf) => {
            this.web3 = new Web3();
            console.log(conf.get('rpcProvider', 'http://localhost:8545'));
            this.web3.setProvider(conf.get('httpProvider', 'http://localhost:8545'));
        },
        instance: () => {
            return this.web3;
        }
    }
})()