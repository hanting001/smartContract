import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'gameType'
})
export class GameTypePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value === '0') {
            return 'First stage';
        } else if (value === '1') {
            return 'Round of 16';
        } else if (value === '2') {
            return 'Quarter-finals';
        } else if (value === '3') {
            return 'Semi-finals';
        } else if (value === '4') {
            return 'For_third';
        } else if (value === '5') {
            return 'Final';
        }
        return '';
    }

}
