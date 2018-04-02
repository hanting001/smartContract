import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'transaction'
})
export class TransactionPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value.type === 'approve') {
            return '您已授权扣除' + value.sfInfo.price + '个代币，用于购买航班号为'
                + value.sfInfo.flightNO + ',出发日期为'
                + moment(value.sfInfo.flightDate).format('YYYY-MM-DD')
                + '的航班延误互助计划';
        } else if (value.type === 'join') {
            return '您已申请加入航班延误互助计划，航班号为'
                + value.sfInfo.flightNO + ',出发日期为'
                + moment(value.sfInfo.flightDate).format('YYYY-MM-DD')
                + '，祝您好运！';
        } else if (value.type === 'exchange') {
            return '您申请花费' + (value.eth ? value.eth : '') + 'ETH兑换'
                + (value.tokenCount ? value.tokenCount : '') + '个token，祝您好运！';
        }
        return '';
    }

}
