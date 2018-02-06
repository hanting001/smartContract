const myWeb3 = require('../lib/web3');
const errors = require('restify-errors');
const auth = require('../lib/auth');

const FlightDelay = require('../contracts/FlightDelay');
const HbStorage = require('../contracts/HbStorage');

module.exports = (server) => {
    this.path = '/flightDelayAdmin';
    server.get(this.path + '/setInterval/:interval', auth.jwt, auth.manager, async(req, res, next) => {
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
    server.get(this.path + '/setAdminSC/:address', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const address = req.params.address;
            
            const flightDelaySC = await FlightDelay.instance();
            const result = await flightDelaySC.setAdmin(address);
            res.send({
                output: result
            });
            next();
        } catch (err) {
            console.log(err);
            next(new errors.InternalServerError(err));
        }
    });
    server.get(this.path + '/isAdminSC/:address', auth.jwt, auth.manager, async(req, res, next) => {
        try {
            const address = req.params.address;
            const flightDelaySC = await FlightDelay.instance();
            const result = await flightDelaySC.isAdmin(address);
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