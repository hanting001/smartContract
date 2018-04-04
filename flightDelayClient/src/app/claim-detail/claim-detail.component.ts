import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';

@Component({
    selector: 'app-claim-detail',
    templateUrl: './claim-detail.component.html',
    styleUrls: ['./claim-detail.component.css']
})
export class ClaimDetailComponent implements OnInit {
    envState: any;
    sfInfo: any = {};

    constructor(private route: ActivatedRoute, private web3: Web3Service, private flightDelaySer: FlightDelayService) { }

    ngOnInit() {
        console.log(this.route.snapshot);
        console.log(this.route.snapshot.params['sfIndex']);
        this.checkEnv();
        this.getSfInfo();
    }


    async checkEnv() {
        this.envState = await this.web3.check();
    }

    async getSfInfo() {
        this.sfInfo = await this.flightDelaySer.getSfInfoByIndex(this.route.snapshot.params['sfIndex']);
        console.log(this.sfInfo);
        const totalCount = this.sfInfo.voteInfo.noCounts * 1 + this.sfInfo.voteInfo.cancelCounts * 1
            + this.sfInfo.voteInfo.delay1Counts * 1 + this.sfInfo.voteInfo.delay2Counts * 1
            + this.sfInfo.voteInfo.delay3Counts * 1;

        this.sfInfo.voteInfo.noPercent = (this.sfInfo.voteInfo.noCounts * 100 / totalCount).toFixed(0) + '%';
        this.sfInfo.voteInfo.cancelPercent = (this.sfInfo.voteInfo.cancelCounts * 100 / totalCount).toFixed(0) + '%';
        this.sfInfo.voteInfo.delay1Percent = (this.sfInfo.voteInfo.delay1Counts * 100 / totalCount).toFixed(0) + '%';
        this.sfInfo.voteInfo.delay2Percent = (this.sfInfo.voteInfo.delay2Counts * 100 / totalCount).toFixed(0) + '%';
        this.sfInfo.voteInfo.delay3Percent = (this.sfInfo.voteInfo.delay3Counts * 100 / totalCount).toFixed(0) + '%';
        console.log(this.sfInfo);
    }

}
