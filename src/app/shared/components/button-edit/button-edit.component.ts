import { Component, OnDestroy } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-button-edit',
  standalone: true,
  imports: [],
  templateUrl: './button-edit.component.html',
  styleUrl: './button-edit.component.css'
})
export class ButtonEditComponent implements ICellRendererAngularComp {
  private user_id!: string; // Tambahkan properti untuk menyimpan user_id

  agInit(params: ICellRendererParams): void {
    this.user_id = params.context?.user_id || params.data?.user_id || ''; // Ambil user_id dari params
  }

  refresh(params: ICellRendererParams): boolean {
    return true; // Tidak perlu menyegarkan komponen untuk button sederhana
  }

  buttonClicked() {
    alert(`Launching software for User ID: ${this.user_id}`);
  }
}
