import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.getCurrentLocation();
  }

  currLat: number = 0;
  currLng: number = 0;

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currLat = position.coords.latitude;
        this.currLng = position.coords.longitude;
        console.log('pp', this.currLat, 'woi', this.currLng);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}
