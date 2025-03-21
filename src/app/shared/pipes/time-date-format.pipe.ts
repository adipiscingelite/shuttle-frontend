import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timeDateFormat',
})
export class TimeDateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: any): string {
    if (!value) return '-';

    const formattedDate = this.datePipe.transform(value, 'HH:mm dd/MM/yyyy');
    return formattedDate || '-';
  }
}
