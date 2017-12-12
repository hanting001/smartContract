const KnotToken = require('../contracts/KnotToken');

const SC = require('../models/SmartContract');

module.exports = (server) => {
    server.get('/balanceOf/:account', async(req, res, next) => {
        let knot = await KnotToken.instance();
        let balance = await knot.balanceOf(req.params.account);
        res.send(balance);
        next();
    });

    server.get('/transfer/:to', async(req, res, next) => {
        let knot = await KnotToken.instance();
        try {
            let result = await knot.transfer(req.params.to, 8888);
            // console.log(result);
            res.send(result);
        } catch (err) {
            console.log(err);
            res.send('err');
        }
        next()
    });

    server.post('contract/deployed', async(req, res, next) => {
        let contractInfo = req.body.contractInfo;
        contractInfo.$push = {historyAddresses: contractInfo.address};
        console.log(contractInfo);
        try {
            let result = await SC.findOneAndUpdate({
                name: contractInfo.name
            }, contractInfo, {
                upsert: true,
                setDefaultsOnInsert: true
            });
            res.send(result);
        } catch (err) {
            console.log(err);
            res.send('err');
        }
    });
}