import { Component } from '@angular/core';

@Component({
  selector: 'app-required-common',
  standalone: true,
  imports: [],
  template: `<div class="text-xs text-red-500 mt-[1px]">Kolom ini wajib diisi.</div>`,
})
export class RequiredCommonComponent {

}
