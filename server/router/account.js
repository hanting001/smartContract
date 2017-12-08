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
        res.send('一定要记住：' + mnemonic);
        next();
    });
}