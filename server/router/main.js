const errors = require('restify-errors');

const Web3 = require('../lib/web3');
const web3 = Web3.instance()
const KnotToken = require('../contracts/KnotToken');
const auth = require('../lib/auth');

const SC = require('../models/SmartContract');

module.exports = (server) => {
    server.get('/balanceOf/:account', auth.jwt, async(req, res, next) => {
        try {
            let knot = await KnotToken.instance();
            let balance = await knot.balanceOf(req.params.account);
            res.send({
                output: balance
            });
            next();
        } catch (err) {
            res.send(new errors.InternalServerError(err));
        }
    });

    server.get('/transfer/:to/:value', async(req, res, next) => {
        let knot = await KnotToken.instance();
        try {
            let value = Number(req.params.value);
            console.log(value * 10 ** 8);
            let result = await knot.transfer(req.params.to, value * 10 ** 8);
            res.send(result);
        } catch (err) {
            res.send(new errors.InternalServerError(err));
        }
        next()
    });

    server.post('/contract/deployed', async(req, res, next) => {
        let contractInfo = req.body.contractInfo;
        contractInfo.$push = {
            historyAddresses: contractInfo.address
        };
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
            res.send(new errors.InternalServerError(err));
        }
    });

    server.get('/estimateETH', async(req, res, next) => {
        let functionABI = {
            "constant": false,
            "inputs": [{
                    "name": "_spender",
                    "type": "address"
                },
                {
                    "name": "_value",
                    "type": "uint256"
                }
            ],
            "name": "approve",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        };
        try {
            let knotCoin = await SC.findOne({
                name: 'knotCoin'
            });
            let params = [web3.eth.getAccounts()[0], 2 * 10 ** 8];
            let need = await Web3.eth.estimateGas(functionABI, params, knotCoin.address);
            res.send({
                need: need
            });
        } catch (err) {
            console.log(err);
            res.send(new errors.InternalServerError(err));
        }
    });
}