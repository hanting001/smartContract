import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'transactionUrl'
})
export class TransactionUrlPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value.netType === 'main') {
            return 'https://etherscan.io/tx/' + value.transactionHash;
        } else if (value.netType === 'kovan') {
            return 'https://kovan.etherscan.io/tx/' + value.transactionHash;
        }
        return '';
    }

}
