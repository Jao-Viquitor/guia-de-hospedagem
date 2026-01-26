import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONTENT } from './services/content.data';
import { MenuGridComponent } from './components/menu-grid.component';
import { IconComponent } from './components/icon.component';
import { PlacesService } from './services/places.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MenuGridComponent, IconComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private placesService = inject(PlacesService);
  
  lang = signal<'pt' | 'es'>('pt');
  view = signal<string>('home');
  
  // Store fetched Google images: Key = Name, Value = URL
  placeImages = signal<Record<string, string>>({});

  content = computed(() => {
    return APP_CONTENT[this.lang()];
  });

  // Generate QR Code URL for WiFi access
  wifiQrUrl = computed(() => {
    const wifi = this.content().sections.wifi;
    // WIFI:T:WPA;S:MyNetwork;P:MyPassword;;
    const data = `WIFI:T:WPA;S:${wifi.network};P:${wifi.pass};;`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=${encodeURIComponent(data)}`;
  });

  constructor() {
    // Effect to trigger image fetching when the guide view is active
    effect(() => {
      if (this.view() === 'guide') {
        this.fetchAllImages();
      }
    });
  }

  setLang(l: 'pt' | 'es') {
    this.lang.set(l);
  }

  setView(v: string) {
    this.view.set(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private async fetchAllImages() {
    const currentContent = this.content();
    const categories = ['food', 'market', 'gas', 'coffee'] as const;

    // Loop through all categories and items
    for (const cat of categories) {
      for (const item of currentContent.links[cat]) {
        // Only fetch if we don't have it yet
        if (!this.placeImages()[item.name]) {
          try {
            const url = await this.placesService.getPlacePhoto(item.name);
            if (url) {
              this.placeImages.update(prev => ({
                ...prev,
                [item.name]: url
              }));
            }
          } catch (e) {
            console.warn(`Could not fetch image for ${item.name}`, e);
          }
        }
      }
    }
  }
}