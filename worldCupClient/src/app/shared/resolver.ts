import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { FlightDelayService } from '../service/index';

@Injectable()
export class BalanceResolver implements Resolve<any> {
    constructor(private flightDelayService: FlightDelayService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        return this.flightDelayService.getBalance();
    }
}

@Injectable()
export class BalanceWithAccountResolver implements Resolve<any> {
    constructor(private flightDelayService: FlightDelayService) { }
    async resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<any> {
        const account = route.params.account;
        console.log(account);
        return this.flightDelayService.getBalanceByAccount(account);
    }
}
