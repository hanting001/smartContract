import { Component, OnInit } from '@angular/core';

import { Web3Service, FlightDelayService } from '../service/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

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
  constructor(private fb: FormBuilder, private web3: Web3Service,
    private flightDelayService: FlightDelayService, private localService: BsLocaleService) {
    this.form = this.fb.group({
      flightNO: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{4}$/)]],
      flightDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.web3.getMainAccount().then(account => {
      this.account = account;
    });
    this.flightDelayService.getSFInfo('SF5050', '2018-03-09').then(result => {
      this.sfInfo = JSON.stringify(result);
    });
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

  get flightNO() { return this.form.get('flightNO'); }
  get flightDate() { return this.form.get('flightDate'); }
}
