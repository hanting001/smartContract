'use strict';
const Configue = require('configue');

module.exports = (() => {
    let configueOptions = {};
    console.log('process.env.NODE_ENV :' + process.env.NODE_ENV);
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        configueOptions = {
            files: [{
                    file: __dirname + '/../config/development.json'
                },
                {
                    file: __dirname + '/../config/config.json'
                }
            ]
        }
    } else if (process.env.NODE_ENV === 'test') {
        configueOptions = {
            files: [{
                    file: __dirname + '/../config/test.json'
                },
                {
                    file: __dirname + '/../config/config.json'
                }
            ]
        }
    } else if (process.env.NODE_ENV === 'production') {
        configueOptions = {
            files: [{
                file: __dirname + '/../config/config.json'
            }]
        }
    }
    const conf = new Configue(configueOptions);
    return conf;
})()