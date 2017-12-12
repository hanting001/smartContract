const web3 = require('../lib/web3');
const errors = require('restify-errors');

const Member = require('../models/Member');

module.exports = (server) => {
    this.path = '/account';
    server.post(this.path + '/new', async(req, res, next) => {
        let input = req.body.member;
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
            let result = web3.account.new(member.password);
            member.account = result.address;
            member.keystore = new Buffer.from(JSON.stringify(result.keystore));
            delete result.keystore;
            res.send(result);
            next();
            member.save();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });

    server.post(this.path + '/restore', async(req, res, next) => {
        let password = 'alfjahhljalf';
        let mnemonic = req.body.mnemonic;
        try {
            let result = web3.account.restore(password, mnemonic);
            res.send(result);
            next();
        } catch (err) {
            next(new Error('boom!'));
        }
    });
}