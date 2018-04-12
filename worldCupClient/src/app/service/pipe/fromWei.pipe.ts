import { Pipe, PipeTransform } from '@angular/core';
import { Web3Service } from '../../service/index';
@Pipe({
    name: 'fromWei'
})
export class FromWeiPipe implements PipeTransform {
    constructor(private web3Service: Web3Service) {

    }
    transform(value: any, args?: any): any {
        return this.web3Service.instance().utils.fromWei(value);
    }

}
