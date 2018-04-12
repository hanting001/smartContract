import { Component, OnInit } from '@angular/core';
import { WCCService } from '../service/wcc.service';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit {

    constructor(private wccService: WCCService) { }

    ngOnInit() {
        this.wccService.getUserBetsInfo().then(info => {

        });
    }

}
