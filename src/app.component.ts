import { Component, signal, computed, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONTENT } from './services/content.data';
import { MenuGridComponent } from './components/menu-grid.component';
import { IconComponent } from './components/icon.component';
import { PlacesService } from './services/places.service';
import { environment } from './environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MenuGridComponent, IconComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private placesService = inject(PlacesService);
  private cdr = inject(ChangeDetectorRef);

  lang = signal<'pt' | 'es'>('pt');
  view = signal<string>('home');
  isExporting = signal<boolean>(false);

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
    console.log('Google Maps present?', typeof (window as any).google !== 'undefined');
    // Effect to trigger image fetching when the guide view is active or exporting
    effect(() => {
      if (this.view() === 'guide' || this.isExporting()) {
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

  async exportToPdf() {
    this.isExporting.set(true);
    this.cdr.detectChanges(); // Force Angular to render the hidden sections

    // Wait for all images to be fetched in parallel
    await this.fetchAllImages();
    this.cdr.detectChanges(); // Update DOM with new image URLs

    // Wait for all <img> tags to actually finish downloading/decoding
    await this.waitForAllImagesToLoad();

    // Tiny extra buffer for the OS print dialog
    await new Promise(resolve => setTimeout(resolve, 500));

    window.print();
    this.isExporting.set(false);
    this.cdr.detectChanges();
  }

  private async waitForAllImagesToLoad() {
    const images = Array.from(document.querySelectorAll('img'));
    const promises = images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if one fails
      });
    });
    // Timeout of 5 seconds total for images
    await Promise.race([
      Promise.all(promises),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
  }

  private async fetchAllImages(): Promise<void> {
    const currentContent = this.content();
    const categories = ['food', 'market', 'gas', 'coffee'] as const;
    const promises: Promise<void>[] = [];

    // Loop through all categories and items
    for (const cat of categories) {
      for (const item of currentContent.links[cat]) {
        // Only fetch if we don't have it yet
        if (!this.placeImages()[item.name]) {
          promises.push((async () => {
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
          })());
        }
      }
    }
    await Promise.all(promises);
  }
}