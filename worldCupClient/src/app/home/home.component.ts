import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../service/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private web3: Web3Service) { }

  ngOnInit() {
    this.web3.check();
  }

}
