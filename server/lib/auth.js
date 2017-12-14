const jwtMiddleware = require('express-jwt');

const cache = require('@huibao/cachehelper');
const Member = require('../models/Member');

const bearerStrategy = function (req, payload, done) {
    let accessToken = fromHeaderOrQuerystring(req);
    cache.get('token', accessToken).then(user => {
        if(!user) {
            return done(null, true);
        }
        req.user = user;
        done(null, false);
    }).catch(err => {
        console.log(err);
        done(err);
    });
    // Member.findOne({accessToken: accessToken}, function(err, member) {
    //     if(!member) {
    //         return done(err, true);
    //     }
    //     let user = JSON.parse(JSON.stringify(member));
    //     delete user.password;
    //     delete user.keystore;
    //     req.user = user;
    //     done(err, false);
    // });
};
const fromHeaderOrQuerystring = function (req) {
    let parts = req.headers.authorization ? req.headers.authorization.split(' ') : 0;
    if (parts.length == 2) {
        let scheme = parts[0],
            credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
            return credentials;
        } else {
            return null;
        }
    } else {
        return req.headers.token || req.query.token;
    }
};
const middleeware = jwtMiddleware({
    secret: process.env.secret || '432sfsdg234gdfgdhuibaokeji',
    userProperty: 'payload',
    getToken: fromHeaderOrQuerystring,
    isRevoked: bearerStrategy
});
exports.jwt = middleeware;
exports.manager = function(req, res, next) {
    let user = req.user;
    if (!user || user.role != 'admin') {
        return next('admin only!');
    }
    next();
};