import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCCService } from '../service/wcc.service';
import { Web3Service, LoadingService } from '../service/index';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    betInfos: any[];
    subscription;
    loadingProgress = 0;
    constructor(
        private wccService: WCCService,
        private web3: Web3Service,
        private loading: LoadingService) { }

    ngOnInit() {
        this.web3.check();
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true &&
                (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account)
            ) {
                // this.wccService.getUserBetsInfo().then(infos => {
                //     console.log(infos);
                //     this.betInfos = infos;
                // });
                this.getBetInfos();
            }
            this.envState = tempEnvState;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    async getBetInfos() {
        this.loading.show();
        this.betInfos = [];
        const joinedGameIndexes = await this.wccService.getUserJoinedGameIndexes();
        this.loading.hide();
        for (let i = 0; i < joinedGameIndexes.length; i++) {
            const gameInfo = await this.wccService.getGameInfo(joinedGameIndexes[i]);
            const scoreIndexes = await this.wccService.getUserJoinedGameScoreIndexes(joinedGameIndexes[i]);
            const scoreInfos = [];
            const obj = {
                gameInfo: gameInfo,
                scoreInfos: scoreInfos
            };
            this.betInfos.push(obj);
            for (let j = 0; j < scoreIndexes.length; j++) {
                const scoreInfo = await this.wccService.getUserJoinedGameScoreInfo(joinedGameIndexes[i], gameInfo, scoreIndexes[j]);
                scoreInfos.push(scoreInfo);
            }
            this.loadingProgress = Number((this.betInfos.length / joinedGameIndexes).toFixed(2)) * 100;
        }
        this.loadingProgress = 0;
    }
}
