import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';

import {
    Http,
    ConnectionBackend,
    Request,
    RequestOptions,
    RequestOptionsArgs,
    Response,
    Headers
} from '@angular/http';

import { environment as env } from '../../environments/environment';

@Injectable()
export class PayService {

    constructor(private http: HttpClient) {
        console.log('PayService');
        console.log(env.tiger);
    }

    private requestOptions(): any {
        const options: any = {};


        // const token = localStorage.getItem('jwtToken');
        const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NmYxMTlkM2YyMjBiYmZjMGQxNWZjZGMiLCJ1c2Vyb' +
            'mFtZSI6IjE4NzE3OTk2ODU3Iiwic2NvcGUiOlsiUk9MRV9VU0VSIiwiUk9MRV9QT0xJQ1lfQjJCIiwiUk9MRV9DTElFTlRfQjJCIl0sIm' +
            'V4cCI6MTUzNDU4MjMyMiwiaWF0IjoxNTI5Mzk4MzIyfQ.ZgYHTJb8JYJKHS4b6eO_28AYcVyZZ8Ut5zfFAWGD-x8';
        // if (token) {
        // options.headers.set('Autehtication', 'Bearer ' + token);
        // options.headers.set('Token', token);
        // }
        options.headers = new HttpHeaders({
            'Autehtication': 'Bearer ' + token,
            'Token': token
        });
        console.log(options.headers);

        return options;
    }

    private generateData(obj) {
        const data = {
            data: obj,
            reqId: 'req_' + new Date().getTime(),
            from: 'flightDelay',
            to: 'tiger'
        };

        return data;
    }
    // {'data':{},'reqId':'req_1500345881503','from':'bluewhale','to':'tiger'}

    // {'item':'TKZXZYB','itemTitle':'住院宝','itemDesc':'倪冰','totalFee':180,'source':'bluewhale','accountName':'panda','payOutTime':'2017-07-18T16:00:00.000Z'}
    async createOrder(rmb) {
        const params = {
            'item': 'FLIGHTDELAY', 'itemTitle': '航延互助计划', 'itemDesc': '航延',
            'totalFee': rmb, 'source': 'fightDelay', 'accountName': 'panda', 'payOutTime': moment().add(1, 'days').toDate()
        };
        return await this.http.post(env.tiger + 'api/order/new', this.generateData(params), this.requestOptions()).toPromise();
    }

    // return $http.post(HOSTS.tiger + '/api/pay/start', this.createReqObject(data)).then(function (result) {
    //             console.log(JSON.stringify(result));
    //             return result.data;
    //         }, function (err) {
    //             console.log(err);
    //             return { code: 999, msg: err };
    //         });

    //  return $http.get(HOSTS.panda + '/api/ecar/order?oid=' + oid).then(
    //             function(result) {
    //                 return result.data;
    //             },
    //             function(err) {
    //                 return err;
    //             }
    //         );

    async zfbPay(oid, accountName) {
        const data = {
            channel: 1,
            oid: oid,
            app: accountName
        };
        return await this.http.post(env.tiger + 'api/pay/start', this.generateData(data), this.requestOptions()).toPromise();
    }

    async getOrderInfo(oid) {
        return await this.http.post(env.tiger + 'api/order/orderInfo', this.generateData({ oid: oid }), this.requestOptions()).toPromise();
    }

}
