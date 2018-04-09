import { WCCService } from '../../service/wcc.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Web3Service } from '../../service/index';
import { LoadingService } from '../../service/loading.service';
import { AlertService } from '../../service/alert.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class FifaAdminComponent implements OnInit {
    form: FormGroup;
    envState: any = {};
    mytime: Date = new Date();
    gameInfos: any = [];

    constructor(private fb: FormBuilder,
        private web3: Web3Service,
        public wccSer: WCCService,
        public loadingSer: LoadingService,
        public alertSer: AlertService) {
        this.form = this.fb.group({
            awayCourt: ['', [Validators.required]],
            homeCourt: ['', [Validators.required]],
            startTime: ['', [Validators.required]],
            gameType: ['0', [Validators.required]]
        });

        this.checkEnv();
    }

    ngOnInit() {

    }

    async checkEnv() {
        this.envState = await this.web3.check();
        if (this.envState.checkEnv === true) {
            this.gameInfos = await this.wccSer.getAllPlayers();
            console.log(this.gameInfos);
        }
    }

    addPlayer() {
        if (this.form.valid) {
            this.loadingSer.show();
            const model = this.form.value;
            console.log(model);
            // this.router.navigate(['/']);
            this.wccSer.addPlayer(model, async (transactionHash) => { }, async (confirmNum, recipt) => {
                if (confirmNum == 2) {
                    this.loadingSer.hide();
                    this.gameInfos = await this.wccSer.getAllPlayers();
                    this.alertSer.show('添加成功');
                }
            });
        }
    }

    delGame(p1, p2, gameType) {
        const model = { arrayCourt: p1, homeCourt: p2, gameType: gameType };

        console.log(model);
        this.loadingSer.show();
        this.wccSer.delPlayer(model, async (transactionHash) => { }, async (confirmNum, recipt) => {
            if (confirmNum == 2) {
                this.loadingSer.hide();
                this.gameInfos = await this.wccSer.getAllPlayers();
                this.alertSer.show('删除成功');
            }
        });
    }


}
