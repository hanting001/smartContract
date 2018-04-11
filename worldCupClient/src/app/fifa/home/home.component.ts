import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalStorage } from '@ngx-pwa/local-storage';
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
export class FifaHomeComponent implements OnInit, OnDestroy {
    envState: any = { checkWeb3: true, checkAccount: true };
    gameInfos: any = [];
    games: any = [];
    isSticky: Boolean = true;
    subscription;
    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        private router: Router,
        public loadingSer: LoadingService,
        public alertSer: AlertService,
        private localStorage: LocalStorage) { }

    ngOnInit() {
        this.subscription = this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            console.log(tempEnvState);
            if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {
                this.getAllGames();
            }
            this.envState = tempEnvState;
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        console.log('window scroll');
        const number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        console.log(number);
        if (number > 25) {
            this.isSticky = true;
        } else if (this.isSticky && number < 10) {
            this.isSticky = true;
        }
    }


    async checkEnv() {
        const tempEnvState: any = await this.web3.check();
        console.log(tempEnvState);
        if (tempEnvState.checkEnv === true && tempEnvState.checkEnv !== this.envState.checkEnv) {

            await this.getAllGames();
        }
        this.envState = tempEnvState;

    }

    mouseEnter(event) {
        console.log(event.target);
        console.log('mouseEnter');
        // $(event.target).css('backgroundColor', '#ffffff');
        console.log($(event.target).index());
        const idx = $(event.target).index() * 1 + 1;
        // $("table tr td:nth-child(3)")
        $(event.target).parents('td').css('backgroundColor', '#0069d9');
    }

    mouseLeave(event) {
        console.log('mouseLeave');
        const idx = $(event.target).index() * 1 + 1;
        $(event.target).parents('td').css('backgroundColor', '#ffffff');
        // $(event.target).parents('table').find('tr').find('td').eq(idx).css('backgroundColor', '#ffffff');
    }

    async getAllGames() {
        const isGameUpdated = await this.wccSer.isGameUpdated();
        let games = await this.localStorage.getItem<any[]>('games').toPromise();
        if (!isGameUpdated && games && games.length > 0) {
            this.games = games;
            console.log('from local storage');
        } else {
            const sortNumber = function (a, b) {
                return a.time - b.time;
            };
            let gameInfos = await this.wccSer.getAllPlayers();
            gameInfos = gameInfos.sort(sortNumber);
            console.log(gameInfos);
            games = [];
            const gameLen = gameInfos.length;
            for (let i = 0; i < gameLen; i++) {
                const game: any = {};
                console.log(gameInfos[i].time);
                console.log(new Date(gameInfos[i].time * 1));
                const date = moment(gameInfos[i].time * 1000);
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
            this.localStorage.setItem('games', games).toPromise();
        }
    }

    gotoCourt() {
        this.router.navigate(['fifa/court']);
    }

}
