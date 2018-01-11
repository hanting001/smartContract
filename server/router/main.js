const errors = require('restify-errors');
const BN = require('bn.js');
const myWeb3 = require('../lib/web3');
const web3 = myWeb3.instance()
const KnotToken = require('../contracts/KnotToken');
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
            let group = await SC.findOne({
                name: 'G00000002'
            });
            let params = [web3.eth.getAccounts()[0], 2 * 10 ** 8];
            let need = await myWeb3.eth.estimateGas({
                name: 'KnotToken',
                func: 'approve'
            }, params, knotCoin.address);
            const need1 = await myWeb3.eth.estimateGas({
                name: 'Group',
                func: 'join'
            }, [], group.address);
            const total = Number(need) + Number(need1);
            res.send({
                need: total
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}