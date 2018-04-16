import { LocalActionService } from '../../service/local-action.service';
import { Component, OnInit, HostListener, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { Web3Service } from '../../service/index';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';
import { WCCService } from '../../service/wcc.service';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Chart } from 'chart.js';
import * as moment from 'moment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class FifaHomeComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    gameInfos: any = [];
    games: any = [];
    court: any = {};
    isSticky: Boolean = true;
    subscription;
    buyModalRef: BsModalRef;
    buyForm: FormGroup;

    voteModalRef: BsModalRef;
    voteForm: FormGroup;
    loading = false;
    loadingProgress: Number = 0;
    price;
    balance = {};
    USDPrice;
    myVote = 1;
    @ViewChild('buyTemplate') buyTemplate: TemplateRef<any>;
    @ViewChild('voteTemplate') voteTemplate: TemplateRef<any>;

    chartLabels: string[] = ['Column1', 'Column2', 'Column3'];
    chartData;
    dataSetLable = {
        valueData: 'ETH Value',
        oddsData: 'Odds',
        betsData: 'Bet Count'
    };
    chartTitle: any = {};

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        private modalService: BsModalService,
        public localActionSer: LocalActionService,
        private localStorage: LocalStorage) {
        this.buyForm = this.fb.group({
            homeScore: ['0', [Validators.required]],
            awayScore: ['0', [Validators.required]],
            eth: ['0.0', [Validators.required]]
        });

        this.voteForm = this.fb.group({
            voteOption: ['1', [Validators.required]]
        });
    }

    ngOnInit() {
        this.web3.check();
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
                this.getAllGames();
            }
            this.envState = tempEnvState;
        });


    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        // console.log('window scroll');
        const number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        // console.log(number);
        if (number > 25) {
            this.isSticky = true;
        } else if (this.isSticky && number < 10) {
            this.isSticky = true;
        }
    }


    async show(court) {
        this.court = court;
        console.log(court);
        // this.loadingSer.show('正在加载');
        // return;
        const index = this.wccSer.getGameIndex(court.p1, court.p2, court.gameType);
        console.log(index);
        const web3 = this.web3.instance();
        // const valueInWei = web3.utils.toWei(String(model.ethValue));
        this.web3.currenPrice().then(obj => {
            // console.log(obj.result);
            this.price = obj.result.ethusd;
            // console.log(this.price);
            const model: any = this.buyForm.value;
            if (model.eth) {
                this.getUSDValue({ target: { value: model.eth } });
            }
        });
        this.web3.getBalance().then(balance => {
            console.log(balance);
            this.balance = balance;
        });


        const currenGameInfo = await this.wccSer.getGameInfo(index);
        // console.log(currenGameInfo);
        const totalValue = web3.utils.fromWei(currenGameInfo.totalValue);
        const totalBets = currenGameInfo.totalBets;
        this.chartTitle = {
            totalValue: Number(totalValue).toFixed(6),
            totalBets: totalBets,
            avg: totalBets > 0 ? (totalValue / totalBets).toFixed(6) : 0
        };
        this.chartData = {
            currentGameInfo: currenGameInfo,
            currentGameIndex: index
        };
        if (currenGameInfo.status == '0' || currenGameInfo.status == '1') {
            this.buyModalRef = this.openModal(this.buyTemplate);
        } else if (currenGameInfo.status == '2') {
            this.voteModalRef = this.openModal(this.voteTemplate);
        }

        this.loadingSer.hide();
    }
    getUSDValue(event) {
        // console.log(event.target.value);
        // this.price = 417;
        // console.log(this.price);
        if (this.price > 0) {
            this.USDPrice = event.target.value * this.price;
        } else {
            this.USDPrice = 0;
        }
    }
    hideCourt() {
        if (this.buyModalRef) {
            this.buyModalRef.hide();
        }
    }

    async bet() {
        if (this.buyForm.valid) {
            this.loadingSer.show('Sending Transaction');
            const model: any = this.buyForm.value;
            const index = this.wccSer.getGameIndex(this.court.p1, this.court.p2, this.court.gameType);
            const score = model.homeScore + ':' + model.awayScore;
            const web3 = this.web3.instance();
            const valueInWei = web3.utils.toWei(String(model.eth));

            const check = await this.wccSer.joinCheck(index, valueInWei);
            console.log(check);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }

            this.wccSer.join(index, score, valueInWei, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    model: model, createdAt: new Date(), type: 'join'
                }, this.envState.account);
            }, async (confirmNum, receipt) => {
                if (confirmNum == 1) {
                    if (this.buyModalRef) {
                        this.buyModalRef.hide();
                    }
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    this.buyForm.value.homeScore = 0;
                    this.buyForm.value.awayScore = 0;
                    this.buyForm.value.eth = '0.0';
                    this.USDPrice = 0;
                }
            }, async (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied transaction signature');
            });


        }
    }

    voteOptionChange(value) {
        console.log(value);
        this.voteForm.controls['voteOption'].setValue(value);
    }


    async vote() {
        const model: any = this.voteForm.value;
        console.log(model);
        if (this.voteForm.valid) {
            this.loadingSer.show('Sending Transaction');
            const index = this.wccSer.getGameIndex(this.court.p1, this.court.p2, this.court.gameType);

            const check = await this.wccSer.voteCheck(index);
            console.log(check);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }

            this.wccSer.vote(index, model.voteOption, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    model: model, createdAt: new Date(), type: 'vote'
                }, this.envState.account);
            }, async (confirmNum, receipt) => {
                if (confirmNum == 1) {
                    if (this.buyModalRef) {
                        this.buyModalRef.hide();
                    }
                    this.loadingSer.hide();
                    this.alertSer.show(' Vote success!');
                    this.voteForm.reset();
                    this.myVote = 1;
                }
            }, async (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied transaction signature');
            });


        }
    }

    async checkEnv() {
        const tempEnvState: any = await this.web3.check();
        console.log(tempEnvState);
        if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {

            await this.getAllGames();
        }
        this.envState = tempEnvState;

    }

    mouseEnter(event) {
        // $("table tr td:nth-child(3)")
        $(event.target).children('table').addClass('bg-secondary');
    }

    mouseLeave(event) {
        $(event.target).children('table').removeClass('bg-secondary');
        // $(event.target).parents('table').find('tr').find('td').eq(idx).css('backgroundColor', '#ffffff');
    }
    counter(i: number) {
        return new Array(i);
    }
    async getAllGames() {
        const isGameUpdated = await this.wccSer.isGameUpdated();
        const games = await this.localStorage.getItem<any[]>('games').toPromise();
        if (!isGameUpdated && games && games.length > 0) {
            this.games = games;
            console.log(this.games);
            console.log('from local storage');
        } else {
            const sortNumber = function (a, b) {
                return a.time - b.time;
            };
            this.loadingSer.show();
            const indexes = await this.wccSer.getAllGameIndexes();
            const temps = [];
            this.loadingSer.hide();
            this.loading = true;
            for (let i = 0; i < indexes.length; i++) {
                const gameInfo = await this.wccSer.getGameInfo(indexes[i]);
                temps.push(gameInfo);
                this.setGameData(temps, sortNumber);
                this.loadingProgress = Number((temps.length / indexes.length).toFixed(2)) * 100;
            }
            this.loading = false;
            this.localStorage.setItem('games', this.games).toPromise();
        }
    }
    setGameData(games, sortNumber) {
        let gameInfos = games;
        gameInfos = gameInfos.sort(sortNumber);
        console.log(gameInfos);
        games = [];
        const gameLen = gameInfos.length;
        for (let i = 0; i < gameLen; i++) {
            const game: any = {};
            console.log(gameInfos[i].time);
            console.log(new Date(gameInfos[i].time * 1));
            game.local = false;
            const date = moment(gameInfos[i].time * 1000);
            game.date = date.format('YYYY-MM-DD');
            game.day = date.format('DD');
            game.dayOfWeek = date.isoWeekday();
            if (games.length > 0 && games[games.length - 1].date == game.date) {
                games[games.length - 1].count++;
                games[games.length - 1].courts.push(gameInfos[i]);
            } else {
                game.count = 1;
                game.courts = [gameInfos[i]];
                games.push(game);
            }
        }
        this.games = games;
    }
    async gotoCourt(gameInfo) {
        // get new game info
        console.log(gameInfo);
        const index = this.wccSer.getGameIndex(gameInfo.p1, gameInfo.p2, gameInfo.gameType);
        console.log(index);
        const currenGameInfo = await this.wccSer.getGameInfo(index);
        const betInfos = await this.wccSer.getGameBetInfos(index);

        const sortScore = function (a, b) {
            const scoreA = a.score.replace(/>10/g, '11');
            const scoreB = b.score.replace(/>10/g, '11');
            const tmpAryA = scoreA.split(':');
            const tmpAryB = scoreA.split(':');

            if (tmpAryA[0] == tmpAryB[0]) {
                return tmpAryA[1] - tmpAryB[1];
            } else {
                return tmpAryA[0] - tmpAryB[0];
            }
        };
        console.log(betInfos.betInfos[betInfos.betInfos.length - 1].score.replace(/>10/g, '11'));
        betInfos.betInfos = betInfos.betInfos.sort(sortScore);

        console.log(betInfos);
        return console.log(currenGameInfo);
        // this.router.navigate(['fifa/court']);
    }

    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }

}
