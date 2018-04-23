import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Pipe({
    name: 'nationFlag'
})
export class NationFlagPipe implements PipeTransform {
    constructor(private http: HttpClient) {

    }
    transform(value: any, args?: any): any {
        value = String(value).toUpperCase();
        if (value.length <= 3) {
            return'assets/images/nation-flags/placeholder.png';
        }
        return 'assets/images/nation-flags/' + value.replace(/[ ]/g, '') + '.png';
    }

}
