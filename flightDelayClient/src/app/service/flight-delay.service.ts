import { LocalOrderService } from './local-order.service';
import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import * as moment from 'moment';

@Injectable()
export class FlightDelayService {
    constructor(private web3Service: Web3Service) { }

    // 获取航班相关信息
    async getSFInfo(flightNO, flightDate) {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        const web3 = this.web3Service.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        const price = await sc.methods.getPrice(flightNO).call();
        const hasQualification = await sc.methods.hasQualification(flightNO).call();
        const interval = await sc.methods.interval().call();
        const maxCount = await sc.methods.maxCount().call();
        const count = await sc.methods.getSFCount(key).call();
        return {
            price: price,
            interval: interval,
            maxCount: maxCount,
            count: count,
            hasQualification: hasQualification
        };
    }
    // 获取当前投票信息
    async getCurrentVote() {
        const storage = await this.web3Service.getContract('hbStorage', 'HbStorage');
        const currentVote = await storage.methods.currentVote().call();
        const voteInfo = await storage.methods.voteInfos(currentVote).call();
        if (voteInfo.isValued) {
            const sfInfo = await storage.methods.returnSFInfo(currentVote).call();
            return {
                voteInfo: voteInfo,
                sfInfo: sfInfo
            };
        }
        return null;
    }
    // 获取账户余额
    async getBalance() {
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        const web3 = this.web3Service.instance();
        const account = await this.web3Service.getMainAccount();
        const eth = await web3.eth.getBalance(account);
        const token = await tokenSC.methods.balanceOf(account).call();
        return {
            eth: web3.utils.fromWei(eth),
            token: web3.utils.fromWei(token)
        };
    }
    async getBalanceByAccount(account) {
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        const web3 = this.web3Service.instance();
        const eth = await web3.eth.getBalance(account);
        const token = await tokenSC.methods.balanceOf(account).call();
        return {
            eth: web3.utils.fromWei(eth),
            token: web3.utils.fromWei(token)
        };
    }
    // 获取eth和token的汇率
    async getRate() {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        return sc.methods.rate().call();
    }
    // 获取航班价格
    async getPrice(flightNO) {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        return sc.methods.getPrice(flightNO).call();
    }
    // 设置最大可购买数
    async setMaxCount(count, onConfirmation) {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        sc.methods.setMaxCount(count).send(options)
            .on('transactionHash', (transactionHash) => {
                console.log(`setMaxCount txHash: ${transactionHash}`);
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
    // 得到各时间段赔付信息
    async getDelayPayInfos() {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        return {
            0: await sc.methods.delayPayInfos(0).call(),
            1: await sc.methods.delayPayInfos(1).call(),
            2: await sc.methods.delayPayInfos(2).call(),
            3: await sc.methods.delayPayInfos(3).call(),
            4: await sc.methods.delayPayInfos(4).call()
        };
    }
    // 授权航延合约可以扣钱
    async approve(price) {
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        const address = await this.web3Service.getAddress('flightDelay');
        console.log(address);
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        return tokenSC.methods.approve(address, price).send(options);
    }
    /* 购买前校验，返回0表示校验通过
    */
    async canJoin(flightNO, flightDate) {
        const web3 = this.web3Service.instance();
        flightDate = moment(flightDate).format('YYYY-MM-DD');
        const key = web3.utils.keccak256(flightNO + flightDate);
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        const price = await sc.methods.getPrice(flightNO).call();
        const msgObj = {
            1: '日期格式不正确',
            2: '航班日期过早',
            3: '该航班已到最大购买量',
            4: '航班已不是开发购买状态',
            5: '已经购买过该航班',
            6: '账户代币余额不足'
        };
        const checkResult = await sc.methods.joinCheck(flightDate, key, web3.utils.toWei(String(price))).call();
        return {
            checkResult: checkResult,
            message: msgObj[checkResult]
        };
    }
    // 加入航延计划，不带投票信息
    async join(mySfInfo: any, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        const tokenSC = await this.web3Service.getContract('knotToken', 'KnotToken');
        const address = await this.web3Service.getAddress('flightDelay');
        // console.log(address);
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        console.log(options);
        const flightNO = mySfInfo.flightNO;
        const flightDate = moment(mySfInfo.flightDate).format('YYYY-MM-DD');
        console.log({
            flightNO: flightNO,
            flightDate: flightDate
        });
        // const checkData = await sc.methods.checkData(flightNO, flightDate).call(options);
        // console.log(checkData);
        const approve = await tokenSC.methods.allowance(options.from, address).call(options);
        console.log(approve);
        sc.methods.joinFlight(flightNO, flightDate)
            .send(options, function (err, transactionHash) {
                if (err) {
                    console.log(err);
                }
            })
            .on('transactionHash', (transactionHash) => {
                console.log(`join txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {


                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                if (onError) {
                    onError(error);
                }
                console.log(error);
            });
    }
    // test ok
    async testOK() {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        return sc.methods.testOK().call();
    }
    async testServiceOK() {
        const sc = await this.web3Service.getContract('flightDelayService', 'FlightDelayService');
        return sc.methods.testOK().call();
    }
    // 兑换token
    async exchange(value, onConfirmation) {
        const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
        // const address = await this.web3Service.getAddress('flightDelay');
        // console.log(address);
        const options = {
            from: await this.web3Service.getMainAccount(),
            value: value
        };
        console.log(options);
        sc.methods.exchange().send(options)
            .on('transactionHash', (transactionHash) => {
                console.log(`exchange txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                console.log(error);
            });
        // const web3 = this.web3Service.instance();
        // return web3.eth.sendTransaction(options)
        //   // return this.sc.methods.query(100).send({from: from})
        //   .on('transactionHash', (transactionHash) => {
        //     console.log(`exchange txHash: ${transactionHash}`);
        //   })
        //   .on('confirmation', (confNumber, receipt) => {
        //     if (onConfirmation) {
        //       onConfirmation(confNumber, receipt);
        //     }
        //   })
        //   .on('error', (error) => {
        //     console.log(error);
        //   });
    }
    // 测试查询合约状态用
    async getSfInfo() {
        const storage = await this.web3Service.getContract('hbStorage', 'HbStorage');
        const account = await this.web3Service.getMainAccount();
        // const web3 = this.web3Service.instance();
        // const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        const sfs = await storage.methods.returnMemberSFs().call();
        // console.log(key);
        // console.log(sf);
        // const memberSFInfo = await storage.methods.returnMemberSFInfo(key).call();
        // const sfInfo = await storage.methods.returnSFInfo(key).call();
        // const isInSF = await storage.methods.isInSF(key).call();
        const returnArray = [];
        for (let key of sfs) {
            const memberSFInfo = await storage.methods.returnMemberSFInfo(key).call();
            const sfInfo = await storage.methods.returnSFInfo(key).call();
            const isInSF = await storage.methods.isInSF(key).call();
            const data = {
                sfInfo: sfInfo,
                memberSFInfo: memberSFInfo,
                isInSF: isInSF,
                sfs: sfs,
                key: key
            };
            returnArray.push(data);
        }
        return returnArray;
    }

    // 检查是否已经加入过了
    async checkIsInSF(flightNO, flightDate) {
        const storage = await this.web3Service.getContract('hbStorage', 'HbStorage');
        const web3 = this.web3Service.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        return storage.methods.isInSF(key).call();
    }

    // 发起理赔
    async startClaim(flightNO, flightDate, target, onConfirmation, onError?) {
        const sc = await this.web3Service.getContract('flightDelayService', 'FlightDelayService');
        const options = {
            from: await this.web3Service.getMainAccount()
        };
        const web3 = this.web3Service.instance();
        const key = web3.utils.keccak256(flightNO + moment(flightDate).format('YYYY-MM-DD'));
        sc.methods.claim(key, target).send(options)
            .on('transactionHash', (transactionHash) => {
                console.log(`start claim txHash: ${transactionHash}`);
            })
            .on('confirmation', (confNumber, receipt) => {
                if (onConfirmation) {
                    onConfirmation(confNumber, receipt);
                }
            })
            .on('error', (error) => {
                if (onError) {
                    onError(error);
                }
                console.log(error);
            });
    }
}
