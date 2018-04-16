import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCCService } from '../service/wcc.service';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Web3Service, LoadingService } from '../service/index';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    betInfos: any[];
    voteInfos: any[];
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
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
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
    onSelect(data: TabDirective): void {
        console.log(data);
        if (data.id === 'Bets') {
            this.getBetInfos();
        } else if (data.id === 'Votes') {
            this.getVoteInfos();
        }
    }
    async getVoteInfos() {
        if (this.voteInfos && this.voteInfos.length > 0) {
            return;
        }
        const gameIndexes = await this.wccService.getUserVotedGameIndexes();
        for (let i = 0; i < gameIndexes.length; i++) {
            const gameInfo = await this.wccService.getGameInfo(gameIndexes[i]);
            const voteInfos = [];
            const voteInfo = await this.wccService.getUserVoteInfo(gameIndexes[i]);
            this.voteInfos.push({
                gameInfo: gameInfo,
                voteInfo: voteInfo
            });
            this.loadingProgress = Number((this.voteInfos.length / gameIndexes.length).toFixed(2)) * 100;
        }
        this.loadingProgress = 0;
    }
    async getBetInfos() {
        if (this.betInfos && this.betInfos.length > 0) {
            return;
        }
        const joinedGameIndexes = await this.wccService.getUserJoinedGameIndexes();
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
            this.loadingProgress = Number((this.betInfos.length / joinedGameIndexes.length).toFixed(2)) * 100;
        }
        this.loadingProgress = 0;
    }
    refresh(type) {
        if (type === 1) {
            this.getBetInfos();
        } else if (type === 2) {
            this.getVoteInfos();
        }
    }
}
