import { Subject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    private loadingObservable: Subject<any> = new Subject<any>();
    constructor() {

    }

    show(text?) {
        this.loadingObservable.next({ loading: true, loadingText: text });
    }

    hide() {
        this.loadingObservable.next({ loading: true });
    }

    getLoadingObservable(): Subject<any> {
        return this.loadingObservable;
    }

}
