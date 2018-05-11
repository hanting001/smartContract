import { AlertService } from '../service/alert.service';
import { LocalOrderService } from '../service/local-order.service';
import { LoadingService } from '../service/loading.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { DelayRates } from '../shared/configData';
import { LocalActionService } from '../service/local-action.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    account: string;
    sfInfo: string;

    winHeight: any;
    form: FormGroup;
    minDate: Date;
    confirmModalRef: BsModalRef;
    exchangeModalRef: BsModalRef;
    confirmMessage: string;
    envState: any = {};
    price;
    myOrders: any;
    myActions: any;
    voteInfo: any;
    balance: any = {};
    delayRates = DelayRates;
    // 无延误或延误不到半小时' },
    //     { key: 1, value: '延误半小时以上' },
    //     { key: 2, value: '延误1小时以上' },
    //     { key: 3, value: '延误2小时以上' },
    //     { key: 4, value: '航班取消' }
    chartLabels: string[] = ['无延误或延误不到半小时', '延误半小时以上', '延误1小时以上', '延误2小时以上', '航班取消'];
    chartData: number[] = [0, 0, 0, 0, 0];

    @ViewChild('exchangeTemplate') exchangeTemplate: TemplateRef<any>;
    @ViewChild('confirmTemplate') confirmTemplate: TemplateRef<any>;
    constructor(private fb: FormBuilder, private web3: Web3Service,
        private flightDelayService: FlightDelayService, private localService: BsLocaleService,
        private modalService: BsModalService,
        private router: Router, public loadingSer: LoadingService,
        protected localOrderSer: LocalOrderService, protected localActionSer: LocalActionService,
        public alertSer: AlertService) {


        this.form = this.fb.group({
            flightNO: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{4}$/)]],
            flightDate: ['', [Validators.required]],
            delayStatus: ['0', [Validators.required]]
        });



        $(() => {
            $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
                if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')) {
                    let target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                    if (target.length) {
                        $('html, body').animate({
                            scrollTop: (target.offset().top - 54)
                        }, 1000, 'easeInOutExpo');
                        return false;
                    }
                }
            });

            // Closes responsive menu when a scroll trigger link is clicked
            $('.js-scroll-trigger').click(function () {
                $('.navbar-collapse').collapse('hide');
            });

            // Activate scrollspy to add active class to navbar items on scroll
            $('body').scrollspy({
                target: '#mainNav',
                offset: 56
            });
            // Collapse Navbar
            const navbarCollapse = function () {
                if ($('#mainNav').length > 0 && $('#mainNav').offset().top > 100) {
                    $('#mainNav').addClass('navbar-shrink');
                } else {
                    $('#mainNav').removeClass('navbar-shrink');
                }
            };
            // Collapse now if page is not at top
            navbarCollapse();
            // Collapse the navbar when page is scrolled
            $(window).scroll(navbarCollapse);

            // Hide navbar when modals trigger
            $('.portfolio-modal').on('show.bs.modal', function (e) {
                $('.navbar').addClass('d-none');
            });
            $('.portfolio-modal').on('hidden.bs.modal', function (e) {
                $('.navbar').removeClass('d-none');
            });
        });
    }

    ngOnInit() {
        this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getAllData();
                    }
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3.check();
        // 测试是否已加入航延计划

        this.localService.use('zh-cn');
        this.minDate = new Date();
        this.minDate.setDate(this.minDate.getDate() + 2);
    }
    async sendTx() {
        const confirmApprove = async (confirmationNumber, receipt) => {
            if (confirmationNumber === 2) {
                const result = await this.flightDelayService.getSFInfo('SF5050', '2018-03-09');
                this.sfInfo = JSON.stringify(result);
            }
        };
        this.flightDelayService.setMaxCount(Math.random() * 100, confirmApprove);
    }
    async confirm() {
        if (this.form.valid) {
            const model = this.form.value;
            const currentVote = await this.flightDelayService.getCurrentVote();
            const balance = await this.flightDelayService.getBalance();
            this.price = await this.flightDelayService.getPrice(model.flightNO);
            // console.log(currentVote);
            // console.log(balance);
            // console.log(this.price);
            if (balance.token && balance.token * 1 < this.price * 1) {
                this.confirmMessage = `token余额不足${this.price}，是否前往兑换？`;
                this.exchangeModalRef = this.openModal(this.exchangeTemplate);

            } else {
                this.confirmModalRef = this.openModal(this.confirmTemplate);
            }
            // this.router.navigate(['/']);
        }
    }
    async join() {
        this.loadingSer.show();

        const model = this.form.value;
        const account = await this.web3.getMainAccount();
        const votedSfIndex = this.voteInfo ? this.voteInfo.currentVote : '';
        console.log(model);
        const price = await this.flightDelayService.getPrice(model.flightNO);
        model.price = price;
        const joinCheck = await this.flightDelayService.canJoin(model.flightNO, model.flightDate);
        console.log(joinCheck);
        if (joinCheck.checkResult != 0) {
            this.loadingSer.hide();
            return this.alertSer.show(joinCheck.message);
        }
        // 授权合约可以扣代币
        const web3 = this.web3.instance();
        const priceInWei = web3.utils.toWei(String(price * 1.1));
        this.flightDelayService.approve(priceInWei, async (transactionHash) => {
            await this.localActionSer.addAction({
                transactionHash: transactionHash, netType: this.envState.netType, createdAt: new Date(), type: 'approve', sfInfo: model
            }, account);
        }, async (confirmNumber, receipt) => {
            if (confirmNumber === 2) {
                this.flightDelayService.join(model, votedSfIndex, async (transactionHash) => {
                    await this.localActionSer.addAction({
                        transactionHash: transactionHash, netType: this.envState.netType, createdAt: new Date(), type: 'join', sfInfo: model
                    }, account);
                }, async (confirmNum, rec) => {
                    if (confirmNum === 2) {

                        model.createdAt = new Date();
                        // const result = await this.localOrderSer.addOrder(model, await this.web3.getMainAccount());
                        // console.log(result);
                        // this.myOrders = await this.localOrderSer.getMyOrders(await this.web3.getMainAccount());
                        // console.log(this.myOrders);
                        this.loadingSer.hide();
                        this.confirmModalRef.hide();
                        this.getAllData();
                        const testOK = await this.flightDelayService.testOK();
                        console.log(testOK);
                        this.alertSer.show('加入成功');
                    }
                }, (err) => {
                    this.loadingSer.hide();
                });
            }
        });

    }
    async startClaim(flightNO, flightDate) {
        const claimCheck = await this.flightDelayService.canStartVote(flightNO, flightDate);
        const account = await this.web3.getMainAccount();
        console.log(claimCheck);
        if (claimCheck.checkResult != 0) {
            return this.alertSer.show(claimCheck.message);
        }
        // 这里默认使用延误1小时(DelayStatus.delay2)，以后需要弹出model窗让用户选择延误类型
        const target = 2;
        this.loadingSer.show();
        this.flightDelayService.startClaimVote(flightNO, flightDate, target, async (transactionHash) => {
            await this.localActionSer.addAction({
                transactionHash: transactionHash, netType: this.envState.netType, createdAt: new Date(),
                type: 'applyClaim', flightNO: flightNO, flightDate: flightDate
            }, account);
        }, async (confirmNumber, receipt) => {
            if (confirmNumber === 2) {
                const testOK = await this.flightDelayService.testServiceOK();
                console.log(testOK);
                this.voteInfo = await this.flightDelayService.getCurrentVote();
                this.getMyOrders();
                console.log(this.voteInfo);
                this.loadingSer.hide();
                this.alertSer.show('申请成功,航班开启理赔投票');
            }
        });
    }
    async getAllData() {
        console.log('get all data');
        this.getMyOrders();
        this.getMyActions();
        this.getCurrentVoteInfo();
        this.getBalance();
    }

    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }
    decline() {
        this.exchangeModalRef.hide();
    }
    goExchange() {
        this.router.navigate(['/exchange']);
        if (this.exchangeModalRef) {
            this.exchangeModalRef.hide();
        }

    }

    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
    }

    goClaim(sfIndex) {
        window.open('/claim/' + sfIndex, '_blank');
    }

    async getMyOrders() {
        // this.myOrders = await this.localOrderSer.getMyOrders(await this.web3.getMainAccount());
        // if (this.myOrders) {
        //     for (const order in this.myOrders) {

        //     }
        // }

        this.flightDelayService.getSfInfo().then(flights => {
            console.log(flights);
            this.myOrders = flights;
        });
    }

    async getMyActions() {
        this.myActions = await this.localActionSer.getMyActions(await this.web3.getMainAccount());
        console.log(this.myActions);
    }

    async getCurrentVoteInfo() {
        this.voteInfo = await this.flightDelayService.getCurrentVote();
        if (this.voteInfo) {

            const totalCount = this.voteInfo.voteInfo.noCounts * 1 + this.voteInfo.voteInfo.cancelCounts * 1
                + this.voteInfo.voteInfo.delay1Counts * 1 + this.voteInfo.voteInfo.delay2Counts * 1
                + this.voteInfo.voteInfo.delay3Counts * 1;

            // this.voteInfo.voteInfo.noPercent = (this.voteInfo.voteInfo.noCounts * 100 / totalCount).toFixed(0) + '%';
            // this.voteInfo.voteInfo.cancelPercent = (this.voteInfo.voteInfo.cancelCounts * 100 / totalCount).toFixed(0) + '%';
            // this.voteInfo.voteInfo.delay1Percent = (this.voteInfo.voteInfo.delay1Counts * 100 / totalCount).toFixed(0) + '%';
            // this.voteInfo.voteInfo.delay2Percent = (this.voteInfo.voteInfo.delay2Counts * 100 / totalCount).toFixed(0) + '%';
            // this.voteInfo.voteInfo.delay3Percent = (this.voteInfo.voteInfo.delay3Counts * 100 / totalCount).toFixed(0) + '%';

            this.chartData[0] = this.voteInfo.voteInfo.noCounts;
            this.chartData[1] = this.voteInfo.voteInfo.cancelCounts;
            this.chartData[2] = this.voteInfo.voteInfo.delay1Counts;
            this.chartData[3] = this.voteInfo.voteInfo.delay2Counts;
            this.chartData[4] = this.voteInfo.voteInfo.delay3Counts;


            console.log(this.voteInfo);
        }
    }

    async getBalance() {
        this.balance = await this.flightDelayService.getBalance();
    }


    getIsSupportBrowser() {
        const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
        const isOpera = userAgent.indexOf('Opera') > -1; // 判断是否Opera浏览器
        const isIE = userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera; // 判断是否IE浏览器
        const isEdge = userAgent.indexOf('Windows NT 6.1; Trident/7.0;') > -1 && !isIE; // 判断是否IE的Edge浏览器
        const isFF = userAgent.indexOf('Firefox') > -1; // 判断是否Firefox浏览器
        const isSafari = userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1; // 判断是否Safari浏览器
        const isChrome = userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1; // 判断Chrome浏览器

        return isFF || isChrome;
    }



    get flightNO() { return this.form.get('flightNO'); }
    get flightDate() { return this.form.get('flightDate'); }
}
