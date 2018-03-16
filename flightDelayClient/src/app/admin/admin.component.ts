import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  balance: any;
  account: string;
  constructor(
    private route: ActivatedRoute,
    private web3Service: Web3Service,
    private flightDelayService: FlightDelayService
  ) { }

  ngOnInit() {
    this.balance = JSON.stringify(this.route.snapshot.data.balance);
    this.route.params.subscribe(params => {
      this.account = params.account;
    });
  }

  async transfer() {
    const web3 = this.web3Service.instance();
    const accounts = await web3.eth.getAccounts();
    // 第一个账户用于部署合约
    const from = accounts[0];
    console.log(from);
    const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
    tokenSC.methods.transfer(this.account, web3.utils.toWei('10000')).send({from: from})
    .on('confirmation', async (confNumber, receipt) => {
      const raw = await this.flightDelayService.getBalanceByAccount(this.account);
      this.balance = JSON.stringify(raw);
    });

  }
}
