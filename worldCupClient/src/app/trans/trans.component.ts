import { Component, OnInit } from '@angular/core';
import { WCCService } from '../service/wcc.service';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit {
    betInfos: any[];
    constructor(private wccService: WCCService) { }

    ngOnInit() {
        this.wccService.getUserBetsInfo().then(infos => {
            console.log(infos);
            this.betInfos = infos;
        });
    }

}
