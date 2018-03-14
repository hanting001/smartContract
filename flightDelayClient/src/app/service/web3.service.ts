import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class Web3Service {
  web3: any;
  contracts: any = {};
  constructor(private http: HttpClient) {
    this.web3 = new Web3();
    // Web3.givenProvider一般为浏览器内的metaMask
    // this.web3.setProvider(Web3.givenProvider || 'http://localhost:7545');
    // 这里直接连接到本地的Ganache
    this.web3.setProvider('http://localhost:7545');
  }
  async getMainAccount() {
    const accounts = await this.web3.eth.getAccounts();
    this.web3.eth.defaultAccount = accounts[0];
    return accounts[0];
  }
  instance() {
    return this.web3;
  }
  async getABI(name, func) {
    const raw = await this.http.get<any>('assets/build/contracts/' + name + '.json').toPromise();
    const abi = raw.abi;
    // const abi = require('../../../../build/contracts/' + name).abi;
    if (!func) {
      return abi;
    }
    for (let i = 0; i < abi.length; i++) {
      const item = abi[i];
      if (item.name === func) {
        return item;
      }
    }
  }
  async getAddress(name) {
    const db = await this.http.get<any>('assets/db.json').toPromise();
    console.log(db);
    // const db = require('../../../../migrations/db');
    return db[name].address;
  }
  async getContract(name, scName) {
    if (this.contracts[name]) {
      return this.contracts[name];
    }
    const abi = await this.getABI(scName, null);
    const address = await this.getAddress(name);
    const sc = new this.web3.eth.Contract(abi, address);
    this.contracts[name] = sc;
    return sc;
  }
}
