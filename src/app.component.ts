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
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Get all individual sections (each view is inside a div with id)
    const indexPage = content.querySelector('.print-index-page');
    const allSections: HTMLElement[] = [];
    
    // Add index page first
    if (indexPage) {
      allSections.push(indexPage as HTMLElement);
    }
    
    // Add all detail sections (welcome, directions, checkin, wifi, rules, guide, contact)
    const detailSections = content.querySelectorAll('[id]');
    detailSections.forEach(section => {
      if (section.id && section.id !== '') {
        allSections.push(section as HTMLElement);
      }
    });
    
    console.log(`Generating PDF with ${allSections.length} sections...`);
    
    for (let i = 0; i < allSections.length; i++) {
      const section = allSections[i] as HTMLElement;
      
      try {
        console.log(`Capturing section ${i + 1}/${allSections.length}: ${section.id || 'index'}`);
        
        // Capture section as canvas with better quality
        const canvas = await html2canvas(section, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 800,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const imgWidth = pageWidth - 20; // 10mm margin on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if not first section
        if (i > 0) {
          pdf.addPage();
        }

        // If content is taller than one page, split it
        if (imgHeight > pageHeight - 20) {
          let position = 0;
          let pageIndex = 0;
          
          while (position < canvas.height) {
            if (pageIndex > 0) {
              pdf.addPage();
            }
            
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(
              (pageHeight - 20) * canvas.width / imgWidth,
              canvas.height - position
            );
            
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                canvas,
                0,
                position,
                canvas.width,
                pageCanvas.height,
                0,
                0,
                pageCanvas.width,
                pageCanvas.height
              );
              
              const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.85);
              const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;
              pdf.addImage(pageImgData, 'JPEG', 10, 10, imgWidth, pageImgHeight);
            }
            
            position += pageCanvas.height;
            pageIndex++;
          }
        } else {
          // Fits in one page
          pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
        }
        
        console.log(`✓ Section ${i + 1} captured`);
      } catch (error) {
        console.error(`Error capturing section ${i}:`, error);
      }
    }

    console.log('PDF generation complete, downloading...');
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