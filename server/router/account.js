const Web3 = require('../lib/web3');

module.exports = (server) => {
    server.get('/account/new', async(req, res, next) => {
        const web3 = Web3.instance();
        // console.log(web3.eth.accounts.wallet);
        let account = web3.eth.accounts.create();
        const keystore = account.encrypt('alfjahhljalf');
        const acc = web3.eth.accounts.decrypt(keystore, 'alfjahhljalf');
        console.log(account);
        console.log(keystore);
        console.log(acc);
        res.send('OK');
        next();
    });
}