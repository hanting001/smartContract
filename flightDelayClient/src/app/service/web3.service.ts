import { Injectable } from '@angular/core';

@Injectable()
export class Web3Service {
  web3: any;
  constructor() {
    this.web3 = new Web3();
    this.web3.setProvider(Web3.givenProvider || 'http://localhost:7545');
  }
  async getMainAccount() {
    const accounts = await this.web3.eth.getAccounts();
    this.web3.eth.defaultAccount = accounts[0];
    return accounts[0];
  }

}
