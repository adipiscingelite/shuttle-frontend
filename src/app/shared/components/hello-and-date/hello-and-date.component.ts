import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfileService } from '@core/services';
import { Subscription, interval } from 'rxjs';
import { map } from 'rxjs/operators';

interface TimeData {
  dayName: string;
  dayDate: string;
  monthName: string;
  year: string;
  hours: number;
  minutes: number;
  seconds: number;
  ampm: string;
}

@Component({
  selector: 'app-hello-and-date',
  standalone: true,
  imports: [],
  templateUrl: './hello-and-date.component.html',
  styleUrls: ['./hello-and-date.component.css'], // fixed the plural
})
export class HelloAndDateComponent implements OnInit, OnDestroy {
  first_name: string = '';
  last_name: string = '';
  greeting: string = '';

  private greetings: string[] = [
    'We are pleased to have you back with us',
    "It's a pleasure to welcome you back",
    "We're glad to have you with us again",
    'It’s wonderful to see you once more',
    'We sincerely appreciate your continued engagement',
  ];

  private clockSubscription!: Subscription;
  hourHandRotation: string = '';
  minuteHandRotation: string = '';
  secondHandRotation: string = '';
  digitalTime: string = '';
  dateInfo: string = '';
  timezone: string = '';

  private readonly daysIndo = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  private readonly monthsIndo = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.fetchProfileData();
    this.randomizeText();

    // Set timezone info
    this.timezone = `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

    // Create an observable that emits every second
    this.clockSubscription = interval(1000)
      .pipe(map(() => this.getTimeData(new Date())))
      .subscribe((timeData) => {
        this.updateClockHands(timeData);
        this.updateDisplays(timeData);
      });
  }

  ngOnDestroy(): void {
    if (this.clockSubscription) {
      this.clockSubscription.unsubscribe();
    }
  }

  randomizeText(): void {
    const randomGreeting =
      this.greetings[Math.floor(Math.random() * this.greetings.length)];
    this.greeting = randomGreeting;
  }

  async fetchProfileData(): Promise<void> {
    try {
      this.profileService.profileData$.subscribe((data) => {
        if (data) {
          this.first_name = data.user_details.user_first_name;
          this.last_name = data.user_details.user_last_name;
        }
      });
    } catch (error) {
      console.error('Error fetching profile data', error);
    }
  }

  private getTimeData(date: Date): TimeData {
    return {
      dayName: this.daysIndo[date.getDay()],
      dayDate: date.getDate().toString(),
      monthName: this.monthsIndo[date.getMonth()],
      year: date.getFullYear().toString(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
      seconds: date.getSeconds(),
      ampm: date.getHours() >= 12 ? 'PM' : 'AM',
    };
  }

  private updateClockHands(timeData: TimeData): void {
    const hours = timeData.hours % 12;
    const minutes = timeData.minutes;
    const seconds = timeData.seconds;

    // Calculate rotation angles
    const hourAngle = hours * 30 + minutes * 0.5;
    const minuteAngle = minutes * 6;
    const secondAngle = seconds * 6;

    this.hourHandRotation = `translate(-50%, -100%) rotate(${hourAngle}deg)`;
    this.minuteHandRotation = `translate(-50%, -100%) rotate(${minuteAngle}deg)`;
    this.secondHandRotation = `translate(-50%, -80%) rotate(${secondAngle}deg)`;
  }

  private updateDisplays(timeData: TimeData): void {
    const displayHours = timeData.hours % 12 || 12;
    const paddedHours = displayHours.toString().padStart(2, '0');
    const paddedMinutes = timeData.minutes.toString().padStart(2, '0');
    const paddedSeconds = timeData.seconds.toString().padStart(2, '0');

    this.digitalTime = `${paddedHours}:${paddedMinutes} ${timeData.ampm}`;
    this.dateInfo = `${timeData.dayName}, ${timeData.dayDate} ${timeData.monthName} ${timeData.year}`;
  }
}
