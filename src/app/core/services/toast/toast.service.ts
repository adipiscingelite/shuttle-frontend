import { Injectable, NgZone } from '@angular/core';
import { Response } from '@core/interfaces';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private ngZone: NgZone) {}

  toasts: { message: string; duration: number; type: Response }[] = [];

  add(message: string, duration: number, type: Response) {
    this.ngZone.run(() => {
      this.toasts.push({ message, duration, type });
    });

    setTimeout(() => {
      this.ngZone.run(() => this.remove(0));
    }, duration);
  }

  remove(index: number) {
    this.ngZone.run(() => {
      this.toasts.splice(index, 1);
    });
  }
}
