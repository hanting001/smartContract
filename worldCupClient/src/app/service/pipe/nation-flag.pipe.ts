import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nationFlag'
})
export class NationFlagPipe implements PipeTransform {
    transform(value: any, contries?: any): any {
        // console.log(contries);
        // console.log(value);
        if (!contries) {
            return 'assets/images/nation-flags/' + value.replace(/[ ]/g, '') + '.png';
        }

        if (contries[value]) {
            value = String(value).toUpperCase();
            return 'assets/images/nation-flags/' + value.replace(/[ ]/g, '') + '.png';
        }
        return 'assets/images/nation-flags/none.png';
    }

}
