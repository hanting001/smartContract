import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'claimStatus'
})
export class ClaimStatusPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value === '0') {
            return '可申请理赔';
        } else if (value === '2') {
            return '投票中';
        } else if (value === '3') {
            if (args && (args[0] * 1 > 1)) {
                return '可领取';
            }
        }
        return null;
    }

}
