const web3 = require('../lib/web3');

module.exports = (server) => {
    this.path = '/account';
    server.get(this.path + '/new', async(req, res, next) => {
        let password = 'alfjahhljalf';
        try {
            let result = web3.account.new(password);
            res.send(result);
            next();
        } catch (err) {
            next(new Error('boom!'));
        }
    });

    server.post(this.path + '/restore', async(req, res, next) => {
        let password = 'alfjahhljalf';
        let mnemonic = req.body.mnemonic;
        try {
            let result = web3.account.restore(password, mnemonic);
            res.send(result);
            next();
        } catch (err) {
            next(new Error('boom!'));
        }
    });
}