import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service, WCCService, LoadingService, AlertService, LocalActionService } from '../../service/index';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

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
    withdrawFlag = false;
    @ViewChild('exTemplate') exTemplate: TemplateRef<any>;
    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public localActionSer: LocalActionService,
        private modalService: BsModalService,
        public alertSer: AlertService) {
        this.form = this.fb.group({
            ethValue: ['0', [Validators.required]],
            kotValue: ['0', [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            if (tempEnvState.checkEnv === true &&
                (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account)
            ) { }
            this.envState = tempEnvState;
        });
        this.web3.check();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }
    async showExModal() {
        if (this.envState.canLoadData) {
            this.withdrawFlag = false;
            await this.getBalance();
            this.openModal(this.exTemplate);
        }
    }
    async showWModal() {
        if (this.envState.canLoadData) {
            this.withdrawFlag = true;
            await this.getBalance();
            this.openModal(this.exTemplate);
        }
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
            if (this.withdrawFlag) {
                this.alertSer.confirm('确定授权合约可以转走token?');
                const valueInWei = web3.utils.toWei(String(model.kotValue));
                const confirmOb = this.alertSer.getComfirmObservable().subscribe(async () => {
                    this.alertSer.hide();
                    this.loadingSer.show('Approving the token address...');
                    confirmOb.unsubscribe();
                    const scName = 'wccExchanger';
                    this.web3.tokenApprove(valueInWei, scName, async (confNumber, receipt) => {
                        if (confNumber == 1) {
                            const check = await this.wccSer.redeemCheck(valueInWei);
                            if (check.checkResult != 0) {
                                this.loadingSer.hide();
                                return this.alertSer.show(check.message);
                            }
                            this.loadingSer.show();
                            this.wccSer.redeem(valueInWei, (c, r) => {
                                if (c === 1) {
                                    this.resetForm();
                                    this.alertSer.show('Success!');
                                    this.getBalance();
                                }
                            }, (err) => {
                                this.loadingSer.hide();
                                this.alertSer.show('User denied transaction signature');
                            });
                        }
                    }, (err) => {
                        this.loadingSer.hide();
                        this.alertSer.show('User denied transaction signature');
                    });
                });
            } else {
                const valueInWei = web3.utils.toWei(String(model.ethValue));
                const check = await this.wccSer.exchangeCheck(valueInWei);
                if (check.checkResult != 0) {
                    this.loadingSer.hide();
                    return this.alertSer.show(check.message);
                }
                if (model.ethValue) {
                    this.loadingSer.show();
                    const confirmApprove = async (confirmationNumber, receipt) => {
                        if (confirmationNumber === 1) {
                            this.resetForm();
                            this.alertSer.show('Success!');
                            this.getBalance();
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
    }

    async withdraw() {
        const web3 = this.web3.instance();
        const balance = await this.wccSer.exchangerWithdrawBalance();
        const b = web3.utils.fromWei(balance);
        if (Number(b) > 0) {
            this.alertSer.confirm(`确定提现${b}个ETH?`);
            const confirmOb = this.alertSer.getComfirmObservable().subscribe(
                async () => {
                    confirmOb.unsubscribe();
                    this.alertSer.hide();
                    this.loadingSer.show();
                    this.wccSer.exchangerWithdraw((confirmationNumber, receipt) => {
                        if (confirmationNumber === 1) {
                            this.alertSer.show('Success!');
                            this.loadingSer.hide();
                        }
                    }, (err) => {
                        this.loadingSer.hide();
                        this.alertSer.show('User denied transaction signature');
                    });
                }
            );
        } else {
            this.alertSer.show('You have no withdraw balance');
        }

    }
    async getBalance() {
        this.loadingSer.show('Loading balance...');
        const result = await this.wccSer.getExchangerInfo();
        this.rate = result.rate;
        this.exchanged = result.exchanged;
        this.totalSupply = Number(result.tokenBalance) + Number(result.exchanged);
        this.scTokenBalance = result.tokenBalance;
        this.balance = await this.web3.getBalance();
        this.loadingSer.hide();
    }

}
