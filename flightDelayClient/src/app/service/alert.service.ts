import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export class AlertService {
    private alertObservable: Subject<any> = new Subject<any>();
    constructor() { }

    show(msg) {
        this.alertObservable.next({ show: true, msg: msg });
    }

    hide() {
        this.alertObservable.next({ show: false });
    }

    getAlertObservable(): Subject<any> {
        return this.alertObservable;
    }


}
