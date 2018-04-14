import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Web3Service } from '../service/index';

@Injectable()
export class BalanceResolver implements Resolve<any> {
    constructor(private web3: Web3Service) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.web3.getBalance();
    }
}

@Injectable()
export class BalanceWithAccountResolver implements Resolve<any> {
    constructor(private web3: Web3Service) { }
    async resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<any> {
        const account = route.params.account;
        console.log(account);
        return this.web3.getBalanceByAccount(account);
    }
}
