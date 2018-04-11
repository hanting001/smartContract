import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nationFlag'
})
export class NationFlagPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        return 'assets/images/nation-flags/' + value.replace(/[ ]/g, '') + '.png';
    }

}
