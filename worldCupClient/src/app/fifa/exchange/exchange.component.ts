import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service, FlightDelayService, WCCService, LoadingService, AlertService, LocalActionService } from '../../service/index';
import { Router } from '@angular/router';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
    balance: any = {};
    form: FormGroup;
    rate: any;
    tokenCount: any;
    account: any;
    envState: any = {};

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public flightDelayService: FlightDelayService,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public localActionSer: LocalActionService,
        public alertSer: AlertService) {
        this.form = this.fb.group({
            ethValue: ['', [Validators.required]]
        });
    }

    ngOnInit() {
        this.web3.getCheckEnvSubject().subscribe(async (tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
                this.wccSer.getRate().then(rate => {
                    this.rate = rate;
                });
                await this.getBalance();
            }
            this.envState = tempEnvState;
        });
    }


    async exchange() {
        if (this.form.valid) {
            const model: any = this.form.value;
            console.log(model);

            if (model.ethValue) {
                this.loadingSer.show();
                const web3 = this.web3.instance();
                const confirmApprove = async (confirmationNumber, receipt) => {
                    if (confirmationNumber === 2) {
                        this.getBalance();
                        this.loadingSer.hide();
                    }
                };
                const valueInWei = web3.utils.toWei(String(model.ethValue));
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
        this.balance = await this.flightDelayService.getBalance();
    }

}
