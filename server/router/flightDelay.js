const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const moment = require('moment');
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
    server.get(this.path + '/joinSF/:flightNO/:flightDate', auth.jwt, async (req, res, next) => {
        try {
            const flightNO = req.params.flightNO;
            const flightDate = req.params.flightDate;
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
            const m = moment(flightDate);
            if (!m.isValid()) {
                throw '日期格式不正确';
            }
            const flightDelaySC = await FlightDelay.instance();
            const hbStorageSC = await HbStorage.instance();
            const sfInfo = await flightDelaySC.getSFInfo(flightNO, flightDate, req.user.account);
            console.log(sfInfo);
            const now = moment();
            if(now.add(sfInfo.interval, 'hours').isAfter(m)) {
                throw `航班日期必须大于当前日期${sfInfo.interval}个小时`;
            }
            if (sfInfo.count >= sfInfo.maxCount) {
                throw `该航班已满额`;
            }
            const isOpening = await hbStorageSC.isOpening(flightNO, flightDate);
            if (!isOpening) {
                throw '该航班已关闭购买';
            }
            const isInSF = await hbStorageSC.isInSF(flightNO, flightDate, req.user.account);
            if (isInSF) {
                throw '不能重复购买'
            }
            if (!sfInfo.hasQualification) {//无购买资格，需用token换取购买资格

            }
            res.send({
                output: 'ok'
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
};