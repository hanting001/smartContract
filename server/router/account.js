const Mnemonic = require('bitcore-mnemonic');
// const code = new Mnemonic('才 有 劝 攻 佳 驶 塑 妙 壤 迁 看 繁');
const code = new Mnemonic();

const Web3 = require('../lib/web3');

module.exports = (server) => {
    server.get('/account/new', async(req, res, next) => {
        const password = 'alfjahhljalf';
        const web3 = Web3.instance();
        // console.log(web3.eth.accounts.wallet);
        let mnemonic = code.toString();
        // console.log(mnemonic);
        var xpriv = code.toHDPrivateKey(password + '1');
        let account = web3.eth.accounts.privateKeyToAccount(web3.utils.toHex(xpriv.toString()));
        const keystore = account.encrypt(password);
        const acc = web3.eth.accounts.decrypt(keystore, password);
        console.log(account.address);
        // console.log(keystore);
        // console.log(acc);
        res.send('一定要记住：' + mnemonic);
        next();
    });
}