const Web3 = require('../lib/web3');
const errors = require('restify-errors');
const BN = require('bn.js');

const auth = require('../lib/auth');
const GroupSC = require('../contracts/Group');
const KnotToken = require('../contracts/KnotToken');

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

    server.post(this.path + '/join/', auth.jwt, async(req, res, next) => {
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
            const group = await GroupSC.instance(null, input.groupName);
            const account = req.user.account;
            if (!account) {
                throw '用户的以太坊account不能为空';
            }
            if (!group) {
                throw '合约地址为空，请检查输入参数';
            }
            const balanceStr = await knotToken.balanceOf(req.user.account);
            const balance = new BN(balanceStr);
            if (balance.lt(new BN(Web3.toStrand(value)))) {
                throw '代币余额不足1个';
            }
            const isOpen = await group.isOpen();
            if (!isOpen) {
                throw '活动还未开放';
            }
            //两次确认授权后，让用户加入group
            const confirmApprove = async(confirmationNumber, receipt) => {
                if (confirmationNumber == 2) {
                    //join group

                    res.send({
                        output: receipt
                    });
                    next();
                }
            };
            //unlock用户账户,先让用户授权group合约可以扣token
            const member = await Member.findOne({
                name: req.user.name
            });
            Web3.account.unlock(member, input.password);
            await knotToken.approveByMember(member.account, group.sc.options.address, value, confirmApprove);
            Web3.account.lock(member.account);
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}