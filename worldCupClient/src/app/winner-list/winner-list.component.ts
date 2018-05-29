import { Component, OnInit, OnDestroy } from '@angular/core';
import { Web3Service, WCCService } from '../service/index';

@Component({
    selector: 'app-winner-list',
    templateUrl: './winner-list.component.html',
    styleUrls: ['./winner-list.component.css']
})
export class WinnerListComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    subscription;
    showDatas: any[];
    loadingProgress: Number = 0;
    contries: any;
    constructor(
        private web3: Web3Service,
        private wccService: WCCService
    ) { }

    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getWinners();
                    }
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3.check();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    async getWinners() {
        const list = await this.wccService.getWccClaimEvents();
        this.showDatas = [];
        for (let i = 0; i < list.length; i++) {
            const log = list[i].returnValues;
            log.tx = list[i].transactionHash;
            const net = await this.web3.instance().eth.net.getNetworkType();
            if (net != 'main') {
                log.url = `https://${net}.etherscan.io/tx/${log.tx}`;
            } else {
                log.url = `https://etherscan.io/tx/${log.tx}`;
            }

            const gameInfo = await this.wccService.getGameInfo(log._gameIndex);
            const scoreInfo = await this.wccService.getUserScoreInfo(log._gameIndex, log._scoreIndex, log.user);
            log.gameInfo = gameInfo;
            log.scoreInfo = scoreInfo;
            this.showDatas.push(log);
            this.loadingProgress = Number((this.showDatas.length / list.length).toFixed(2)) * 100;
        }
        this.loadingProgress = 0;
    }
    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
    }
}
