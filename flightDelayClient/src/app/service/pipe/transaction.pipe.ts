import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'transaction'
})
export class TransactionPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value.type === 'approve') {
            return '授权扣除' + value.sfInfo.price + '个代币，用于加入航班号为'
                + value.sfInfo.flightNO + ',出发日期为'
                + moment(value.sfInfo.flightDate).format('YYYY-MM-DD')
                + '的航班延误互助计划';
        } else if (value.type === 'join') {
            return '扣除代币并加入航班延误互助计划，航班号为'
                + value.sfInfo.flightNO + ',出发日期为'
                + moment(value.sfInfo.flightDate).format('YYYY-MM-DD')
                + '，祝您好运！';
        } else if (value.type === 'exchange') {
            return '花费' + (value.eth ? value.eth : '') + 'ETH兑换'
                + (value.tokenCount ? value.tokenCount : '') + '个Token，祝您好运！';
        } else if (value.type === 'applyClaim') {
            return '发起一个理赔申请，航班号为' + (value.flightNO) + ',出发日期为'
                + moment(value.flightDate).format('YYYY-MM-DD') + '';
        } else if (value.type == 'approveRedeem') {
            return '授权扣除' + value.tokenCount + '个代币，用于赎回' + value.eth + 'ETH';
        } else if (value.type == 'redeem') {
            return '扣除' + value.tokenCount + '个代币并获得' + value.eth + 'ETH';
        } else if (value.type == 'withdraw') {
            return '领取' + value.tokenCount + '个代币';
        } else if (value.type == 'getClaim') {
            return '获取理赔金，航班号为' + (value.flightNO) + ',出发日期为'
                + moment(value.flightDate).format('YYYY-MM-DD');
        }
        return '';
    }

}
