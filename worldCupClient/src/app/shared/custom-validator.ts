import { AbstractControl, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';
export function flightDateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const flightDate = control.value;
    try {
      moment(flightDate);
      return null;
    } catch (err) {
      return {flightDate: {value: flightDate}};
    }
  };
}
