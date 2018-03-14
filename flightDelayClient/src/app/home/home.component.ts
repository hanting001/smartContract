import { Component, OnInit } from '@angular/core';

import { Web3Service, FlightDelayService } from '../service/index';
import * as $ from 'jquery';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  account: string;
  sfInfo: string;
  winHeight: any;
  constructor(private web3: Web3Service, private flightDelayService: FlightDelayService) {
    this.winHeight = ($(window).height() - 100) + 'px';

  }

  ngOnInit() {
    this.web3.getMainAccount().then(account => {
      this.account = account;
    });
    this.flightDelayService.getSFInfo('SF5050', '2018-03-09').then(result => {
      this.sfInfo = JSON.stringify(result);
    });
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
}
