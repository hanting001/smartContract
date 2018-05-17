import { LocalActionService } from '../service';
import { AlertService } from '../service/alert.service';
import { LoadingService } from '../service/loading.service';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';

@Component({
    selector: 'app-exchange',
    templateUrl: './exchange.component.html',
    styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
    balance: any = {};
    rate: any;
    tokenCount: any;
    ethCount: any;
    exType: String = '1';
    account: any;
    value: any;
    envState: any = {};

    constructor(
        private web3Service: Web3Service,
        private flightDelayService: FlightDelayService,
        private route: ActivatedRoute,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        protected localActionSer: LocalActionService) { }

    ngOnInit() {
        this.web3Service.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;

                } else {
                    this.envState.changed = false;
                }

                if (tempEnvState.canLoadData) {
                    this.getBalance();
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3Service.check();
    }
    async countToken($event) {
        if (!this.rate) {
            this.rate = await this.flightDelayService.getRate();
        }
        const value = Number($event.target.value);
        if (value) {
            this.tokenCount = value * this.rate;
        }
    }
    async countEth($event) {
        if (!this.rate) {
            this.rate = await this.flightDelayService.getRate();
        }
        const value = Number($event.target.value);
        if (value) {
            this.ethCount = value / this.rate;
        }
    }
    async exchange(inputValue) {

        const value = Number(inputValue);
        if (value) {
            this.loadingSer.show();
            const web3 = this.web3Service.instance();
            const confirmApprove = async (confirmationNumber, receipt) => {
                if (confirmationNumber === 2) {
                    this.getBalance();
                    this.loadingSer.hide();
                }
            };
            const valueInWei = web3.utils.toWei(String(value));
            this.flightDelayService.exchange(valueInWei, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    eth: value, tokenCount: this.tokenCount, createdAt: new Date(), type: 'exchange'
                }, this.account);
            }, confirmApprove);
        }
    }


    async redeem(inputValue) {

        const value = Number(inputValue);
        if (value) {
            this.loadingSer.show();
            const web3 = this.web3Service.instance();
            const valueInWei = web3.utils.toWei(String(value));
            const redeemCheck = await this.flightDelayService.redeemCheck(valueInWei);
            console.log(redeemCheck);
            if (redeemCheck.checkResult != 0) {
                this.loadingSer.hide();
                return this.alertSer.show(redeemCheck.message);
            }

            const confirmApprove = async (confirmationNumber, receipt) => {
                if (confirmationNumber === 2) {
                    this.getBalance();
                    this.loadingSer.hide();
                }
            };
            // const valueInWei = web3.utils.toWei(String(value));
            this.flightDelayService.redeem(valueInWei, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    eth: value, tokenCount: this.tokenCount, createdAt: new Date(), type: 'redeem'
                }, this.account);
            }, confirmApprove);
        }
    }


    async checkEnv() {
        this.envState = await this.web3Service.check();
        if (this.envState.checkEnv === true) {
            this.getBalance();
        }
    }


    async exTypeChange(value) {
        console.log(value);
        if (value) {
            this.exType = value;
        }
    }

    async getBalance() {
        this.balance = await this.flightDelayService.getBalance();
    }
}
