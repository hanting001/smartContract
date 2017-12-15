const Web3 = require('../lib/web3');

module.exports = {
    getCurrent: () => {
        console.log(111);
        return Web3.wallet.show();
    }
};