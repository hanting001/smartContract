const KnotToken = require('../contracts/KnotToken');

module.exports = (server) => {
    server.get('/balanceOf/:address', async(req, res, next) => {
        let knot = new KnotToken('0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f');
        let balance = await knot.balanceOf(req.params.address);
        res.send(balance);
        next();
    });

    server.get('/transfer/:to', async(req, res, next) => {
        let knot = new KnotToken('0x8f0483125fcb9aaaefa9209d8e9d7b9c8b9fb90f');
        try {
            let result = await knot.transfer(req.params.to, 8888);
            // console.log(result);
            res.send(result);
        } catch (err) {
            // console.log(err);
            res.send('err');
        }
        next()
    });
}