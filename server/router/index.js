const errors = require('restify-errors');

const myWeb3 = require('../lib/web3');
const wallet = require('../services/wallet');
const GroupSC = require('../contracts/Group');

module.exports = (server) => {
    /*
    /balanceOf/:account     获取账户余额（代币）
    /transfer/:to/:value    代币转账
    /contract/deployed      保存最新部署的合约信息到db
    /estimateETH            评估合约调用所需要的ETH
    */
    require('./main')(server);

    /*
    this.path + '/new'      创建新账号
    this.path + '/restore'  根据助记码和密码恢复账号
    this.path + '/buyToken' 购买代币,转账代币和eth到客户账户
    this.path + '/login'    用户名密码登陆获取token
    */
    require('./account')(server);

    /*
    this.path + '/open/:name'   管理员置活动开放状态
    this.path + '/isOpen/:name  查看活动是否开放
    this.path + '/join/:name'   加入某个活动, 先授权活动合约可以扣代币，然后在把用户加入到活动合约用户组中
    this.path + '/isJoined/:name'   用户查看自己是否已经加入了活动
    this.path + '/close'        管理员将活动关闭
    this.path + '/lottery'      管理员开奖
    this.path + '/getWinner/:name   查看获奖者
    this.path + '/receiveBonus' 获奖者领取奖金
    this.path + '/list'         列出所有活动
    */
    require('./group')(server);

    /*
    this.path + /getSFInfo/:flightNO/:flightDate   获取航班相关信息

    */
    require('./flightDelay')(server);

    /*
    this.path + /setInterval/:interval      设置可购买时间距离当前时间的间隔（单位小时）
    this.path + '/setAdminSC/:address'      将某合约地址设置到hbStorage的管理地址列表中
    this.path + '/isAdminSC/:address'       查询某合约地址是否在hbStorage的管理地址中
    */
    require('./flightDelayAdmin')(server);

    server.get('/test/:length', async(req, res, next) => {
        try {
            const groupSC = await GroupSC.instance(null, 'G00000001');
            const random = await groupSC.sc.methods.getRandom(Number(req.params.length), 8).call();
            // const closeNumber = await groupSC.sc.methods.closeBlockNumber().call();
            res.send({
                output: {
                    random: random
                }
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
}