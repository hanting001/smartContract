import { WCCService } from '../../service/wcc.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../service/index';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class FifaAdminComponent implements OnInit {
    form: FormGroup;
    exchForm: FormGroup;
    adminForm: FormGroup;
    envState: any = {};
    mytime: Date = new Date();
    gameInfos: any = [];

    addingGame: any = [];
    addingText: String = '';

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        public loadingSer: LoadingService,
        private http: HttpClient,
        public alertSer: AlertService) {
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


        this.checkEnv();
    }

    ngOnInit() {

    }

    async checkEnv() {
        this.envState = await this.web3.check();
        if (this.envState.checkEnv === true) {
            this.gameInfos = await this.wccSer.getAllPlayers();
            console.log(this.gameInfos);
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
                    this.alertSer.show('添加成功');
                }
            });
        }
    }

    async addAllPlayers() {
        const myHeaders = new Headers();
        myHeaders.set('Content-Type', 'text/html');
        this.loadingSer.show();
        this.http.get('assets/games.txt?' + new Date().getTime(), { responseType: 'text' }).toPromise().then((data) => {
            console.log(data);

            const gamesArray = data.split('\n');
            console.log(gamesArray);
            const gamesLen = gamesArray.length;
            let i = 0;
            const addingTimeout = setInterval(() => {
                console.log('添加第' + i + '场比赛');
                const tmpAry = gamesArray[i].split(',');

                // if (i == 3) {
                //     clearInterval(addingTimeout);
                //     return;
                // }

                if (tmpAry && tmpAry.length == 3) {
                    this.addingText = '正在添加比赛:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' + tmpAry[1];
                    this.addingGame = tmpAry;
                    this.wccSer.addPlayer({
                        awayCourt: tmpAry[0],
                        startTime: new Date(tmpAry[1].trim() + ':00'),
                        homeCourt: tmpAry[2],
                        gameType: '0'
                    }, async (transactionHash) => { }, async (confirmNum, recipt) => {
                        if (confirmNum == 2) {
                            this.gameInfos = await this.wccSer.getAllPlayers();
                            this.addingText = '完成添加比赛:p1=' + tmpAry[0] + ',p2=' + tmpAry[2] + ',time=' + tmpAry[1];
                        }
                    });

                } else {
                    this.addingText = '完成添加所有比赛';
                    clearTimeout(addingTimeout);
                    this.loadingSer.hide();

                }
                i++;
            }, 5000);
        });

    }

    async exch() {
        if (this.exchForm.valid) {
            this.loadingSer.show();
            const model: any = this.exchForm.value;
            console.log(model);
            const web3 = this.web3.instance();
            const from = await this.web3.getFirstAccount();
            // 第一个账户用于部署合约
            console.log(from);
            const tokenSC = await this.web3.getContract('knotToken', 'KnotToken');

            tokenSC.methods.transfer(model.address, web3.utils.toWei(model.tokenCount + '')).send({ from: from })
                .on('confirmation', async (confNumber, receipt) => {
                    if (confNumber == 2) {
                        const token = await tokenSC.methods.balanceOf(model.address).call();
                        this.alertSer.show('处理成功，合约拥有KOT：' + web3.utils.fromWei(token));
                        this.loadingSer.hide();
                    }

                });

        }
    }

    delGame(index) {
        // const model = game;

        // console.log(model);
        this.loadingSer.show();
        this.wccSer.delPlayer(index, async (transactionHash) => { }, async (confirmNum, recipt) => {
            if (confirmNum == 2) {
                this.loadingSer.hide();
                this.gameInfos = await this.wccSer.getAllPlayers();
                this.alertSer.show('删除成功');
            }
        });
    }

    async setAdmin() {
        if (this.adminForm.valid) {
            const model = this.adminForm.value;
            const web3 = this.web3.instance();
            const from = await this.web3.getFirstAccount();
            // 第一个账户用于部署合约
            console.log('setAdmin');
            const sc = await this.web3.getContract('wccStorage', 'WccStorage');
            this.loadingSer.show();
            sc.methods.setAdmin(model.address).send({ from: from })
                .on('confirmation', async (confNumber, receipt) => {
                    if (confNumber == 2) {
                        const isAdmin = await sc.methods.admins(model.address).call();
                        if (isAdmin) {
                            this.alertSer.show(model.address + '已设置为admin');
                        }
                        this.loadingSer.hide();
                    }

                });
        }

    }


}
