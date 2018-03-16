import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';

import { Web3Service, FlightDelayService } from '../service/index';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

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
  modalRef: BsModalRef;
  confirmMessage: string;
  @ViewChild('confirmTemplate') confirmTemplate: TemplateRef<any>;
  constructor(private fb: FormBuilder, private web3: Web3Service,
    private flightDelayService: FlightDelayService, private localService: BsLocaleService,
    private modalService: BsModalService) {
    this.form = this.fb.group({
      flightNO: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]{2}[0-9]{4}$/)]],
      flightDate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.web3.getMainAccount().then(account => {
      this.account = account;
    });
    // 测试
    this.flightDelayService.getCurrentVote();
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
  async join() {
    if (this.form.valid) {
      const model = this.form.value;
      const currentVote = await this.flightDelayService.getCurrentVote();
      const balance = await this.flightDelayService.getBalance();
      const price = await this.flightDelayService.getPrice(model.flightNO);
      console.log(balance);
      console.log(price);
      if (balance.token < price) {
        this.confirmMessage = `token余额不足${price}，是否前往兑换？`;
        this.openModal(this.confirmTemplate);
      }
      // this.router.navigate(['/']);
    }
    const flightDate = this.form.get('flightDate');
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }
  decline() {
    this.modalRef.hide();
  }
  goChange() {
  }
  get flightNO() { return this.form.get('flightNO'); }
  get flightDate() { return this.form.get('flightDate'); }
}
