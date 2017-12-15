const errors = require('restify-errors');

const wallet = require('../services/wallet');

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
    this.path + '/buyToken' 购买代币,住账号转账代币和eth到客户账户
    this.path + '/login'    用户名密码登陆获取token
    */
    require('./account')(server);

    /*
    this.path + '/open/:name'   置活动开放状态
    this.path + '/join/:name'   加入某个活动, 先授权活动合约可以扣代币，然后在把用户加入到活动合约用户组中
    */
    require('./group')(server);

    server.get('/test', async(req, res, next) => {
        try {
            const currentWallet = wallet.getCurrent();
            console.log(currentWallet);
            res.send({
                output: currentWallet.length
            });
            next();
        } catch (err) {
            next(new errors.InternalServerError(err));
        }
    });
}