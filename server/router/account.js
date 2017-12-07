const Mnemonic = require('bitcore-mnemonic');


const Web3 = require('../lib/web3');

module.exports = (server) => {
    server.get('/account/new', async(req, res, next) => {
        let password = 'alfjahhljalf';
        // const code = new Mnemonic('才 有 劝 攻 佳 驶 塑 妙 壤 迁 看 繁');
        const code = new Mnemonic(Mnemonic.Words.CHINESE);
        const web3 = Web3.instance();
        // console.log(web3.eth.accounts.wallet);
        let mnemonic = code.toString();
        // console.log(mnemonic);
        var parent = code.toHDPrivateKey();
        console.log(parent.deriveChild(0));
        let account = web3.eth.accounts.privateKeyToAccount(web3.utils.toHex(parent.toString()));
        const keystore = account.encrypt(password);
        const acc = web3.eth.accounts.decrypt(keystore, password);
        console.log(account.address);
        // console.log(keystore);
        // console.log(acc);
        res.send('一定要记住：' + mnemonic);
        next();
    });
}