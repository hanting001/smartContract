import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Web3Service, WCCService, LoadingService, AlertService, LocalActionService } from '../../service/index';
import { ChartComponent } from '../chart/chart.component';
@Component({
    selector: 'app-champion',
    templateUrl: './champion.component.html',
    styleUrls: ['./champion.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ChampionComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    subscription;
    chartLabels: string[] = ['Column1', 'Column2', 'Column3'];
    chartData;
    buyForm: FormGroup;
    voteForm: FormGroup;
    champion: FormControl = new FormControl('', Validators.required);
    betCanWin = '';
    USDPrice = 0;
    price;
    balance = {};
    contries: any = {};
    showFlag = -1;
    chartsComponent: ChartComponent;
    chartsFlag: Boolean = false;
    loadingProgress = 0;
    @ViewChild('buyTemplate') buyTemplate: TemplateRef<any>;
    dataSetLable = {
        valueData: 'ETH Value',
        oddsData: 'Odds',
        betsData: 'Bet Count'
    };
    chartTitle: any = {};
    finalPredictionIndex;
    willWinChampionPlayers;
    limit;
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private web3: Web3Service,
        private wccSer: WCCService,
        private loadingSer: LoadingService,
        private alertSer: AlertService,
        private localActionSer: LocalActionService,
        private localStorage: LocalStorage,
        private router: Router,
    ) {
        this.voteForm = this.fb.group({
            voteOption: ['1', [Validators.required]]
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.finalPredictionIndex = params.index;
            this.limit = params.limit;
            this.buyForm = this.fb.group({
                eth: ['0.01', [Validators.required, Validators.min(this.limit)]]
            });
            this.buyForm.addControl('champion', this.champion);
            this.web3.check();
        });
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getData();
                    }
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
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

    getChartsData(betInfos) {
        this.chartData.betInfos = betInfos;
        this.calculat();
    }
    async getPlayerWillWinChampion() {
        const players = new Set();
        const games = await this.localStorage.getItem<any[]>('games').toPromise();
        this.contries = await this.localStorage.getItem<any>('contries').toPromise();
        if (games) {
            for (let i = 0; i < games.length; i++) {
                const courts = games[i].courts;
                for (let j = 0; j < courts.length; j++) {
                    const game = courts[j];
                    // if (game.status == 0) { // add after group phase
                    if (game.gameType == 0) {
                        let name = game.s_p1 || game.p1;
                        if (name.length > 2) {
                            players.add(name);
                        }
                        name = game.s_p2 || game.p2;
                        if (name.length > 2) {
                            players.add(name);
                        }
                    }
                }
            }
        } else {
            this.loadingSer.show('loading game info...');
            const indexes = await this.wccSer.getAllGameIndexes();
            for (let i = 0; i < indexes.length; i++) {
                const gameInfo = await this.wccSer.getGameInfo(indexes[i]);
                if (gameInfo.p1 == 'champion' && gameInfo.p2 == 'champion') {
                    continue;
                } else {
                    if (gameInfo.gameType == 0) {
                        let name = gameInfo.s_p1 || gameInfo.p1;
                        if (name.length > 2) {
                            players.add(name);
                        }
                        name = gameInfo.s_p2 || gameInfo.p2;
                        if (name.length > 2) {
                            players.add(name);
                        }
                        players.add(name);
                    }
                }
                this.loadingProgress = Number((i / indexes.length).toFixed(2)) * 100;
            }
            this.loadingProgress = 0;
            this.loadingSer.hide();
        }
        return Array.from(players);
    }
    async getData() {
        const index = this.finalPredictionIndex;
        if (!index) {
            return;
        }
        console.log(index);
        this.loadingSer.show('Loading...');
        const web3 = this.web3.instance();
        const currentGameInfo = await this.wccSer.getGameInfo(index);
        // console.log(currenGameInfo);
        if (currentGameInfo.time == 0) {
            return;
        }
        this.willWinChampionPlayers = await this.getPlayerWillWinChampion();
        console.log(this.willWinChampionPlayers);
        if (currentGameInfo.status == '0' || currentGameInfo.status == '1') {
            this.chartData = {};
            this.web3.currenPrice().then(obj => {
                // console.log(obj.result);
                this.price = obj.result.ethusd;
                // console.log(this.price);
                const model: any = this.buyForm.value;
                if (model.eth) {
                    console.log('this.getUSDValue');
                    this.getUSDValue({ target: { value: model.eth } });
                }
            });
            this.web3.getBalance().then(balance => {
                console.log(balance);
                this.balance = balance;
            });

            // this.buyForm.controls('eth').setValidators([Validators.required, Validators.min(limit)]);
            const totalValue = web3.utils.fromWei(currentGameInfo.totalValue);
            const totalBets = currentGameInfo.totalBets;
            this.chartTitle = {
                totalValue: Number(totalValue).toFixed(6),
                totalBets: totalBets,
                avg: totalBets > 0 ? (totalValue / totalBets).toFixed(6) : 0
            };
            this.chartData.currentGameInfo = currentGameInfo;
            this.chartData.currentGameIndex = index;
            this.chartData.limit = this.limit;
            this.showFlag = 0;
        } else if (currentGameInfo.status == '2' || currentGameInfo.status == '3') {
            this.chartData = {};
            const voteInfo = await this.wccSer.getVoteInfo(index);
            console.log(voteInfo);
            this.chartData.target = voteInfo.target;
            console.log(this.chartData.target);
            this.chartTitle = {
                totalCount: Number(web3.utils.fromWei(voteInfo.yesCount)) + Number(web3.utils.fromWei(voteInfo.noCount)),
                yesCount: web3.utils.fromWei(voteInfo.yesCount),
                noCount: web3.utils.fromWei(voteInfo.noCount)
            };
            this.chartData.currentGameInfo = currentGameInfo;
            this.chartData.currentGameIndex = index;
            this.chartData.data = [Number(web3.utils.fromWei(voteInfo.yesCount)), Number(web3.utils.fromWei(voteInfo.noCount))];
            this.chartData.labels = ['yesCount', 'noCount'];
            this.showFlag = 1;
        }

        this.loadingSer.hide();
    }
    calculat() {
        if (this.buyForm.valid && this.chartData.betInfos) {
            const web3 = this.web3.instance();
            console.log(this.chartData);
            const model: any = this.buyForm.value;
            const score = model.champion;
            const totalValue = Number(web3.utils.fromWei(this.chartData.currentGameInfo.totalValue));
            const betValue = Number(model.eth);
            let flag = false;
            for (let i = 0; i < this.chartData.betInfos.length; i++) {
                const bet = this.chartData.betInfos[i];
                const betTotalValue = Number(web3.utils.fromWei(bet.totalValue));
                if (bet.score == score) {
                    this.betCanWin = `${((betValue / (betTotalValue + betValue)) * (totalValue + betValue)).toFixed(6)}`;
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                this.betCanWin = `${(totalValue + betValue).toFixed(6)}`;
            }
        }
    }
    setChartsComponent(component: ChartComponent) {
        this.chartsComponent = component;
        console.log(this.chartsComponent);
    }
    async refreshCharts(type) {
        this.chartsComponent.generateChart(type);
        this.chartsFlag = !this.chartsFlag;
    }
    async vote() {
        const model: any = this.voteForm.value;
        console.log(model);
        if (this.voteForm.valid) {
            this.loadingSer.show('Sending Transaction');
            const index = this.finalPredictionIndex;

            const check = await this.wccSer.voteCheck(index);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }

            this.wccSer.vote(index, (model.voteOption == 1 ? true : false), (transactionHash) => {
                this.loadingSer.show('Transaction submitted, waiting confirm...');
                this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    model: model, createdAt: new Date(), type: 'vote'
                }, this.envState.account);
            }, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    this.loadingSer.hide();
                    this.alertSer.show(' Vote success!');
                    this.back();
                }
            }, async (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied Transaction was not mined within 750 seconds');
            });


        }
    }
    async bet() {
        if (this.buyForm.valid) {
            this.loadingSer.show('Sending Transaction');
            const model: any = this.buyForm.value;
            const index = this.finalPredictionIndex;
            const score = model.champion;
            const web3 = this.web3.instance();
            const valueInWei = web3.utils.toWei(String(model.eth));

            const check = await this.wccSer.joinCheck(index, valueInWei);
            console.log(check);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }

            await this.wccSer.join(index, score, valueInWei, (transactionHash) => {
                this.loadingSer.show('Transaction submitted, waiting confirm...');
                this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    model: model, createdAt: new Date(), type: 'join'
                }, this.envState.account);
            }, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    this.back();
                }
            }, (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied or Transaction was not mined within 750 seconds');
            });
        }
    }
    back() {
        this.router.navigate(['matches'], { skipLocationChange: true });
    }
    getUSDValue(event) {
        // if (this.buyForm.valid) {
        if (this.price > 0) {
            this.USDPrice = event.target.value * this.price;
        } else {
            this.USDPrice = 0;
        }
        this.calculat();
        // }
    }
    get eth() { return this.buyForm.get('eth'); }
    get voteOption() { return this.voteForm.get('voteOption'); }
}
