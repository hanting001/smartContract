const Web3 = require('../lib/web3');
const errors = require('restify-errors');
const cache = require('@huibao/cachehelper');

const Member = require('../models/Member');
const auth = require('../lib/auth');

module.exports = (server) => {
    this.path = '/account';
    server.post(this.path + '/new', auth.jwt, async(req, res, next) => {
        let input = req.body.input;
        try {
            if (!input.name || !input.password) {
                throw `输入数据错误`;
            }
            let member = await Member.findOne({
                name: input.name
            });
            if (member) {
                throw `该用户名：${input.name}已经存在`;
            }
            member = new Member(input);
            member = await member.save();
            let result = Web3.account.new(input.password);
            member.account = result.address;
            member.keystore = new Buffer.from(JSON.stringify(result.keystore));
            delete result.keystore;
            res.send({
                output: result
            });
            next();
            member.save();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });

    server.post(this.path + '/restore', async(req, res, next) => {
        let input = req.body.input;
        let password = input.password;
        let mnemonic = input.mnemonic;
        try {
            let result = Web3.account.restore(password, mnemonic);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });

    server.post(this.path + '/buyToken', async() => {

    });
    server.post(this.path + '/login', async(req, res, next) => {
        let input = req.body.input;
        try {
            if (!input || !input.name || !input.password) {
                throw '输入数据错误';
            }
            let member = await Member.findOne({
                name: input.name
            });
            if (!member || !member.validPassword(input.password)) {
                throw '用户不存在或密码错误';
            }
            await cache.del(member.accessToken);
            member.accessToken = member.generateJWT();
            let user = JSON.parse(JSON.stringify(member));
            delete user.password;
            delete user.keystore;
            cache.put('token', member.accessToken, user);
            await member.save();
            res.send({
                output: {
                    token: member.accessToken
                }
            });
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err))
        }
    });
}