import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'showDate'
})
export class ShowDatePipe implements PipeTransform {

    transform(value: any, args?: any): any {
        const date = moment(new Date(value));
        const day = date.isoWeekday();
        let result = '';
        result = this.getFullNameOfWeekday(day) + ' ';
        result += date.format('DD') + ' ';
        result += this.getFullNameOfMonth(date.format('MM'));
        return result;
    }

    getFullNameOfWeekday(value) {
        if (value == 1) {
            return 'Monday';
        } else if (value == 2) {
            return 'Tuesday';
        } else if (value == 3) {
            return 'Wednesday';
        } else if (value == 4) {
            return 'Thursday';
        } else if (value == 5) {
            return 'Friday';
        } else if (value == 6) {
            return 'Saturday';
        } else if (value == 7) {
            return 'Sunday';
        }
        return '';
    }

    getFullNameOfMonth(month) {
        if (month == 1) {
            return 'January';
        } else if (month == 2) {
            return 'February';
        } else if (month == 3) {
            return 'March';
        } else if (month == 4) {
            return 'April';
        } else if (month == 5) {
            return 'May';
        } else if (month == 6) {
            return 'June';
        } else if (month == 7) {
            return 'July';
        } else if (month == 8) {
            return 'August';
        } else if (month == 9) {
            return 'September';
        } else if (month == 10) {
            return 'October';
        } else if (month == 11) {
            return 'November';
        } else if (month == 12) {
            return 'December';
        }
        return '';
    }

}
