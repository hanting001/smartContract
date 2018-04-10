import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'weekday'
})
export class WeekdayPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (value == 1) {
            return 'Mon';
        } else if (value == 2) {
            return 'Tue';
        } else if (value == 3) {
            return 'Wed';
        } else if (value == 4) {
            return 'Thu';
        } else if (value == 5) {
            return 'Fri';
        } else if (value == 6) {
            return 'Sat';
        } else if (value == 7) {
            return 'Sun';
        }
        return '';
    }

}
