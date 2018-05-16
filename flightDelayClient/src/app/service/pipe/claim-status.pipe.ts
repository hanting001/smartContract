import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'claimStatus'
})
export class ClaimStatusPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        console.log(args);
        if (value === '0') {
            return '可申请理赔';
        } else if (value === '2') {
            return '投票中';
        } else if (value === '3') {
            // if (args && (args[0] * 1 > 1)) {
            //     return '可领取';
            // }
            //          { key: 0, value: '无延误或延误不到半小时' },
            // { key: 1, value: '延误半小时以上' },
            // { key: 2, value: '延误1小时以上' },
            // { key: 3, value: '延误2小时以上' },
            // { key: 4, value: '航班取消' }
            let count = args.noCounts;
            let msg = '无延误或延误不到半小时';
            if (count < args.delay1Counts) {
                count = args.delay1Counts;
                msg = '延误半小时以上';
            }
            if (count < args.delay2Counts) {
                count = args.delay2Counts;
                msg = '延误1小时以上';
            }
            if (count < args.delay3Counts) {
                count = args.delay3Counts;
                msg = '延误2小时以上';
            }
            if (count < args.cancelCounts) {
                count = args.cancelCounts;
                msg = '航班取消';
            }

            return msg;
        }
        return null;
    }

}
