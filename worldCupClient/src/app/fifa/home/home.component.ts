import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../service/index';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';
import { WCCService } from '../../service/wcc.service';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class FifaHomeComponent implements OnInit {
    envState: any = {};
    gameInfos: any = [];
    games: any = [];
    isSticky: Boolean = false;

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public alertSer: AlertService) { }

    ngOnInit() {
        this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
                this.getAllGames();
            }
            this.envState = tempEnvState;
        });
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
        const sortNumber = function (a, b) {
            return a.time - b.time;
        };
        let gameInfos = await this.wccSer.getAllPlayers();
        gameInfos = gameInfos.sort(sortNumber);

        console.log(gameInfos);

        const games = [];
        const gameLen = gameInfos.length;
        for (let i = 0; i < gameLen; i++) {
            const game: any = {};
            console.log(gameInfos[i].time);
            console.log(new Date(gameInfos[i].time * 1));
            const date = moment(new Date(gameInfos[i].time * 1));
            game.date = date.format('YYYY-MM-DD');
            game.day = date.format('DD');
            game.dayOfWeek = date.isoWeekday();
            if (games.length > 0 && games[games.length - 1].date == game.date) {
                games[games.length - 1].count++;
                games[games.length - 1].courts.push(gameInfos[i]);
            } else {
                game.count = 1;
                game.courts = [gameInfos[i]];
                games.push(game);
            }



        }

        this.games = games;
        console.log(this.games);
    }

    gotoCourt() {
        this.router.navigate(['fifa/court']);
    }

}
