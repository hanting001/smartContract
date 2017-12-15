const web3 = require('../lib/web3');
const errors = require('restify-errors');

const auth = require('../lib/auth');
const GroupSC = require('../contracts/Group');

module.exports = (server) => {
    this.path = '/group';
    server.get(this.path + '/open/:name', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const scName = req.params.name;
            const groupSC = await GroupSC.instance(null, scName);
            const result = await groupSC.open();
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/join/:name', auth.jwt, async(req, res, next) => {
        try {
            const groupName = req.params.name;
            const groupSC = await GroupSC.instance(null, groupName);
            if (!groupSC) {
                throw '合约地址为空，请检查输入参数';
            }
            const isOpen = await groupSC.isOpen();
            if (!isOpen) {
                throw '活动还未开放';
            }
            
            res.send({
                output: 'result'
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}