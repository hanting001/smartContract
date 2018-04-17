import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCCService } from '../service/wcc.service';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Web3Service, LoadingService, AlertService, LocalActionService } from '../service/index';

@Component({
    selector: 'app-trans',
    templateUrl: './trans.component.html',
    styleUrls: ['./trans.component.css']
})
export class TransComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    betInfos: any[] = [];
    voteInfos: any[] = [];
    subscription;
    loadingProgress = 0;
    constructor(
        private wccService: WCCService,
        private web3: Web3Service,
        public localActionSer: LocalActionService,
        public wccSer: WCCService,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
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
                this.refresh(1);
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
        this.loading.show();
        const gameIndexes = await this.wccService.getUserVotedGameIndexes();
        this.loading.hide();
        for (let i = 0; i < gameIndexes.length; i++) {
            const gameInfo = await this.wccService.getGameInfo(gameIndexes[i]);
            const voteInfos = [];
            const voteInfo = await this.wccService.getUserVoteInfo(gameIndexes[i], gameInfo);
            const gameVoteInfo = await this.wccSer.getVoteInfo(gameIndexes[i]);
            voteInfo.weight =  (Number(voteInfo.value) / (Number(gameVoteInfo.yesCount) + Number(gameVoteInfo.noCount)) * 100).toFixed(2);
            console.log(voteInfo);
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
        this.loading.show();
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
            this.loadingProgress = Number((this.betInfos.length / joinedGameIndexes.length).toFixed(2)) * 100;
            console.log(this.betInfos);
        }
        this.loadingProgress = 0;
    }

    async winBet(gameInfo, bet) {
        // this.loadingSer.show('Sending Transaction');
        console.log(gameInfo);
        console.log(bet);
        const gameIndex = this.wccSer.getGameIndex(gameInfo.p1, gameInfo.p2, gameInfo.gameType);
        const scoreIndex = this.wccSer.getScoreIndex(bet.score);

        const check = await this.wccSer.claimCheck(gameIndex, scoreIndex);
        console.log(check);
        if (check.checkResult != 0) {
            this.loadingSer.hide();
            return this.alertSer.show(check.message);
        }

        this.wccSer.claim(gameIndex, scoreIndex, async (transactionHash) => {
            await this.localActionSer.addAction({
                transactionHash: transactionHash, netType: this.envState.netType,
                model: { gameInfo: gameInfo, bet: bet }, createdAt: new Date(), type: 'claim'
            }, this.envState.account);
        }, async (confirmNum, receipt) => {
            if (confirmNum == 1) {
                this.loadingSer.hide();
                this.alertSer.show('claim success!');
            }
        }, async (err) => {
            console.log(err);
            this.loadingSer.hide();
            this.alertSer.show('User denied transaction signature');
        });


    }

    refresh(type) {
        if (type === 1) {
            this.betInfos = [];
            this.getBetInfos();
        } else if (type === 2) {
            this.voteInfos = [];
            this.getVoteInfos();
        }
    }
}
