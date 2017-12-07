const KnotToken = require('../contracts/KnotToken');

module.exports = (server) => {
    server.get('/balanceOf/:address', async(req, res, next) => {
        let knot = new KnotToken('0x345ca3e014aaf5dca488057592ee47305d9b3e10');
        let balance = await knot.balanceOf(req.params.address);
        res.send(balance);
        next();
    });

    server.get('/transfer/:to', async(req, res, next) => {
        let knot = new KnotToken('0x345ca3e014aaf5dca488057592ee47305d9b3e10');
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