import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import * as moment from 'moment';
@Injectable()
export class FlightDelayService {
  constructor(private web3Service: Web3Service) { }

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
}
