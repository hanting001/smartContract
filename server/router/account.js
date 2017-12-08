const web3 = require('../lib/web3');

module.exports = (server) => {
    server.get('/account/new', async(req, res, next) => {
        let password = 'alfjahhljalf';
        try {
            let result = web3.account.new(password);
            res.send(result);
            next();
        } catch (err) {
            next(new Error('boom!'));
        }
    });

    server.post('/account/restore', async(req, res, next) => {
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