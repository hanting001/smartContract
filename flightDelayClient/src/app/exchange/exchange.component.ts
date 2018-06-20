import { PayService } from '../service/pay.service';
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
    exType: String = '0';
    account: any;
    value: any;
    envState: any = {};

    constructor(
        private web3Service: Web3Service,
        private flightDelayService: FlightDelayService,
        private route: ActivatedRoute,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        public paySer: PayService,
        protected localActionSer: LocalActionService) { }

    async ngOnInit() {
        this.web3Service.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv
                    || (tempEnvState.checkAccount && tempEnvState.account != this.envState.account)
                ) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getBalance();
                    }
                } else {
                    this.envState.changed = false;
                }


                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3Service.check();

        this.zfb();
    }

    async zfb() {
        const order: any = await this.paySer.createOrder(10);
        console.log(order);
        const oid = order.data.oid;

        const orderInfo: any = await this.paySer.getOrderInfo(oid);

        console.log(orderInfo);

        const result: any = await this.paySer.zfbPay(orderInfo.data.order[0].oid, orderInfo.data.order[0].accountName);

        console.log(result);

        // window.location.href = result.data.url;
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
            this.loadingSer.show('您发起了兑换Token操作，请确认...');
            const web3 = this.web3Service.instance();
            const confirmApprove = async (confirmationNumber, receipt) => {
                if (confirmationNumber === 2) {
                    this.getBalance();
                    this.loadingSer.hide();
                    this.alertSer.show('兑换成功');
                }
            };
            const valueInWei = web3.utils.toWei(String(value));
            this.flightDelayService.exchange(valueInWei, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType,
                    eth: value, tokenCount: this.tokenCount, createdAt: new Date(), type: 'exchange'
                }, this.account);
            }, confirmApprove, (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show(this.web3Service.getErrMsg());
            });
        }
    }


    async redeem(inputValue) {

        const value = Number(inputValue);
        if (value) {
            this.loadingSer.show('请先授权合约扣除代币，请确认...');
            const web3 = this.web3Service.instance();
            const valueInWei = web3.utils.toWei(String(value));

            const confirmApprove = async (confirmationNumber, receipt) => {
                if (confirmationNumber === 2) {
                    this.getBalance();
                    this.loadingSer.hide();
                    this.alertSer.show('赎回成功');
                }
            };

            this.flightDelayService.approveRedeem(valueInWei, async (transactionHash) => {
                await this.localActionSer.addAction({
                    transactionHash: transactionHash, netType: this.envState.netType, eth: this.ethCount,
                    tokenCount: value, createdAt: new Date(), type: 'approveRedeem'
                }, this.envState.account);
            }, async (confirmNumber, receipt) => {
                if (confirmNumber === 2) {
                    this.loadingSer.show('合约将扣除代币并返回ETH，请确认...');
                    const redeemCheck = await this.flightDelayService.redeemCheck(valueInWei);
                    console.log(redeemCheck);
                    if (redeemCheck.checkResult != 0) {
                        this.loadingSer.hide();
                        return this.alertSer.show(redeemCheck.message);
                    }
                    this.flightDelayService.redeem(valueInWei, async (transactionHash) => {
                        await this.localActionSer.addAction({
                            transactionHash: transactionHash, netType: this.envState.netType,
                            eth: this.ethCount, tokenCount: value, createdAt: new Date(), type: 'redeem'
                        }, this.envState.account);
                    }, confirmApprove, (err) => {
                        console.log(err);
                        this.loadingSer.hide();
                        this.alertSer.show(this.web3Service.getErrMsg());
                    });
                }
            }, (err) => {
                console.log(err);
                this.loadingSer.hide();
                this.alertSer.show(this.web3Service.getErrMsg());
            });

            // const valueInWei = web3.utils.toWei(String(value));

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
