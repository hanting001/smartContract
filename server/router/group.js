const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const BN = require('bn.js');

const auth = require('../lib/auth');
const GroupSC = require('../contracts/Group');
const KnotToken = require('../contracts/KnotToken');
const socket = require('../lib/socket.io');

const Member = require('../models/Member');
const SC = require('../models/SmartContract');

module.exports = (server) => {
    this.path = '/group';
    server.post(this.path + '/open', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const input = req.body.input;
            if (!input.password) {
                throw '用户密码不能为空';
            }
            if (!input.groupName) {
                throw 'groupName不能为空';
            }
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            const groupSC = await GroupSC.instance(null, input.groupName);
            myWeb3.account.unlock(member, input.password);
            const result = await groupSC.openByAdmin(req.user.account);
            myWeb3.account.lock(req.user.account);
            res.send({
                output: {}
            });
            socket.groupUpdated();
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.post(this.path + '/close', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const input = req.body.input;
            if (!input.password) {
                throw '用户密码不能为空';
            }
            if (!input.groupName) {
                throw 'groupName不能为空';
            }
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            const groupSC = await GroupSC.instance(null, input.groupName);
            myWeb3.account.unlock(member, input.password);
            const result = await groupSC.closeByAdmin(req.user.account);
            myWeb3.account.lock(req.user.account);
            res.send({
                output: {}
            });
            socket.groupUpdated();
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.post(this.path + '/lottery', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const input = req.body.input;
            if (!input.password) {
                throw '用户密码不能为空';
            }
            if (!input.groupName) {
                throw 'groupName不能为空';
            }
            const interval = Math.floor(Math.random() * 8) + 2;
            const groupSC = await GroupSC.instance(null, input.groupName);
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            myWeb3.account.unlock(member, input.password);
            const winner = await groupSC.getWinner();
            if (myWeb3.isAddress(winner)) {
                throw '不要重复开奖';
            }
            const params = [Number(interval)];
            const result = await groupSC.lotteryByAdmin(req.user.account, params);
            myWeb3.account.lock(req.user.account);
            res.send({
                output: result
            });
            next();
            socket.groupUpdated();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/getWinner/:name', auth.jwt, async(req, res, next) => {
        try {
            const scName = req.params.name;
            const groupSC = await GroupSC.instance(null, scName);
            const account = await groupSC.getWinner();
            const winner = await Member.findOne({
                account: account
            }).select({
                name: 1,
                nickname: 1,
                account: 1
            });
            res.send({
                output: winner
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.post(this.path + '/receiveBonus', auth.jwt, async(req, res, next) => {
        try {
            const input = req.body.input;
            if (!input.password) {
                throw '用户密码不能为空';
            }
            if (!input.groupName) {
                throw 'groupName不能为空';
            }
            const groupSC = await GroupSC.instance(null, input.groupName);
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            const isAwarded = await groupSC.isAwarded();
            if (isAwarded) {
                throw '奖金已被领取';
            }
            myWeb3.account.unlock(member, input.password);
            const result = await groupSC.receiveBonusByMember(req.user.account);
            myWeb3.account.lock(req.user.account);
            member.winTimes++;
            member.save();
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.post(this.path + '/join', auth.jwt, async(req, res, next) => {
        try {
            const input = req.body.input;
            //加入活动扣一个代币
            const value = 1;

            if (!input.password) {
                throw '用户密码不能为空';
            }
            if (!input.groupName) {
                throw 'groupName不能为空';
            }
            const knotToken = await KnotToken.instance();
            const groupSC = await GroupSC.instance(null, input.groupName);
            const account = req.user.account;
            if (!account) {
                throw '用户的以太坊account不能为空';
            }
            if (!groupSC) {
                throw '合约地址为空，请检查输入参数';
            }
            const balanceStr = await knotToken.balanceOf(req.user.account);
            const balance = new BN(balanceStr.token);
            if (balance.lt(value)) {
                throw '代币余额不足1个';
            }
            const isOpen = await groupSC.isOpen();
            if (!isOpen) {
                throw '活动还未开放';
            }
            const member = await Member.findOne({
                name: req.user.name
            });
            if (!member.validPassword(input.password)) {
                throw '密码不正确';
            }
            console.log(member);
            //两次确认授权后，让用户加入group
            const confirmApprove = async(confirmationNumber, receipt) => {
                if (confirmationNumber == 2) {
                    //join group
                    try {
                        await groupSC.joinByMember(account);
                        myWeb3.account.lock(account);
                        res.send({
                            output: receipt
                        });
                        socket.groupUpdated();
                        next();
                    } catch (err) {
                        console.log(err);
                        next(new errors.InternalServerError(err));
                    }

                }
            };
            //unlock用户账户,先让用户授权group合约可以扣token
            myWeb3.account.unlock(member, input.password);
            await knotToken.approveByMember(account, groupSC.sc.options.address, value, confirmApprove);
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });

    server.get(this.path + '/isOpen/:name', auth.jwt, async(req, res, next) => {
        try {
            const scName = req.params.name;
            const groupSC = await GroupSC.instance(null, scName);
            const result = await groupSC.isOpen();
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });

    server.get(this.path + '/isJoined/:name', auth.jwt, async(req, res, next) => {
        try {
            const scName = req.params.name;
            const groupSC = await GroupSC.instance(null, scName);
            if (!groupSC) {
                throw '合约地址为空，请检查输入参数';
            }
            const account = req.user.account;
            if (!account) {
                throw '用户的以太坊account不能为空';
            }
            const result = await groupSC.isJoined(account);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/list', auth.jwt, async(req, res, next) => {
        try {
            const groups = await SC.find({
                name: {
                    $ne: 'knotCoin'
                }
            }).select({
                name: 1,
                address: 1,
                createdAt: 1
            });
            const returnGroups = [];
            for (let group of groups) {
                const g = Object.assign({}, group.toObject());
                const groupSC = await GroupSC.instance(group.address);
                const members = await groupSC.members()
                g.members = members.length;
                g.isJoined = await groupSC.isJoined(req.user.account);
                const winner = await groupSC.getWinner();
                g.isOpen = await groupSC.isOpen();
                g.isAwarded = await groupSC.isAwarded();
                if (myWeb3.isAddress(winner)) {
                    g.getWinner = true;
                }
                console.log(g);
                returnGroups.push(g);
            }
            res.send({
                output: {
                    groups: returnGroups
                }
            })
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    })
}