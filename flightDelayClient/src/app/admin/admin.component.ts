import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';
import { LoadingService } from '../service/loading.service';
import { AsyncLocalStorage } from 'angular-async-local-storage';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
    balance: any;
    account: string;
    isAdmin: boolean;
    constructor(
        private route: ActivatedRoute,
        private web3Service: Web3Service,
        private flightDelayService: FlightDelayService,
        public loadingSer: LoadingService,
        protected localStorage: AsyncLocalStorage
    ) { }

    ngOnInit() {
        this.balance = JSON.stringify(this.route.snapshot.data.balance);
        this.route.params.subscribe(params => {
            this.account = params.account;
        });
        this.web3Service.getContract('hbStorage', 'HbStorage').then(hbStorageSC => {
            return hbStorageSC.methods.admins(this.account).call();
        }).then(isAdmin => {
            this.isAdmin = isAdmin;
        });
    }

    async transfer() {
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
}
