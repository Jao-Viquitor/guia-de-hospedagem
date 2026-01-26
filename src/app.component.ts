import { Component, signal, computed, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONTENT } from './services/content.data';
import { MenuGridComponent } from './components/menu-grid.component';
import { IconComponent } from './components/icon.component';
import { PlacesService } from './services/places.service';
import { environment } from './environments/environment';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    this.cdr.detectChanges();

    // Wait for all images to be fetched
    await this.fetchAllImages();
    this.cdr.detectChanges();

    // Wait for images to load
    await this.waitForAllImagesToLoad();
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Use jsPDF for mobile devices
        await this.generatePdfWithLibrary();
      } else {
        // Use window.print() for desktop
        window.print();
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to print dialog
      window.print();
    } finally {
      this.isExporting.set(false);
      this.cdr.detectChanges();
    }
  }

  private async generatePdfWithLibrary() {
    const content = document.querySelector('main');
    if (!content) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Get all sections to print
    const sections = Array.from(content.querySelectorAll('.animate-fade-in, .print-index-page'));
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      
      try {
        // Capture section as canvas
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pageWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if not first section
        if (i > 0) {
          pdf.addPage();
        }

        // Add image to PDF
        pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
      } catch (error) {
        console.error(`Error capturing section ${i}:`, error);
      }
    }

    // Download the PDF
    pdf.save(`Helens-Guidebook-${this.lang()}.pdf`);
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