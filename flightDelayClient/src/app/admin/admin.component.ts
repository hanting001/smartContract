import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService, WCCService } from '../service/index';
import { LoadingService } from '../service/loading.service';
import { AsyncLocalStorage } from 'angular-async-local-storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../service/alert.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    balance: any = {};
    account: string;
    envState: any = {};
    form: FormGroup;
    isAdmin: boolean;
    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private web3Service: Web3Service,
        private flightDelayService: FlightDelayService,
        public loadingSer: LoadingService,
        protected localStorage: AsyncLocalStorage,
        public alertSer: AlertService
    ) {
        this.form = this.fb.group({
            flightNO: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{4}$/)]],
            flightDate: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        // this.balance = await this.flightDelayService.getBalance();
        // this.route.params.subscribe(params => {
        //     this.account = params.account;
        // });
        // this.web3Service.getContract('hbStorage', 'HbStorage').then(hbStorageSC => {
        //     return hbStorageSC.methods.admins(this.account).call();
        // }).then(isAdmin => {
        //     this.isAdmin = isAdmin;
        // });
        // this.wcc.getAllInfo().then(info => console.log(info));

        this.web3Service.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            console.log(this.envState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;

                } else {
                    this.envState.changed = false;
                }

                if (tempEnvState.canLoadData) {
                    this.getAllData();
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3Service.check();
    }

    async getAllData() {
        console.log('--------------测试');
        console.log(this.envState.account);

        this.route.params.subscribe(async (params) => {
            this.account = params.account;
            this.balance = await this.flightDelayService.getBalanceByAccount(this.account);
        });
        this.web3Service.getContract('hbStorage', 'HbStorage').then(hbStorageSC => {
            return hbStorageSC.methods.admins(this.account).call();
        }).then(isAdmin => {
            this.isAdmin = isAdmin;
        });
    }

    async transfer() {
        console.log('====12312312312');
        const web3 = this.web3Service.instance();
        const accounts = await web3.eth.getAccounts();
        // 第一个账户用于部署合约
        const from = accounts[0];
        console.log(from);
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        this.loadingSer.show();
        tokenSC.methods.transfer(this.account, web3.utils.toWei('10000')).send({ from: from })
            .on('confirmation', async (confNumber, receipt) => {
                const raw = await this.flightDelayService.getBalanceByAccount(this.account);
                this.balance = JSON.stringify(raw);
                this.loadingSer.hide();
            });

    }

    async setAdmin() {
        const web3 = this.web3Service.instance();
        const accounts = await web3.eth.getAccounts();
        // 第一个账户用于部署合约
        const from = accounts[0];
        console.log('setAdmin');
        const hbStorageSC = await this.web3Service.getContract('hbStorage', 'HbStorage');
        console.log(this.account);
        this.loadingSer.show();
        hbStorageSC.methods.setAdmin(this.account).send({ from: from })
            .on('confirmation', async (confNumber, receipt) => {
                this.isAdmin = await hbStorageSC.methods.admins(this.account).call();
                this.loadingSer.hide();
            });
    }

    async clearLocalOrders() {
        this.localStorage.removeItem('my_order').subscribe(() => {
            console.log('清楚本地订单');
        });
    }

    async endVote() {
        console.log(this.form.valid);
        if (this.form.valid) {
            const model = this.form.value;
            console.log(model);
            const hbStorageSC = await this.web3Service.getContract('hbStorage', 'HbStorage');
            console.log(this.account);
            this.loadingSer.show();
            const key = await this.flightDelayService.getIndex(model.flightNO, model.flightDate);
            console.log(key);

            // hbStorageSC.methods.setVoteEndInterval(1).send({ from: await this.web3Service.getMainAccount() })
            //     .on('confirmation', async (confNumber, receipt) => {
            //         // this.isAdmin = await hbStorageSC.methods.admins(this.account).call();
            //         if (confNumber == 2) {
            //             this.loadingSer.hide();
            //         }

            //     });

            hbStorageSC.methods.endVoteByAdmin(key).send({ from: await this.web3Service.getMainAccount() })
                .on('confirmation', async (confNumber, receipt) => {
                    // this.isAdmin = await hbStorageSC.methods.admins(this.account).call();
                    if (confNumber == 2) {
                        console.log(await this.flightDelayService.getSfInfoByIndex(key));
                        this.loadingSer.hide();
                    }

                });
        }

    }
}
