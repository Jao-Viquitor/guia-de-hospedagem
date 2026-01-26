
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { environment } from './src/environments/environment';

// Dynamically load Google Maps script using environment configuration
const apiKey = environment.googleMapsApiKey;
console.log('API Key loaded:', apiKey ? 'YES (starts with ' + apiKey.substring(0, 4) + ')' : 'NO');
if (apiKey) {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection()
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
