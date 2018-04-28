import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'gameStatus'
})
export class GameStatusPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value === '0') {
            return 'Open';
        } else if (value === '1') {
            return 'Playing';
        } else if (value === '2') {
            return 'Voting';
        } else if (value === '3') {
            return 'Paying';
        } else if (value === '4') {
            return 'End';
        }
        return '';
    }

}
