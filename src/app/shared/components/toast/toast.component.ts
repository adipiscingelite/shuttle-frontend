import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ToastService } from '@core/services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
}
