import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Web3Service, FlightDelayService } from '../service/index';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
  balance: any;
  constructor(
    private web3: Web3Service,
    private flightDelayService: FlightDelayService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    // this.flightDelayService.getBalance().then( balance => {
    //   this.balance = balance;
    // });
    this.balance = this.route.snapshot.data.balance;
  }

}
