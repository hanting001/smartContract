import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../service/index';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';
import { WCCService } from '../../service/wcc.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class FifaHomeComponent implements OnInit {
    envState: any = {};
    gameInfos: any = [];
    isSticky: Boolean = true;

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        public loadingSer: LoadingService,
        public alertSer: AlertService) { }

    ngOnInit() {
        setInterval(() => {
            this.checkEnv();
        }, 20000);

        this.checkEnv();
    }


    @HostListener('window:scroll', [])
    onWindowScroll() {
        console.log('window scroll');
        const number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        console.log(number);
        if (number > 25) {
            this.isSticky = true;
        } else if (this.isSticky && number < 10) {
            this.isSticky = false;
        }
    }


    async checkEnv() {
        const tempEnvState = await this.web3.check();
        console.log(tempEnvState);
        if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {

            await this.getAllGames();
        }
        this.envState = tempEnvState;

    }

    async getAllGames() {
        this.gameInfos = await this.wccSer.getAllPlayers();
        console.log(this.gameInfos);
    }

}
