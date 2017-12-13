const web3 = require('../lib/web3');
const errors = require('restify-errors');

const GroupSC = require('../contracts/Group');

module.exports = (server) => {
    this.path = '/group';
    server.get(this.path + '/open', async(req, res, next) => {
        try {
            let groupSC = await GroupSC.instance(null, 'G00000002');
            let result = await groupSC.open();
            res.send(result);
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}