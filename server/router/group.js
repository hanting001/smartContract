const web3 = require('../lib/web3');
const errors = require('restify-errors');

const GroupSC = require('../contracts/Group');

module.exports = (server) => {
    this.path = '/group';
    server.get(this.path + '/open/:name', async(req, res, next) => {
        try {
            let scName = req.params.name;
            let groupSC = await GroupSC.instance(null, scName);
            let result = await groupSC.open();
            res.send(result);
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}