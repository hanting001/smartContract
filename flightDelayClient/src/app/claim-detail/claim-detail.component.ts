import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';

@Component({
    selector: 'app-claim-detail',
    templateUrl: './claim-detail.component.html',
    styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
    envState: any = {};
    sfInfo: any = {};

    chartLabels: string[] = ['无延误或延误不到半小时', '延误半小时以上', '延误1小时以上', '延误2小时以上', '航班取消'];
    chartData: number[] = [0, 0, 0, 0, 0];


    constructor(private route: ActivatedRoute, private web3: Web3Service, private flightDelaySer: FlightDelayService) { }

    ngOnInit() {
        this.web3.getCheckEnvSubject().subscribe((tempEnvState: any) => {
            // console.log(tempEnvState);
            if (tempEnvState.checkEnv) {
                if (tempEnvState.checkEnv !== this.envState.checkEnv
                    || (tempEnvState.checkAccount && tempEnvState.account != this.envState.account)
                ) {
                    this.envState.changed = true;
                    if (tempEnvState.canLoadData) {
                        this.getSfInfo();
                    }
                } else {
                    this.envState.changed = false;
                }
                this.envState = tempEnvState;
            }
            this.envState = tempEnvState;
        });
        this.web3.check();
    }


    async checkEnv() {
        this.envState = await this.web3.check();
    }

    async getSfInfo() {
        console.log('======================================');
        this.sfInfo = await this.flightDelaySer.getSfInfoByIndex(this.route.snapshot.params['sfIndex']);
        console.log(this.sfInfo);
        const totalCount = this.sfInfo.voteInfo.noCounts * 1 + this.sfInfo.voteInfo.cancelCounts * 1
            + this.sfInfo.voteInfo.delay1Counts * 1 + this.sfInfo.voteInfo.delay2Counts * 1
            + this.sfInfo.voteInfo.delay3Counts * 1;

        // this.sfInfo.voteInfo.noPercent = (this.sfInfo.voteInfo.noCounts * 100 / totalCount).toFixed(0) + '%';
        // this.sfInfo.voteInfo.cancelPercent = (this.sfInfo.voteInfo.cancelCounts * 100 / totalCount).toFixed(0) + '%';
        // this.sfInfo.voteInfo.delay1Percent = (this.sfInfo.voteInfo.delay1Counts * 100 / totalCount).toFixed(0) + '%';
        // this.sfInfo.voteInfo.delay2Percent = (this.sfInfo.voteInfo.delay2Counts * 100 / totalCount).toFixed(0) + '%';
        // this.sfInfo.voteInfo.delay3Percent = (this.sfInfo.voteInfo.delay3Counts * 100 / totalCount).toFixed(0) + '%';
        // console.log(this.sfInfo);

        this.chartData[0] = this.sfInfo.voteInfo.noCounts * 1;

        this.chartData[1] = this.sfInfo.voteInfo.delay1Counts * 1;
        this.chartData[2] = this.sfInfo.voteInfo.delay2Counts * 1;
        this.chartData[3] = this.sfInfo.voteInfo.delay3Counts * 1;
        this.chartData[4] = this.sfInfo.voteInfo.cancelCounts * 1;

        console.log(this.chartData);
    }

}
