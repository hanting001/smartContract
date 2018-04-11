import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Injectable()
export class LocalActionService {

    private myActions: [any];
    private MY_ACTION = 'my_action';

    constructor(protected localStorage: LocalStorage) {

    }

    async getMyActions(account) {
        const myPromise = () => {
            return new Promise((resolve, reject) => {
                this.localStorage.getItem(this.MY_ACTION).subscribe((obj) => {
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

    async addAction(sfInfo: any, account) {

        const myPromise = () => {
            return new Promise((resolve, reject) => {
                try {
                    this.localStorage.getItem(this.MY_ACTION).subscribe((obj) => {
                        if (!obj) {
                            obj = {};
                        }

                        if (!obj[account]) {
                            obj[account] = [];
                        }
                        obj[account].push(sfInfo);

                        console.log(account);
                        console.log(obj);
                        this.localStorage.setItem(this.MY_ACTION, obj).subscribe((result) => {
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
