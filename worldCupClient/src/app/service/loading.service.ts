import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';

@Injectable()
export class LoadingService {
    private loadingObservable: Subject<any> = new Subject<any>();
    constructor() {

    }

    show(text?) {
        if (!text) {
            text = 'Sending Transaction';
        }
        this.loadingObservable.next({ loading: true, loadingText: text });
    }

    hide() {
        this.loadingObservable.next({ loading: false });
    }

    getLoadingObservable(): Subject<any> {
        return this.loadingObservable;
    }

}
