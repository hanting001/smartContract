import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

declare var window: any;

@Injectable()
export class Web3Service {
    private checkEnvSubject: Subject<object> = new Subject<object>();
    web3: any;
    contracts: any = {};
    constructor(private http: HttpClient) {
        // this.web3 = new Web3();
        // Web3.givenProvider一般为浏览器内的metaMask
        // this.web3.setProvider(Web3.givenProvider || 'http://localhost:7545');
        // 这里直接连接到本地的Ganache
        // this.web3.setProvider('http://localhost:7545');
        this.check();
    }
    async getMainAccount() {
        if (this.web3.eth.defaultAccount) {
            return this.web3.eth.defaultAccount;
        }
        const accounts = await this.web3.eth.getAccounts();
        this.web3.eth.defaultAccount = accounts[accounts.length - 1];
        return this.web3.eth.defaultAccount;
    }

    async getFirstAccount() {
        const accounts = await this.web3.eth.getAccounts();
        return accounts[0];
    }
    instance() {
        return this.web3;
    }
    async getABI(name, func) {
        const raw = await this.http.get<any>('assets/build/contracts/' + name + '.json?' + new Date().getTime()).toPromise();
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
        const db = await this.http.get<any>('assets/db.json?' + new Date().getTime()).toPromise();
        // const db = require('../../../../migrations/db');
        return db[name].address;
    }
    async getContract(name, scName) {
        if (this.contracts[name]) {
            return this.contracts[name];
        }
        const abi = await this.getABI(scName, null);
        const address = await this.getAddress(name);
        console.log(`sc ${name} address: ${address}`);
        const sc = new this.web3.eth.Contract(abi, address);
        this.contracts[name] = sc;
        return sc;
    }
    // 通过组装参数，调用web3.eth.sendTransaction发起交易，一般不需要
    async sendTx(params, to, scName, func, onConfirmation) {
        const from = await this.getMainAccount();
        const abi = await this.getABI(scName, func);
        const code = this.web3.eth.abi.encodeFunctionCall(abi, params);
        const txObj = await this.getTransactionObj(from, to, code);
        console.log(`sendTransaction from ${from} to ${to}`);
        return this.web3.eth.sendTransaction(txObj)
            // return this.sc.methods.query(100).send({from: from})
            .on('transactionHash', (transactionHash) => {
                console.log(`${scName} ${func} txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
            });
    }

    async check() {
        console.log('开始环境检测');
        const state = { checkEnv: true, checkWeb3: true, checkAccount: true, account: '', netName: '', netType: '' };
        console.log(typeof window.web3);
        // if (typeof window.web3 !== 'undefined') {
        //     this.web3 = new Web3(window.web3.currentProvider);
        // } else {
        this.web3 = new Web3();
        // const ret = this.web3.setProvider(Web3.givenProvider);
        const ret = this.web3.setProvider('http://localhost:7545');
        if (!ret) {
            state.checkWeb3 = false;
        } else {
            state.account = await this.getMainAccount();
            if (!state.account) {
                state.checkAccount = false;
            }

            const netType = await this.web3.eth.net.getNetworkType();
            console.log(netType);
            state.netType = netType;

            switch (netType) {
                case 'main':
                    console.log('This is mainnet');
                    state.netName = '主网络';
                    break;
                case 'morden':
                    console.log('This is the deprecated Morden test network.');
                    state.netName = 'Morden测试网络';
                    break;
                case 'ropsten':
                    state.netName = 'ropsten测试网路';
                    console.log('This is the ropsten test network.');
                    break;
                case 'rinkeby':
                    console.log('This is the Rinkeby test network.');
                    state.netName = 'Rinkeby测试网路';
                    break;
                case 'kovan':
                    state.netName = 'Kovan测试网路';
                    console.log('This is the Kovan test network.');
                    break;
                case 'private':
                    state.netName = '未知网络';
                    console.log('This is the private test network.');
                    break;
                default:
                    state.netName = '未知网络';
                    state.checkEnv = false;
                    state.checkAccount = false;
                    state.checkWeb3 = false;
                    console.log('This is an unknown network.');
            }
        }

        state.checkEnv = state.checkAccount && state.checkWeb3;
        // state.checkEnv = false;
        this.checkEnvSubject.next(state);
        return state;
    }

    getCheckEnvSubject(): Subject<object> {
        return this.checkEnvSubject;
    }

    async getTransactionObj(from, to, code) {
        const dataObject: any = {
            to: to,
            data: code
        };
        if (from) {
            dataObject.from = from;
        }
        dataObject.gas = await this.web3.eth.estimateGas(dataObject);
        return dataObject;
    }
}
