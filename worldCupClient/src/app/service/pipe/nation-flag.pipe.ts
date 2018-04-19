import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nationFlag'
})
export class NationFlagPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        value = String(value).toUpperCase();
        return 'assets/images/nation-flags/' + value.replace(/[ ]/g, '') + '.png';
    }

}
