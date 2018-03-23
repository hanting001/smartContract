import { Web3Service } from './';
import { Injectable } from '@angular/core';
import { AsyncLocalStorage } from 'angular-async-local-storage';

@Injectable()
export class LocalOrderService {
    private myOrders: [any];
    private MY_ORDER = 'my_order';

    constructor(protected localStorage: AsyncLocalStorage) {

    }

    async getMyOrders(account) {
        const myPromise = () => {
            return new Promise((resolve, reject) => {
                this.localStorage.getItem(this.MY_ORDER).subscribe((obj) => {
                    if (!obj) {
                        resolve([]);
                        return;
                    }

                    if (!obj[account]) {
                        resolve([]);
                        return;
                    }


                    resolve(obj[account]);
                }, (err) => {
                    reject(err);
                });

            });
        };

        return await myPromise();
    }

    async addOrder(sfInfo: any, account) {

        const myPromise = () => {
            return new Promise((resolve, reject) => {
                try {
                    this.localStorage.getItem(this.MY_ORDER).subscribe((obj) => {
                        if (!obj) {
                            obj = {};
                        }

                        if (!obj[account]) {
                            obj[account] = [];
                        }
                        obj[account].push(sfInfo);

                        console.log(account);
                        console.log(obj);
                        this.localStorage.setItem(this.MY_ORDER, obj).subscribe((result) => {
                            console.log(result);
                            resolve(result);
                        });
                    });
                } catch (err) {
                    console.error(err);
                    reject(err);
                }
            });
        };
        return await myPromise();



    }

}
