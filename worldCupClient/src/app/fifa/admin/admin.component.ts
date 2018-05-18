import { WCCService } from '../../service/wcc.service';
import { Component, OnInit, OnDestroy, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../service/index';
import { LocalStorage } from '@ngx-pwa/local-storage';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';
import { HttpClient } from '@angular/common/http';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class FifaAdminComponent implements OnInit, OnDestroy {
    form: FormGroup;
    exchForm: FormGroup;
    adminForm: FormGroup;
    envState: any = {};
    mytime: Date = new Date();
    gameInfos: any = [];
    subscription;
    addingGame: any = [];
    addingText: String = '';
    isOwner: Boolean = false;
    selectedGame;
    selectedVote;
    modalRef: BsModalRef;
    startVoteForm: FormGroup;
    setPlayerForm: FormGroup;
    scIndex = 1;
    gameMessage = 'no games';
    contries: any;
    filterPlays: any;
    @ViewChild('startVoteTemplate') startVoteTemplate: TemplateRef<any>;
    @ViewChild('setVoteCanEndTemplate') setVoteCanEndTemplate: TemplateRef<any>;
    @ViewChild('setPlayerTemplate') setPlayerTemplate: TemplateRef<any>;
    @ViewChild('forceEndTemplate') forceEndTemplate: TemplateRef<any>;
    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        public loadingSer: LoadingService,
        private http: HttpClient,
        private modalService: BsModalService,
        public alertSer: AlertService,
        private localStorage: LocalStorage) {
        this.form = this.fb.group({
            awayCourt: ['', [Validators.required]],
            homeCourt: ['', [Validators.required]],
            startTime: [new Date('2018-06-14'), [Validators.required]],
            gameType: ['0', [Validators.required]]
        });

        this.exchForm = this.fb.group({
            address: ['', [Validators.required]],
            tokenCount: ['', [Validators.required]]
        });

        this.adminForm = this.fb.group({
            address: ['', [Validators.required]],
        });
        this.setPlayerForm = this.fb.group({
            p1: ['', [Validators.required]],
            p2: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account) {
                    this.envState.changed = true;
                    this.checkEnv();
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
            }
        });
        this.web3.check();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    async checkEnv() {
        this.isOwner = await this.wccSer.isOwner();
        if (this.isOwner) {
            this.gameMessage = 'loading games...';
            this.contries = await this.localStorage.getItem<any>('contries').toPromise();
            await this.getAllPlayers();
            this.setFilterPlays();
        }
    }
    async getAllPlayers() {
        const plays = await this.localStorage.getItem<any[]>('plays').toPromise();
        if (plays && plays.length > 0) {
            this.gameInfos = plays;
        } else {
            this.gameInfos = await this.wccSer.getAllPlayers();
            this.localStorage.setItem('plays', this.gameInfos).toPromise();
        }
    }
    addPlayer() {
        if (this.form.valid) {
            this.loadingSer.show();
            const model = this.form.value;
            console.log(model);
            // this.router.navigate(['/']);
            this.wccSer.addPlayer(model, async (transactionHash) => { }, async (confirmNum, recipt) => {
                if (confirmNum == 2) {
                    this.loadingSer.hide();
                    this.gameInfos = await this.wccSer.getAllPlayers();
                    this.form.reset();
                    this.form.controls['gameType'].setValue('0');
                    this.alertSer.show('success');
                }
            });
        }
    }
    async refreshCache() {
        this.loadingSer.show('refresh...');
        await this.wccSer.refreshCache();
        this.loadingSer.hide();
    }
    async addAllPlayers() {
        const myHeaders = new Headers();
        myHeaders.set('Content-Type', 'text/html');
        this.loadingSer.show();

        let timeout = 5000;

        this.http.get('assets/games.txt?' + new Date().getTime(), { responseType: 'text' }).toPromise().then((data) => {
            console.log(data);

            const gamesArray = data.split('\n');
            console.log(gamesArray);
            const gamesLen = gamesArray.length;
            let i = 0;

            const addGame = async () => {
                console.log('add ' + i + 'match');
                const tmpAry = gamesArray[i].split(',');

                // if (i == 3) {
                //     clearInterval(addingTimeout);
                //     return;
                // }

                if (tmpAry && tmpAry.length == 4) {
                    const gameIndex = this.wccSer.getGameIndex(tmpAry[0], tmpAry[2], tmpAry[3]);
                    const gameInfo = await this.wccSer.getGameInfo(gameIndex);
                    console.log(gameInfo);
                    if (!gameInfo.p1) {
                        console.log('game not exist:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' + tmpAry[1] + ',gameType=' + tmpAry[3]);
                        this.addingText = 'adding:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' + tmpAry[1] + ',gameType=' + tmpAry[3];
                        this.addingGame = tmpAry;
                        this.wccSer.addPlayer({
                            awayCourt: tmpAry[0],
                            startTime: new Date(tmpAry[1].trim() + ':00'),
                            homeCourt: tmpAry[2],
                            gameType: tmpAry[3]
                        }, async (transactionHash) => { }, async (confirmNum, recipt) => {
                            if (confirmNum == 2) {
                                this.gameInfos = await this.wccSer.getAllPlayers();
                                this.addingText = 'finish:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' +
                                    tmpAry[1] + ',gameType=' + tmpAry[3];
                            }
                        });
                        timeout = 5000;
                    } else {
                        console.log('already exist:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' + tmpAry[1] + ',gameType=' + tmpAry[3]);
                        timeout = 2000;
                    }
                    if (i < gamesLen - 1) {
                        setTimeout(addGame, timeout);
                    }

                } else {
                    this.addingText = 'finish add all game';
                    // clearInterval(addingTimeout);
                    this.loadingSer.hide();

                }
                i++;
            };

            setTimeout(addGame, timeout);
        });

    }

    async exch() {
        if (this.exchForm.valid) {
            this.loadingSer.show();
            const model: any = this.exchForm.value;
            console.log(model);
            const web3 = this.web3.instance();
            const from = await this.web3.getFirstAccount();
            console.log(from);
            const tokenSC = await this.web3.getContract('knotToken', 'KnotToken');

            tokenSC.methods.transfer(model.address, web3.utils.toWei(model.tokenCount + '')).send({ from: from })
                .on('confirmation', async (confNumber, receipt) => {
                    if (confNumber == 2) {
                        const token = await tokenSC.methods.balanceOf(model.address).call();
                        this.alertSer.show('success，contract have KOT：' + web3.utils.fromWei(token));
                        this.loadingSer.hide();
                    }

                });

        }
    }

    // delGame(index) {
    //     // const model = game;

    //     // console.log(model);
    //     this.loadingSer.show();
    //     this.wccSer.delPlayer(index, async (transactionHash) => { }, async (confirmNum, recipt) => {
    //         if (confirmNum == 2) {
    //             this.loadingSer.hide();
    //             this.gameInfos = await this.wccSer.getAllPlayers();
    //             this.alertSer.show('delete success');
    //         }
    //     });
    // }
    showIndex(game) {
        const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
        this.alertSer.show(gameIndex);
    }
    async setAdmin() {
        if (this.adminForm.valid) {
            const model = this.adminForm.value;
            const web3 = this.web3.instance();
            const from = await this.web3.getMainAccount();
            this.loadingSer.show('set storage`s admin');
            console.log('setAdmin');
            const sc = await this.web3.getContract('wccStorage', 'WccStorage');
            const vs = await this.web3.getContract('wccVoteStorage', 'WccVoteStorage');
            await sc.methods.setAdmin(model.address).send({ from: from });
            await vs.methods.setAdmin(model.address).send({ from: from });
            const isAdmin = await sc.methods.admins(model.address).call();
            if (isAdmin) {
                this.loadingSer.hide();
                this.alertSer.show(model.address + 'already set admin');
            }
        }

    }
    async startPlay(game) {
        const time = moment().format('YYYY-MM-DD HH:mm:ss');
        if (confirm(`Curren time is ${time}, sure?`)) {
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            this.loadingSer.show();
            this.wccSer.startPlayByJudge(gameIndex, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    game.status = '1';
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    this.localStorage.setItem('plays', this.gameInfos).toPromise();
                }
            }, async (err) => {
                this.loadingSer.hide();
                this.alertSer.show('Transaction error or user denied');
            });
        }
    }
    setFilterPlays() {
        const players = new Set();
        for (const gameInfo of this.gameInfos) {
            if (gameInfo.p1.length > 2) {
                players.add(gameInfo.p1);
                players.add(gameInfo.p2);
            }
        }
        this.filterPlays = Array.from(players).sort();
    }
    setPlayer(game) {
        if (this.setPlayerForm.valid) {
            const model = this.setPlayerForm.value;
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            if (confirm(`set this game  ${model.p1}:${model.p2} , submit?`)) {
                this.loadingSer.show();
                this.wccSer.setPlayer(gameIndex, model.p1, model.p2, async (confirmNum, receipt) => {
                    if (confirmNum == 0) {
                        game.s_p1 = model.p1;
                        game.s_p2 = model.p2;
                        this.loadingSer.hide();
                        this.alertSer.show('Success!');
                        this.localStorage.setItem('plays', this.gameInfos).toPromise();
                    }
                }, async (err) => {
                    this.loadingSer.hide();
                    this.alertSer.show('Transaction error or user denied');
                });
            }
        }
    }
    async startVote(game) {
        if (this.startVoteForm.valid) {
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            const score = this.startVoteForm.value.homeScore + ':' + this.startVoteForm.value.awayScore;
            if (confirm(`${game.p1}:${game.p2} Vote target is ${score}, submit?`)) {
                const check = await this.wccSer.startVoteCheck(gameIndex);
                this.loadingSer.show();
                if (check.checkResult != 0) {
                    this.loadingSer.hide();
                    return this.alertSer.show(check.message);
                }
                this.wccSer.startVote(gameIndex, score, async (confirmNum, receipt) => {
                    if (confirmNum == 0) {
                        game.status = '2';
                        this.loadingSer.hide();
                        this.alertSer.show('Success!');
                        this.localStorage.setItem('plays', this.gameInfos).toPromise();
                    }
                }, async (err) => {
                    this.loadingSer.hide();
                    this.alertSer.show('Transaction error or user denied');
                });
            }
        } else {
            alert('startVoteForm invalid');
        }
    }
    async showModal(game, type) {
        this.selectedGame = game;
        if (type == 1) {
            // show start vote modal
            this.startVoteForm = this.fb.group({
                homeScore: ['0', [Validators.required]],
                awayScore: ['0', [Validators.required]]
            });
            this.modalRef = this.openModal(this.startVoteTemplate);
        } else if (type == 2 || type == 4) {
            const web3 = this.web3.instance();
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            const canEnd = await this.wccSer.isVoteCanEnd(gameIndex);
            if (canEnd && type == 2) {
                return this.alertSer.show('Already can end');
            }
            const voteInfo = await this.wccSer.getVoteInfo(gameIndex);
            console.log(voteInfo.target.split(':'));
            const BN = web3.utils.BN;
            this.selectedVote = {
                yesCount: web3.utils.fromWei(voteInfo.yesCount),
                noCount: web3.utils.fromWei(voteInfo.noCount),
                totalCount: web3.utils.fromWei(new BN(voteInfo.yesCount).add(new BN(voteInfo.noCount))),
                target: voteInfo.target.split(':')
            };
            if (type == 2) {
                this.modalRef = this.openModal(this.setVoteCanEndTemplate);
            } else {
                this.modalRef = this.openModal(this.forceEndTemplate);
            }
        } else if (type == 3) {
            this.modalRef = this.openModal(this.setPlayerTemplate);
        }
    }
    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }
    async setVoteCanEnd(game) {
        if (confirm('set this vote can end?')) {
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            this.loadingSer.show();
            const check = await this.wccSer.setVoteCanEndCheck(gameIndex);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }
            this.wccSer.setVoteCanEnd(gameIndex, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    // this.localStorage.setItem('plays', this.gameInfos).toPromise();
                    this.refresh(game);
                }
            }, async (err) => {
                this.loadingSer.hide();
                this.alertSer.show('Transaction error or user denied');
            });
        }
    }
    async forceEnd(game) {
        if (confirm('Still voting, force end this game?')) {
            const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
            this.loadingSer.show();
            const check = await this.wccSer.endVoteByAdminCheck(gameIndex);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }
            this.wccSer.endVoteByAdmin(gameIndex, async (confirmNum, receipt) => {
                if (confirmNum == 0) {
                    this.loadingSer.hide();
                    this.alertSer.show('Success!');
                    // this.localStorage.setItem('plays', this.gameInfos).toPromise();
                    this.refresh(game);
                }
            }, async (err) => {
                this.loadingSer.hide();
                this.alertSer.show('Transaction error or user denied');
            });
        }
    }
    async refresh(game) {
        this.loadingSer.show('loading...');
        const gameIndex = this.wccSer.getGameIndex(game.p1, game.p2, game.gameType);
        const tempgame = await this.wccSer.getGameInfo(gameIndex);
        game.status = tempgame.status;
        this.localStorage.setItem('plays', this.gameInfos).toPromise();
        this.loadingSer.hide();
    }
}
