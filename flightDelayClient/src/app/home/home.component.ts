import { LocalOrderService } from '../service/local-order.service';
import { LoadingService } from '../service/loading.service';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


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
    envState: object = {};
    price;

    @ViewChild('exchangeTemplate') exchangeTemplate: TemplateRef<any>;
    @ViewChild('confirmTemplate') confirmTemplate: TemplateRef<any>;
    constructor(private fb: FormBuilder, private web3: Web3Service,
        private flightDelayService: FlightDelayService, private localService: BsLocaleService,
        private modalService: BsModalService,
        private router: Router, public loadingSer: LoadingService, protected localOrderSer: LocalOrderService) {

        this.web3.getCheckEnvSubject().subscribe((data) => {
            this.envState = data;
        });
        setInterval(() => {
            this.checkEnv();
        }, 600000);

        this.form = this.fb.group({
            flightNO: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{4}$/)]],
            flightDate: ['', [Validators.required]]
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
                if ($('#mainNav').offset().top > 100) {
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
        this.web3.getMainAccount().then(account => {
            this.account = account;
        });
        // 测试
        // this.flightDelayService.getCurrentVote();
        this.localService.use('zh-cn');
        this.minDate = new Date();
        this.minDate.setDate(this.minDate.getDate() + 1);
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
            console.log(currentVote);
            console.log(balance);
            console.log(this.price);
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
        console.log(model);
        const price = await this.flightDelayService.getPrice(model.flightNO);
        // 授权合约可以扣代币
        const web3 = this.web3.instance();
        const priceInWei = web3.utils.toWei(String(price * 1.1));
        await this.flightDelayService.approve(priceInWei);
        this.flightDelayService.join(model, async (confirmNumber, receipt) => {
            if (confirmNumber === 2) {

                const result = await this.localOrderSer.addOrder(model);
                console.log(result);
                console.log(await this.localOrderSer.getMyOrders());
                this.loadingSer.hide();
                this.confirmModalRef.hide();
                const testOK = await this.flightDelayService.testOK();
                console.log(testOK);
                alert('加入成功');
            }
        }, (err) => {
            this.loadingSer.hide();
        });
    }

    async checkEnv() {
        await this.web3.check();
    }

    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-lg' });
    }
    decline() {
        this.exchangeModalRef.hide();
    }
    goExchange() {
        this.router.navigate(['/exchange']);
        this.exchangeModalRef.hide();
    }

    installWallet() {
        window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn');
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
