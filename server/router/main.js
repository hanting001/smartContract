const errors = require('restify-errors');
const BN = require('bn.js');
const myWeb3 = require('../lib/web3');
const web3 = myWeb3.instance()
const KnotToken = require('../contracts/KnotToken');
const DelayOracle = require('../contracts/DelayOracle');
const auth = require('../lib/auth');

const SC = require('../models/SmartContract');

module.exports = (server) => {
    server.get('/balanceOf/:account', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            let knot = await KnotToken.instance();
            let balance = await knot.balanceOf(req.params.account);
            res.send({
                output: balance
            });
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });
    server.get('/balance', auth.jwt, async(req, res, next) => {
        try {
            let account = req.user.account;
            let knot = await KnotToken.instance();
            let balance = await knot.balanceOf(account);
            
            res.send({
                output: balance
            });
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });
    server.get('/transfer/:to/:value', auth.jwt, async(req, res, next) => {
        let knot = await KnotToken.instance();
        try {
            let value = Number(req.params.value);
            let result = await knot.transfer(req.params.to, myWeb3.toStrand(value), req.user.account);
            res.send(result);
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });

    server.post('/contract/deployed', async(req, res, next) => {
        let contractInfo = req.body.contractInfo;
        contractInfo.$push = {
            historyAddresses: contractInfo.address
        };

        try {
            let result = await SC.findOneAndUpdate({
                name: contractInfo.name
            }, contractInfo, {
                upsert: true,
                setDefaultsOnInsert: true
            });
            res.send(result);
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });

    server.get('/estimateETH', auth.jwt, async(req, res, next) => {
        try {
            let knotCoin = await SC.findOne({
                name: 'knotCoin'
            });
            
            let params = [web3.eth.getAccounts()[0], 2 * 10 ** 8];
            let need = await myWeb3.eth.estimateGas({
                name: 'KnotToken',
                func: 'approve'
            }, params, knotCoin.address);
            res.send({
                need: need
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });

    //测试环境可以调用
    server.get('/test/oracle', auth.jwt, async(req, res, next) => {
        if (global.env != 'test') {
            return res.send({
                output: {
                    message: '测试环境可用'
                }
            });
            next();
        }
        try {
            const flightNo = req.params.flightNo;
            if (!flightNo) {
                throw '航班号不能为空';
            }
            const flightDate = req.params.flightDate;
            if (!flightDate) {
                throw '航班日期不能为空';
            }

            const delayOracleSC = await DelayOracle.instance();
            
            const result = await delayOracleSC.doQueryByAdmin(flightNo, flightDate);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get('/test/oracle/result', auth.jwt, async(req, res, next) => {
        if (global.env != 'test') {
            return res.send({
                output: {
                    message: '测试环境可用'
                }
            });
            next();
        }
        try {
            const flightNo = req.params.flightNo;
            if (!flightNo) {
                throw '航班号不能为空';
            }
            const flightDate = req.params.flightDate;
            if (!flightDate) {
                throw '航班日期不能为空';
            }

            const delayOracleSC = await DelayOracle.instance();
            
            const result = await delayOracleSC.getResult(flightNo, flightDate);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}