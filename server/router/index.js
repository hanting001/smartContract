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
    this.path + '/buyToken' 购买代币
    this.path + '/login'    用户名密码登陆获取token
    */
    require('./account')(server);

    /*
    this.path + '/open/:name'   置开发状态
    */
    require('./group')(server);
}