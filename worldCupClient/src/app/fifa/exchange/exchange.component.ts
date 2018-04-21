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
        const web3 = this.web3.instance();
        let ethValue = this.form.controls.ethValue.value;
        const BN = web3.utils.BN;
        if (ethValue) {
            ethValue = String(ethValue);
            console.log(ethValue);
            this.form.controls.kotValue.setValue(web3.utils.fromWei(new BN(web3.utils.toWei(ethValue)).mul(new BN(this.rate))));
        }
    }

    kotChange() {
        const web3 = this.web3.instance();
        let tokenValue = this.form.controls.kotValue.value;
        const BN = web3.utils.BN;
        if (tokenValue) {
            tokenValue = String(tokenValue);
            this.form.controls.ethValue.setValue(web3.utils.fromWei(new BN(web3.utils.toWei(tokenValue)).div(new BN(this.rate))));
        }
    }

    resetForm() {
        this.form.controls.kotValue.setValue(0);
        this.form.controls.ethValue.setValue(0);
    }

    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
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
                const confirmApprove = (confirmationNumber, receipt) => {
                    if (confirmationNumber === 2) {
                        this.getBalance();
                        this.resetForm();
                        this.loadingSer.hide();
                        this.alertSer.show('Success!');
                    }
                };
                this.wccSer.exchange(valueInWei, (transactionHash) => {
                    this.localActionSer.addAction({
                        transactionHash: transactionHash, netType: this.envState.netType,
                        eth: model.ethValue, tokenCount: this.tokenCount, createdAt: new Date(), type: 'exchange'
                    }, this.account);
                }, confirmApprove, (err) => {
                    this.loadingSer.hide();
                    this.alertSer.show('User denied transaction signature');
                });
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
