import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCCService } from '../service/wcc.service';
import { Web3Service } from '../service/index';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    betInfos: any[];
    subscription;
    constructor(private wccService: WCCService, private web3: Web3Service) { }

    ngOnInit() {
        this.web3.check();
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
                this.wccService.getUserBetsInfo().then(infos => {
                    console.log(infos);
                    this.betInfos = infos;
                });
            }
            this.envState = tempEnvState;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
