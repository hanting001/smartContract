import { Component, OnInit } from '@angular/core';

import { Web3Service, FlightDelayService } from '../service/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  account: string;
  sfInfo: string;
  constructor(private web3: Web3Service, private flightDelayService: FlightDelayService) { }

  ngOnInit() {
    this.web3.getMainAccount().then(account => {
      this.account = account;
    });
    this.flightDelayService.getSFInfo('SF5050', '2018-03-09').then(result => {
      this.sfInfo = JSON.stringify(result);
    });
  }
}
