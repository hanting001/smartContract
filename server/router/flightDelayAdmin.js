const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const auth = require('../lib/auth');

const FlightDelay = require('../contracts/FlightDelay');
const HbStorage = require('../contracts/HbStorage');

module.exports = (server) => {
    this.path = '/flightDelayAdmin';
    server.get(this.path + '/setInterval/:interval', auth.jwt, auth.admin, async(req, res, next) => {
        try {
            const interval = Number(req.params.interval);
            
            const flightDelaySC = await FlightDelay.instance();
            const result = await flightDelaySC.setInterval(interval);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
};