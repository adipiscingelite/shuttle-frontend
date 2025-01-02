import { Component } from '@angular/core';

@Component({
  selector: 'app-hello-and-date',
  standalone: true,
  imports: [],
  templateUrl: './hello-and-date.component.html',
  styleUrl: './hello-and-date.component.css'
})
export class HelloAndDateComponent {
  greeting: string = '';
  // subGreeting: string = '';

  // private greetings: string[] = [
  //   'Welcome, Adipiscingelite',
  //   'Greetings, Adipiscingelite',
  //   'Hello again, Adipiscingelite',
  //   'Welcome back, Adipiscingelite',
  //   'Greetings, Adipiscingelite'
  // ];

  private greetings: string[] = [
    'We are pleased to have you back with us',
    'It\'s a pleasure to welcome you back',
    'We\'re glad to have you with us again',
    'It’s wonderful to see you once more',
    'We sincerely appreciate your continued engagement'
  ];

  ngOnInit(): void {
    this.randomizeText();
  }

  randomizeText(): void {
    // Randomize the greeting and subGreeting from the arrays
    const randomGreeting = this.greetings[Math.floor(Math.random() * this.greetings.length)];
    // const randomSubGreeting = this.subGreetings[Math.floor(Math.random() * this.subGreetings.length)];

    this.greeting = randomGreeting;
    // this.subGreeting = randomSubGreeting;
  }

}
