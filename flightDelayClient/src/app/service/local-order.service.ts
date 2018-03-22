import { Injectable } from '@angular/core';
import { AsyncLocalStorage } from 'angular-async-local-storage';

@Injectable()
export class LocalOrderService {
    private myOrders: [any];
    private MY_ORDER = 'my_order';

    constructor(protected localStorage: AsyncLocalStorage) {

    }

    async getMyOrders() {
        const myPromise = () => {
            return new Promise((resolve, reject) => {
                this.localStorage.getItem(this.MY_ORDER).subscribe((orders) => {
                    if (!orders || orders.length === 0) {
                        orders = [];
                    }
                    resolve(orders);
                }, (err) => {
                    reject(err);
                });

            });
        };

        return await myPromise();
    }

    async addOrder(sfInfo: any) {

        const myPromise = () => {
            return new Promise((resolve, reject) => {
                try {
                    this.localStorage.getItem(this.MY_ORDER).subscribe((orders) => {
                        if (!orders || orders.length === 0) {
                            orders = [];
                        }
                        orders.push(sfInfo);
                        this.localStorage.setItem(this.MY_ORDER, orders).subscribe((result) => {
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
