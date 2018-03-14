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

  // 设置最大可购买数
  async setMaxCount(count, onConfirmation) {
    const sc = await this.web3Service.getContract('flightDelay', 'FlightDelay');
    const web3 = this.web3Service.instance();
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
}
