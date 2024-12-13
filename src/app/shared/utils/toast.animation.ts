import { trigger, transition, style, animate } from '@angular/animations';

export const toastInOutAnimation = trigger('toastInOutAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate(
      '300ms ease-out',
      style({ transform: 'translateX(0)', opacity: 1 }),
    ),
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0)', opacity: 1 }),
    animate(
      '300ms ease-in',
      style({ transform: 'translateX(-100%)', opacity: 0 }),
    ),
  ]),
]);
