import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';

@Injectable()
export class AlertService {
    private alertObservable: Subject<any> = new Subject<any>();
    private confirmObservable: Subject<any> = new Subject<any>();
    constructor() { }

    show(msg) {
        this.alertObservable.next({ show: true, msg: msg });
    }
    confirm(msg) {
        this.alertObservable.next({ show: true, msg: msg, confirm: true });
    }
    doConfirm() {
        this.confirmObservable.next();
    }
    hide() {
        this.alertObservable.next({ show: false });
    }
    getAlertObservable(): Subject<any> {
        return this.alertObservable;
    }
    getComfirmObservable(): Subject<any> {
        return this.confirmObservable;
    }
}
