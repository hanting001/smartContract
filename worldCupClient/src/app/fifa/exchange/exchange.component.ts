import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service, WCCService, LoadingService, AlertService, LocalActionService } from '../../service/index';
import { Router } from '@angular/router';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    balance: any = {};
    form: FormGroup;
    rate: any;
    exchanged: any;
    tokenCount: any;
    account: any;
    totalSupply: any;
    scTokenBalance: any;
    subscription;
    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public localActionSer: LocalActionService,
        public alertSer: AlertService) {
        this.form = this.fb.group({
            ethValue: ['0', [Validators.required]],
            kotValue: ['0', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
        this.web3.check();
        this.subscription = this.web3.getCheckEnvSubject().subscribe(async (tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true &&
                (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account)
            ) {
                await this.getBalance();
            }
            this.envState = tempEnvState;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    ethChange() {
        const value = this.web3.instance().utils.toWei(String(this.form.controls.ethValue.value)) * this.rate;
        this.form.controls.kotValue.setValue(this.web3.instance().utils.fromWei(String(value)));
    }

    kotChange() {
        const value = this.web3.instance().utils.toWei(String(this.form.controls.kotValue.value)) / this.rate;
        this.form.controls.ethValue.setValue(this.web3.instance().utils.fromWei(String(value)));
    }


    async exchange() {
        if (this.form.valid) {
            const model: any = this.form.value;
            console.log(model);
            const web3 = this.web3.instance();
            const valueInWei = web3.utils.toWei(String(model.ethValue));
            const check = await this.wccSer.exchangeCheck(valueInWei);
            console.log(check);
            if (check.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(check.message);
            }
            if (model.ethValue) {
                this.loadingSer.show();
                const confirmApprove = async (confirmationNumber, receipt) => {
                    if (confirmationNumber === 2) {
                        this.getBalance();
                        this.form.reset();
                        this.loadingSer.hide();
                    }
                };
                this.wccSer.exchange(valueInWei, async (transactionHash) => {
                    await this.localActionSer.addAction({
                        transactionHash: transactionHash, netType: this.envState.netType,
                        eth: model.ethValue, tokenCount: this.tokenCount, createdAt: new Date(), type: 'exchange'
                    }, this.account);
                }, confirmApprove);
            }
        }
    }


    async getBalance() {
        this.loadingSer.show();
        const result = await this.wccSer.getExchangerInfo();
        this.rate = result.rate;
        this.exchanged = result.exchanged;
        this.totalSupply = Number(result.tokenBalance) + Number(result.exchanged);
        this.scTokenBalance = result.tokenBalance;
        this.balance = await this.web3.getBalance();
        this.loadingSer.hide();
    }

}
