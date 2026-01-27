import { Component, signal, computed, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONTENT } from './services/content.data';
import { MenuGridComponent } from './components/menu-grid.component';
import { IconComponent } from './components/icon.component';
import { PlacesService } from './services/places.service';
import { environment } from './environments/environment';
import { SafePipe } from './pipes/safe.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MenuGridComponent, IconComponent, SafePipe],
  templateUrl: './app.component.html'
})
export class AppComponent {
  private placesService = inject(PlacesService);
  private cdr = inject(ChangeDetectorRef);

  lang = signal<'pt' | 'es'>('pt');
  view = signal<string>('home');
  isExporting = signal<boolean>(false);
  pdfDownloadStatus = signal<'idle' | 'downloading' | 'success'>('idle');

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
    
    // Check URL for language parameter
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam === 'es' || langParam === 'pt') {
      this.lang.set(langParam);
    }
    
    // Effect to trigger image fetching when the guide view is active or exporting
    effect(() => {
      if (this.view() === 'guide' || this.isExporting()) {
        this.fetchAllImages();
      }
    });
  }

  setLang(l: 'pt' | 'es') {
    this.lang.set(l);
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('lang', l);
    window.history.pushState({}, '', url);
  }

  setView(v: string) {
    this.view.set(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async exportToPdf() {
    try {
      this.pdfDownloadStatus.set('downloading');
      
      const currentLang = this.lang();
      const pdfFileName = currentLang === 'pt' 
        ? "Helen's Guidebook - PT.pdf" 
        : "Helen's Guidebook - ES.pdf";
      const pdfPath = `assets/${pdfFileName}`;
      
      const response = await fetch(pdfPath);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.pdfDownloadStatus.set('success');
      
      setTimeout(() => {
        this.pdfDownloadStatus.set('idle');
      }, 3000);
      
    } catch (error) {
      console.error('PDF download failed:', error);
      alert(this.lang() === 'pt' 
        ? 'Erro ao baixar PDF. Por favor, tente novamente.' 
        : 'Error al descargar PDF. Por favor, inténtelo de nuevo.');
      this.pdfDownloadStatus.set('idle');
    }
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