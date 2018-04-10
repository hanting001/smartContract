import { Pipe, PipeTransform } from '@angular/core';
import { DelayRates } from './configData';
@Pipe({ name: 'delayRate' })
export class DelayRatePipe implements PipeTransform {
    transform(value: number): String {
        let returnValue = '';
        DelayRates.forEach(obj => {
            if (value == obj.key) {
                returnValue = obj.value;
            }
        });
        return returnValue;
    }
}
