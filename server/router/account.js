const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const cache = require('@huibao/cachehelper');

const Member = require('../models/Member');
const auth = require('../lib/auth');
const KnotToken = require('../contracts/KnotToken');

const socket = require('../lib/socket.io');

module.exports = (server) => {
    this.path = '/account';
    server.post(this.path + '/new', async(req, res, next) => {
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
            // member = await member.save();
            let result = await myWeb3.account.new(input.password);
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
            let result = myWeb3.account.restore(password, mnemonic);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/checkLogin', auth.jwt, (req, res, next) => {
        res.send({
            output: 'ok'
        })
    });
    server.post(this.path + '/buyToken', auth.jwt, async(req, res, next) => {
        try {
            const input = req.body.input;
            const knotToken = await KnotToken.instance();

            const onConfirmation = async(confirmationNumber, receipt) => {
                if (confirmationNumber == 2) {
                    // automining的时候可以认为交易已经确认了。在正式的快链上，确认交易提交需要在confirmation的事件里头
                    const need = await myWeb3.eth.estimateEth();
                    await myWeb3.eth.sendEth(req.user.account, Number(need) * 4);
                    socket.accountUpdated(input.socketId);
                }
            };
            const onError = (err, receipt) => {
                throw err;
            };
            //转对应的token到用户账户，第三个账户为空表示从主账户转出
            const receipt = await knotToken.transfer(
                req.user.account, //to
                myWeb3.toStrand(Number(input.value)), //value
                null, //from, 因为是默认账户部署的token合约，所以这里也用默认账户发起交易
                onConfirmation,
                onError
            );
            // automining的时候可以认为交易已经确认了。在正式的块链上，确认交易提交需要在confirmation的事件里头
            // await myWeb3.eth.sendEth(req.user.account, 0.02);
            res.send({
                output: receipt
            })
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err))
        }
    });
    server.post(this.path + '/buyEth', auth.jwt, async(req, res, next) => {
        try {
            const input = req.body.input;
            if (!input.password) {
                throw '用户密码不能为空';
            }
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            const account = req.user.account;
            const knotToken = await KnotToken.instance();
            const balance = await knotToken.balanceOf(account)
            if (Number(balance.token) < 1) {
                throw '代币不足，请购买代币';
            }
            const need = await myWeb3.eth.estimateEth();
            //主账户转eth给用户
            const receipt1 = await myWeb3.eth.sendEth(req.user.account, Number(need) * 4);

            myWeb3.account.unlock(member, input.password);
            //用户转1个代币到token账户,to:null 转到默认账户 from: account
            const receipt2 = await knotToken.transfer(null, myWeb3.toStrand(1), account);
            myWeb3.account.lock(account);
            socket.accountUpdated(input.socketId);
            res.send({
                output: {
                    receipts: [receipt1, receipt2]
                }
            })
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err))
        }
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
            await cache.del('token', member.accessToken);
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
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err))
        }
    });
}