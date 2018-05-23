import { LocalActionService } from '../../service/local-action.service';
import { ActivatedRoute } from '@angular/router';
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
    title: string;
    stitle: string;
    games: any = [];
    contries: any = {};
    secondStageStartDate;
    court: any = {};
    isSticky: Boolean = true;
    subscription;
    buyModalRef: BsModalRef;
    buyForm: FormGroup;
    stageObj: any = {};
    voteModalRef: BsModalRef;
    voteForm: FormGroup;
    loading = false;
    loadingProgress: Number = 0;
    price;
    balance = {};
    USDPrice = 0;
    myVote = 1;
    firstStageFlag = 0;
    gameCount = 0;
    countDown;
    timer;
    matchGroup = 1;
    splitDate = moment('2018-06-14').valueOf();
    showGames;
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
    betCanWin = '';
    initGame;
    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        private modalService: BsModalService,
        public localActionSer: LocalActionService,
        private localStorage: LocalStorage,
        private route: ActivatedRoute) {
        this.voteForm = this.fb.group({
            voteOption: ['1', [Validators.required]]
        });
        this.countDown = this.getCountDown();
    }
    setShow(type, index) {
        if (this.firstStageFlag == 0) {
            this.firstStageFlag = type + 1;
        }
        console.log(this.firstStageFlag);
        if (type == 0) {
            this.stageObj.groupPhase = index;
            this.stageObj.groupPhaseFlag = true;
        } else if (type == 1) {
            this.stageObj.roundOf16 = index;
            this.stageObj.roundOf16Flag = true;
        } else if (type == 2) {
            this.stageObj.quarterFinal = index;
            this.stageObj.quarterFinalFlag = true;
        } else if (type == 3) {
            this.stageObj.semiFinal = index;
            this.stageObj.semiFinalFlag = true;
        } else if (type == 4) {
            this.stageObj.playOffForThirdPlace = index;
            this.stageObj.playOffForThirdPlaceFlag = true;
        } else if (type == 5) {
            this.stageObj.final = index;
            this.stageObj.finalFlag = true;
        }
    }
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.initGame = params.initGame;
        });
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getAllGames();
                        if (this.initGame) {
                            this.show(null, this.initGame);
                        }
                    }
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3.check();
        this.timer = setInterval(this.getCountDown, 3600);
    }
    getCountDown() {
        const startDay = moment('2018-06-14').dayOfYear();
        const now = moment().dayOfYear();
        return (startDay - now).toFixed(0);
    }
    async getAllGames() {
        const isGameUpdated = await this.wccSer.isGameUpdated();
        const games = await this.localStorage.getItem<any[]>('games').toPromise();
        const contries = await this.localStorage.getItem<any>('contries').toPromise();
        if (!isGameUpdated && games && games.length > 0 && contries) {
            this.games = games;
            this.contries = contries;
            if (this.contries['secondStageStartDate']) {
                this.secondStageStartDate = this.contries['secondStageStartDate'];
            }
            if (this.contries['firstStageFlag']) {
                this.firstStageFlag = this.contries['firstStageFlag'];
            }
            if (this.contries['stageObj']) {
                this.stageObj = this.contries['stageObj'];
            }
            // console.log(this.stageObj);
            console.log('from local storage');
        } else {
            this.gameCount = 0;
            const sortNumber = function (a, b) {
                return a.time - b.time;
            };
            this.loadingSer.show('loading game info...');
            const indexes = await this.wccSer.getAllGameIndexes();
            const temps = [];
            this.loadingSer.hide();
            this.loading = true;
            for (let i = 0; i < indexes.length; i++) {
                const gameInfo = await this.wccSer.getGameInfo(indexes[i]);
                temps.push(gameInfo);
                this.setGameData(temps, sortNumber, indexes.length);
                this.gameCount++;
            }
            this.loadingProgress = 0;
            this.loading = false;
            this.localStorage.setItem('games', this.games).toPromise();
            this.contries['secondStageStartDate'] = this.secondStageStartDate;
            this.contries['stageObj'] = this.stageObj;
            this.contries['firstStageFlag'] = this.firstStageFlag;
            this.localStorage.setItem('contries', this.contries).toPromise();
        }
        this.filtGames();
        this.refreshGameData();
    }
    filtGames() {
        console.log(this.games);
        this.showGames = this.games.filter(item => {
            const time = moment(item.date).valueOf();
            if (this.matchGroup == 0) {
                this.title = '2018 Champions League';
                this.stitle = `The world cup kicks off in ${this.countDown} days!`;
                if (time < this.splitDate) {
                    return true;
                } else {
                    return false;
                }
            } else if (this.matchGroup == 1) {
                this.title = '2018 World Cup';
                this.stitle = `2018 Champions League`;
                if (time >= this.splitDate) {
                    return true;
                } else {
                    return false;
                }
            }
        });
        this.setShowStageObj();
    }
    setShowStageObj() {
        this.stageObj = {};
        for (let i = 0; i < this.showGames.length; i ++) {
            const gameInfos = this.showGames[i].courts;
            for (let j = 0; j < gameInfos.length; j ++) {
                if (!this.stageObj.groupPhase && gameInfos[j].gameType == '0') {
                    this.setShow(0, i);
                } else if (!this.stageObj.roundOf16Flag && gameInfos[j].gameType == '1') {
                    this.setShow(1, i);
                } else if (!this.stageObj.quarterFinalFlag && gameInfos[j].gameType == '2') {
                    this.setShow(2, i);
                } else if (!this.stageObj.semiFinalFlag && gameInfos[j].gameType == '3') {
                    this.setShow(3, i);
                } else if (!this.stageObj.playOffForThirdPlaceFlag && gameInfos[j].gameType == '4') {
                    this.setShow(4, i);
                } else if (!this.stageObj.finalFlag && gameInfos[j].gameType == '5') {
                    this.setShow(5, i);
                }
            }
        }
        console.log(this.stageObj);
    }
    transformGames() {
        if (this.matchGroup == 0) {
            this.matchGroup = 1;
        } else if (this.matchGroup == 1) {
            this.matchGroup = 0;
        }
        this.filtGames();
    }
    async refreshGameData() {
        const web3 = this.web3.instance();
        for (let i = 0; i < this.games.length; i++) {
            const obj = this.games[i];
            for (let j = 0; j < obj.courts.length; j++) {
                const index = this.wccSer.getGameIndex(obj.courts[j].p1, obj.courts[j].p2, obj.courts[j].gameType);
                const info = await this.wccSer.getGameFreshDetail(index);
                obj.courts[j] = info.gameInfo;
                if (info.voteInfo) {
                    // console.log(info.voteInfo);
                    obj.courts[j].totalVotes = Number(web3.utils.fromWei(info.voteInfo.yesCount))
                        + Number(web3.utils.fromWei(info.voteInfo.noCount));
                    obj.courts[j].score = info.voteInfo.target;
                }
            }
        }
        this.localStorage.setItem('games', this.games).toPromise();
    }
    async refreshOneGameData(gameIndex) {
        const web3 = this.web3.instance();
        for (let i = 0; i < this.games.length; i++) {
            const obj = this.games[i];
            for (let j = 0; j < obj.courts.length; j++) {
                const index = this.wccSer.getGameIndex(obj.courts[j].p1, obj.courts[j].p2, obj.courts[j].gameType);
                if (gameIndex == index) {
                    const info = await this.wccSer.getGameFreshDetail(index);
                    obj.courts[j] = info.gameInfo;
                    if (info.voteInfo) {
                        // console.log(info.voteInfo);
                        obj.courts[j].totalVotes = Number(web3.utils.fromWei(info.voteInfo.yesCount))
                            + Number(web3.utils.fromWei(info.voteInfo.noCount));
                        obj.courts[j].score = info.voteInfo.target;
                    }
                }
            }
        }
        this.localStorage.setItem('games', this.games).toPromise();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        clearInterval(this.timer);
    }

    // @HostListener('window:scroll', [])
    // onWindowScroll() {
    //     // console.log('window scroll');
    //     const number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    //     // console.log(number);
    //     if (number > 25) {
    //         this.isSticky = true;
    //     } else if (this.isSticky && number < 10) {
    //         this.isSticky = false;
    //     }
    // }


    async show(court, index?) {
        this.court = court;
        // console.log(court);
        // return;
        if (!index) {
            this.loadingSer.show('Loading...');
            index = this.wccSer.getGameIndex(court.p1, court.p2, court.gameType);
        }
        this.refreshOneGameData(index);
        const web3 = this.web3.instance();
        // const valueInWei = web3.utils.toWei(String(model.ethValue));
        const currentGameInfo = await this.wccSer.getGameInfo(index);
        // console.log(currenGameInfo);
        if (currentGameInfo.time == 0) {
            return;
        }
        if (!court) {
            this.court = currentGameInfo;
        }
        if (currentGameInfo.status == '0' || currentGameInfo.status == '1') {
            this.chartData = {};
            const limit = await this.wccSer.getBetLimit();
            this.buyForm = this.fb.group({
                homeScore: ['0', [Validators.required]],
                awayScore: ['0', [Validators.required]],
                eth: ['0.01', [Validators.required, Validators.min(limit)]]
            });
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
            this.chartData.limit = limit;
            this.buyModalRef = this.openModal(this.buyTemplate);

        } else if (currentGameInfo.status == '2' || currentGameInfo.status == '3') {
            this.chartData = {};
            const voteInfo = await this.wccSer.getVoteInfo(index);
            console.log(voteInfo);
            this.chartData.target = voteInfo.target.split(':');
            console.log(this.chartData.target);
            const totalValue = web3.utils.fromWei(currentGameInfo.totalValue);
            const totalBets = currentGameInfo.totalBets;
            this.chartTitle = {
                totalCount: Number(web3.utils.fromWei(voteInfo.yesCount)) + Number(web3.utils.fromWei(voteInfo.noCount)),
                yesCount: web3.utils.fromWei(voteInfo.yesCount),
                noCount: web3.utils.fromWei(voteInfo.noCount)
            };
            this.chartData.currentGameInfo = currentGameInfo;
            this.chartData.currentGameIndex = index;
            this.chartData.data = [Number(web3.utils.fromWei(voteInfo.yesCount)), Number(web3.utils.fromWei(voteInfo.noCount))];
            this.chartData.labels = ['yesCount', 'noCount'];
            this.voteModalRef = this.openModal(this.voteTemplate);
        }

        this.loadingSer.hide();
    }
    getChartsData(betInfos) {
        this.chartData.betInfos = betInfos;
        this.calculat();
    }
    getUSDValue(event) {
        if (this.buyForm.valid) {
            if (this.price > 0) {
                this.USDPrice = event.target.value * this.price;
            } else {
                this.USDPrice = 0;
            }
            this.calculat();
        }
    }
    hideCourt() {
        if (this.buyModalRef) {
            this.buyModalRef.hide();
        }
    }
    calculat() {
        if (this.buyForm.valid && this.chartData.betInfos) {
            const web3 = this.web3.instance();
            console.log(this.chartData);
            const model: any = this.buyForm.value;
            const score = model.homeScore + ':' + model.awayScore;
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

            await this.wccSer.join(index, score, valueInWei, (transactionHash) => {
                this.loadingSer.show('Transaction submitted, waiting confirm...');
                this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    model: model, createdAt: new Date(), type: 'join'
                }, this.envState.account);
            }, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    if (this.buyModalRef) {
                        this.buyModalRef.hide();
                    }
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    this.buyForm.value.homeScore = 0;
                    this.buyForm.value.awayScore = 0;
                    this.buyForm.value.eth = '0.0';
                    this.USDPrice = 0;
                    this.refreshOneGameData(index);
                }
            }, (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied Transaction was not mined within 750 seconds');
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
                    if (this.voteModalRef) {
                        this.voteModalRef.hide();
                    }
                    this.loadingSer.hide();
                    this.alertSer.show(' Vote success!');
                    this.voteForm.reset();
                    this.voteForm.controls['voteOption'].setValue(1);
                    this.refreshOneGameData(index);
                }
            }, async (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show('User denied Transaction was not mined within 750 seconds');
            });


        }
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
    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
    }
    setGameData(games, sortNumber, totalCount) {
        let gameInfos = games;
        gameInfos = gameInfos.sort(sortNumber);
        games = [];
        const gameLen = gameInfos.length;
        let j = 0;
        for (let i = 0; i < gameLen; i++) {
            const game: any = {};
            game.local = false;
            const date = moment(gameInfos[i].time * 1000);
            game.date = date.format('YYYY-MM-DD');
            game.day = date.format('DD');
            game.dayOfWeek = date.isoWeekday();
            if (gameInfos[i].gameType == '0') {
                this.contries[gameInfos[i].p1] = 1;
                this.contries[gameInfos[i].p2] = 1;
            }
            if (!this.secondStageStartDate && gameInfos[i].gameType != '0') {
                this.secondStageStartDate = game.date;
            }
            // if (!this.stageObj.groupPhase && gameInfos[i].gameType == '0') {
            //     this.setShow(0, j);
            // } else if (!this.stageObj.roundOf16Flag && gameInfos[i].gameType == '1') {
            //     this.setShow(1, j);
            // } else if (!this.stageObj.quarterFinalFlag && gameInfos[i].gameType == '2') {
            //     this.setShow(2, j);
            // } else if (!this.stageObj.semiFinalFlag && gameInfos[i].gameType == '3') {
            //     this.setShow(3, j);
            // } else if (!this.stageObj.playOffForThirdPlaceFlag && gameInfos[i].gameType == '4') {
            //     this.setShow(4, j);
            // } else if (!this.stageObj.finalFlag && gameInfos[i].gameType == '5') {
            //     this.setShow(5, j);
            // }
            if (games.length > 0 && games[games.length - 1].date == game.date) {
                games[games.length - 1].count++;
                games[games.length - 1].courts.push(gameInfos[i]);
            } else {
                game.count = 1;
                game.courts = [gameInfos[i]];
                games.push(game);
                j++;
            }

            this.loadingProgress = Number((this.gameCount / totalCount).toFixed(2)) * 100;
            // console.log(this.loadingProgress);
        }
        this.games = games;
    }
    // async gotoCourt(gameInfo) {
    //     // get new game info
    //     console.log(gameInfo);
    //     const index = this.wccSer.getGameIndex(gameInfo.p1, gameInfo.p2, gameInfo.gameType);
    //     console.log(index);
    //     const currenGameInfo = await this.wccSer.getGameInfo(index);
    //     const betInfos = await this.wccSer.getGameBetInfos(index);

    //     const sortScore = function (a, b) {
    //         const scoreA = a.score.replace(/>10/g, '11');
    //         const scoreB = b.score.replace(/>10/g, '11');
    //         const tmpAryA = scoreA.split(':');
    //         const tmpAryB = scoreB.split(':');
    //         console.log(tmpAryA);
    //         console.log(tmpAryB);
    //         if (tmpAryA[0] > tmpAryA[1] && tmpAryB[0] <= tmpAryB[1]) {
    //             return -1;
    //         }

    //             return tmpAryA[0] - tmpAryB[0];

    //     };
    //     console.log(betInfos.betInfos[betInfos.betInfos.length - 1].score.replace(/>10/g, '11'));
    //     betInfos.betInfos = betInfos.betInfos.sort(sortScore);

    //     console.log(betInfos);
    //     return console.log(currenGameInfo);
    //     // this.router.navigate(['fifa/court']);
    // }

    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }
    get voteOption() { return this.voteForm.get('voteOption'); }
    get eth() { return this.buyForm.get('eth'); }
}
