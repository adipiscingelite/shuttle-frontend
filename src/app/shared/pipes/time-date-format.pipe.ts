import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common'; // Mengimpor Angular's built-in DatePipe

@Pipe({
  name: 'timeDateFormat'
})
export class TimeDateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {} // Inisialisasi DatePipe

  transform(value: any): string {
    // Cek jika value bukan tanggal yang valid
    if (!value) return '-';

    // Format tanggal menjadi 'HH:mm dd/MM/yyyy'
    const formattedDate = this.datePipe.transform(value, 'HH:mm dd/MM/yyyy');
    return formattedDate || '-'; // Kembalikan nilai terformat atau '-' jika tidak valid
  }
}
