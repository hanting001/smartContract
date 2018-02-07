const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const auth = require('../lib/auth');

const FlightDelay = require('../contracts/FlightDelay');
const HbStorage = require('../contracts/HbStorage');
module.exports = (server) => {
    this.path = '/flightDelay';
    server.get(this.path + '/getSFInfo/:flightNO/:flightDate', auth.jwt, async (req, res, next) => {
        try {
            const flightNO = req.params.flightNO;
            const flightDate = req.params.flightDate;
            const flightDelaySC = await FlightDelay.instance();
            const result = await flightDelaySC.getSFInfo(flightNO, flightDate, req.user.account);

            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/getVotingSF', auth.jwt, async (req, res, next) => {
        try {
            const hbStorageSC = await HbStorage.instance();
            const result = await hbStorageSC.getVotingInfo();
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.post(this.path + '/joinSF/:flightNO/:flightDate', auth.jwt, async (req, res, next) => {
        try {
            const input = req.body.input;
            /*
                开始校验
                1 日期格式校验
                2 购买日期距离当前时间不能少于合约定义的interval个小时
                3 该航班还有购买余额
                4 航班处于开放状态
                5 不能重复购买
                6 需要有购买资格，没有的话用token换取
                如有投票信息还需要
                1 对投票做校验
                2 对投票的航班做校验
            */

        } catch (err) {

        }
    });
};