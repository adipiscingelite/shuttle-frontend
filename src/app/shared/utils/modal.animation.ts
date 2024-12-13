import { trigger, transition, style, animate } from '@angular/animations';

export const modalScaleAnimation = trigger('modalScale', [
  transition(':enter', [
    style({ transform: 'scale(0.9)', opacity: 0 }),
    animate('100ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
  ]),
  transition(':leave', [
    style({ transform: 'scale(1)', opacity: 1 }),
    animate('300ms ease-in', style({ transform: 'scale(0)', opacity: 0 })),
  ]),
]);
