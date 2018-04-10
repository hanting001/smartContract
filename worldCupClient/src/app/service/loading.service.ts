import { Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    private loadingObservable: Subject<Boolean> = new Subject<Boolean>();
    constructor() {

    }

    show() {
        this.loadingObservable.next(true);
    }

    hide() {
        this.loadingObservable.next(false);
    }

    getLoadingObservable(): Subject<Boolean> {
        return this.loadingObservable;
    }

}
