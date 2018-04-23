import { Component, OnInit, OnDestroy } from '@angular/core';
import { WCCService } from '../../service/wcc.service';
import { TabDirective } from 'ngx-bootstrap/tabs';
import { Web3Service, LoadingService, AlertService, LocalActionService } from '../../service/index';

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
    myBalance: any = {};
    selectTab = 1;
    constructor(
        private wccService: WCCService,
        private web3: Web3Service,
        public localActionSer: LocalActionService,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        private loading: LoadingService) { }

    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            if (tempEnvState.checkEnv === true &&
                (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account)
            ) {
                if (tempEnvState.canLoadData) {
                    this.refresh(this.selectTab);
                }
            }
            this.envState = tempEnvState;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
    }
    onSelect(data: TabDirective): void {
        console.log(data);
        if (data.id === 'Bets') {
            this.selectTab = 1;
            this.getBetInfos();
        } else if (data.id === 'Votes') {
            this.selectTab = 2;
            this.getVoteInfos();
        } else if (data.id === 'Balance') {
            this.selectTab = 3;
            this.getBalanceAndWithdraw();
        }
    }
    async getBalanceAndWithdraw() {
        const balance = await this.web3.getBalance();
        const withdraw = await this.wccService.getUserWithdraw();
        this.myBalance = {
            eth: balance.eth,
            token: balance.token,
            withdraw: withdraw
        };
    }
    async getVoteInfos() {
        if (this.voteInfos && this.voteInfos.length > 0) {
            return;
        }
        console.log('get new data');
        this.loading.show();
        const gameIndexes = await this.wccService.getUserVotedGameIndexes();
        this.loading.hide();
        const temp = [];
        for (let i = 0; i < gameIndexes.length; i++) {
            const gameInfo = await this.wccService.getGameInfo(gameIndexes[i]);
            const voteInfos = [];
            const voteInfo = await this.wccService.getUserVoteInfo(gameIndexes[i], gameInfo);
            const gameVoteInfo = await this.wccService.getVoteInfo(gameIndexes[i]);
            voteInfo.weight = (Number(voteInfo.value) / (Number(gameVoteInfo.yesCount) + Number(gameVoteInfo.noCount)) * 100).toFixed(2);
            console.log(voteInfo);
            temp.push({
                gameInfo: gameInfo,
                voteInfo: voteInfo,
                gameIndex: gameIndexes[i]
            });
            this.loadingProgress = Number((this.voteInfos.length / gameIndexes.length).toFixed(2)) * 100;
        }
        this.voteInfos = temp;
        this.loadingProgress = 0;
    }
    async claimVote(info) {
        console.log(info.gameIndex);
        this.loadingSer.show();
        const check = await this.wccService.claimByVoterCheck(info.gameIndex);
        if (check.checkResult != 0) {
            this.loadingSer.hide();
            return this.alertSer.show(check.message);
        }
        this.wccService.claimByVoter(info.gameIndex, async (confirmNum, receipt) => {
            if (confirmNum == 1) {
                info.voteInfo.paid = true;
                this.loadingSer.hide();
                this.alertSer.show('Success!');
            }
        }, async (err) => {
            this.loadingSer.hide();
            this.alertSer.show('Transaction error or user denied');
        });
    }
    async getBetInfos() {
        if (this.betInfos && this.betInfos.length > 0) {
            return;
        }
        console.log('get bet infos');
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
        this.loadingSer.show();
        const gameIndex = this.wccService.getGameIndex(gameInfo.p1, gameInfo.p2, gameInfo.gameType);
        const scoreIndex = this.wccService.getScoreIndex(bet.score);

        const check = await this.wccService.claimCheck(gameIndex, scoreIndex);
        console.log(check);
        if (check.checkResult != 0) {
            this.loadingSer.hide();
            return this.alertSer.show(check.message);
        }

        this.wccService.claim(gameIndex, scoreIndex, async (transactionHash) => {
            await this.localActionSer.addAction({
                transactionHash: transactionHash, netType: this.envState.netType,
                model: { gameInfo: gameInfo, bet: bet }, createdAt: new Date(), type: 'claim'
            }, this.envState.account);
        }, async (confirmNum, receipt) => {
            if (confirmNum == 1) {
                this.loadingSer.hide();
                bet.paid = true;
                this.alertSer.show('claim success!');
            }
        }, async (err) => {
            console.log(err);
            this.loadingSer.hide();
            this.alertSer.show('User denied transaction signature');
        });
    }
    async withdraw() {
        this.loading.show();
        const check = await this.wccService.withdrawCheck();
        console.log(check);
        if (check.checkResult != 0) {
            this.loadingSer.hide();
            return this.alertSer.show(check.message);
        }
        this.wccService.withdraw(async (confirmNum, receipt) => {
            if (confirmNum == 1) {
                this.getBalanceAndWithdraw();
                this.loadingSer.hide();
                this.alertSer.show('Success!');
            }
        }, async (err) => {
            this.loadingSer.hide();
            this.alertSer.show('Transaction error or user denied');
        });
    }
    async refresh(type) {
        if (type === 1) {
            this.betInfos = [];
            this.getBetInfos();
        } else if (type === 2) {
            this.voteInfos = [];
            this.getVoteInfos();
        } else if (type === 3) {
            this.getBalanceAndWithdraw();
        }
    }
}
