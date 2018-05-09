
import { Component, ViewChild, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Web3Service, LoadingService, AlertService } from './service/index';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    isSupportBrowser: Boolean = true;
    title = 'app';
    loading: Boolean = false;
    loadingText?: string;
    tip: any = {};
    alertModalRef: BsModalRef;
    subscription;
    account = '';
    @ViewChild('alertTemplate') alertTemplate: TemplateRef<any>;
    constructor(public loadingSer: LoadingService,
        private modalService: BsModalService,
        public alertSer: AlertService,
        private web3: Web3Service
    ) {
        this.isSupportBrowser = this.getIsSupportBrowser();
        this.loadingSer.getLoadingObservable().subscribe((data: any) => {
            if (data.loading) {
                $('.backdrop').css({ 'height': $('window').height() }).show();
            } else {
                $('.backdrop').hide();
            }
            this.loading = data.loading;
            this.loadingText = data.loadingText;
        });
        this.alertSer.getAlertObservable().subscribe((data) => {
            this.tip = data;
            if (this.tip.show) {
                this.alertModalRef = this.openModal(this.alertTemplate);
            } else {
                this.alertModalRef.hide();
            }
        });


        // (() => {

        //     if (!sessionStorage.length) {
        //         // 这个调用能触发目标事件，从而达到共享数据的目的
        //         localStorage.setItem('getSessionStorage', Date.now().toString());
        //     };

        //     // 该事件是核心
        //     window.addEventListener('storage', function (event) {
        //         if (event.key == 'getSessionStorage') {
        //             console.log('已存在的标签页会收到这个事件');
        //             // 已存在的标签页会收到这个事件
        //             localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
        //             localStorage.removeItem('sessionStorage');

        //         } else if (event.key == 'sessionStorage' && !sessionStorage.length) {
        //             // 新开启的标签页会收到这个事件
        //             const data = JSON.parse(event.newValue);
        //             console.log('新开启的标签页会收到这个事件');
        //             for (const key in data) {
        //                 sessionStorage.setItem(key, data[key]);
        //             }
        //         }
        //     });
        // })();
    }
    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            if (tempEnvState.checkEnv === true &&
                (tempEnvState.checkEnv !== this.envState.checkEnv || tempEnvState.account != this.envState.account)
            ) {
                this.web3.getMainAccount().then(account => {
                    this.account = account;
                });
            }
            this.envState = tempEnvState;
        });
    }
    doComfirm() {
        this.alertSer.doConfirm();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    openModal(template: TemplateRef<any>) {
        return this.modalService.show(template, { class: 'modal-md' });
    }

    closeAlert() {
        this.alertModalRef.hide();
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
}
