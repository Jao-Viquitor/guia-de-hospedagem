import { Component, signal, computed, inject, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { APP_CONTENT } from './services/content.data';
import { MenuGridComponent } from './components/menu-grid.component';
import { IconComponent } from './components/icon.component';
import { PlacesService } from './services/places.service';
import { environment } from './environments/environment';
import { SafePipe } from './pipes/safe.pipe';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Use window.print() for desktop - no modifications needed
      this.isExporting.set(true);
      this.cdr.detectChanges();
      
      // Small delay to ensure content is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      window.print();
      
      this.isExporting.set(false);
      this.cdr.detectChanges();
      return;
    }

    // Mobile PDF generation
    this.isExporting.set(true);
    
    // Add PDF export mode class to body for mobile styling
    document.body.classList.add('pdf-export-mode');
    
    this.cdr.detectChanges();

    // Wait for all images to be fetched
    await this.fetchAllImages();
    this.cdr.detectChanges();

    // Wait for images to load with longer timeout
    await this.waitForAllImagesToLoad();
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Use jsPDF for mobile devices
      await this.generatePdfWithLibrary();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Erro ao gerar PDF. Por favor, tente novamente.');
    } finally {
      // Remove PDF export mode class
      document.body.classList.remove('pdf-export-mode');
      this.isExporting.set(false);
      this.cdr.detectChanges();
    }
  }

  private async generatePdfWithLibrary() {
    const content = document.querySelector('main');
    if (!content) return;

    // Ensure all images have crossOrigin set for CORS
    const allImages = content.querySelectorAll('img');
    allImages.forEach(img => {
      if (!img.crossOrigin) {
        img.crossOrigin = 'anonymous';
      }
    });

    // Wait a bit for images to reload with CORS
    await new Promise(resolve => setTimeout(resolve, 500));

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log('Generating PDF for mobile...');
    
    // Track page numbers for each section - will be updated dynamically
    const pageNumbers: Record<string, number> = {};
    let currentPage = 1;
    
    // FIRST PAGE: Header + Menu only (without contact)
    const printHeader = document.querySelector('.print-only');
    const indexPage = content.querySelector('.print-index-page');
    
    if (printHeader && indexPage) {
      // Create a temporary container for the first page
      const firstPageContainer = document.createElement('div');
      firstPageContainer.style.width = '794px';
      firstPageContainer.style.backgroundColor = '#ffffff';
      firstPageContainer.style.padding = '20px';
      firstPageContainer.className = 'pdf-first-page-container';
      
      // Clone and append elements
      const headerClone = printHeader.cloneNode(true) as HTMLElement;
      const indexClone = indexPage.cloneNode(true) as HTMLElement;
      
      // Force visibility on cloned elements
      headerClone.style.display = 'block';
      headerClone.style.visibility = 'visible';
      headerClone.classList.remove('hidden');
      
      firstPageContainer.appendChild(headerClone);
      firstPageContainer.appendChild(indexClone);
      
      document.body.appendChild(firstPageContainer);
      
      try {
        console.log('Capturing first page (header + menu)...');
        const canvas = await html2canvas(firstPageContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
          imageTimeout: 15000,
        });

        const imgData = canvas.toDataURL('image/png', 0.95);
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
        
        console.log('✓ First page captured (page 1)');
      } catch (error) {
        console.error('Error capturing first page:', error);
      } finally {
        document.body.removeChild(firstPageContainer);
      }
    }
    
    // Remaining sections (welcome, directions, checkin, wifi, rules, guide, contact)
    const remainingSections = ['welcome', 'directions', 'checkin', 'wifi', 'rules', 'guide', 'contact'];
    
    for (let i = 0; i < remainingSections.length; i++) {
      const sectionId = remainingSections[i];
      const section = content.querySelector(`#${sectionId}`) as HTMLElement;
      
      if (!section) continue;
      
      try {
        console.log(`Capturing section ${i + 1}/${remainingSections.length}: ${sectionId}`);
        
        pdf.addPage();
        currentPage++;
        
        // Record the page number for this section (FIRST page of the section)
        pageNumbers[sectionId] = currentPage;
        
        const canvas = await html2canvas(section, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          windowWidth: 794,
          width: section.scrollWidth,
          height: section.scrollHeight,
          imageTimeout: 15000,
          removeContainer: true,
        });

        const imgData = canvas.toDataURL('image/png', 0.95);
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight > pageHeight - 20) {
          let position = 0;
          let pageIndex = 0;
          
          while (position < canvas.height) {
            if (pageIndex > 0) {
              pdf.addPage();
              currentPage++;
            }
            
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(
              (pageHeight - 20) * canvas.width / imgWidth,
              canvas.height - position
            );
            
            const ctx = pageCanvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
              
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
              
              const pageImgData = pageCanvas.toDataURL('image/png', 0.95);
              const pageImgHeight = (pageCanvas.height * imgWidth) / pageCanvas.width;
              pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageImgHeight);
            }
            
            position += pageCanvas.height;
            pageIndex++;
          }
        } else {
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
        
        console.log(`✓ Section ${sectionId} captured starting at page ${pageNumbers[sectionId]} (ended at page ${currentPage})`);
      } catch (error) {
        console.error(`Error capturing section ${sectionId}:`, error);
      }
    }

    // Now add clickable links to the first page with correct page numbers
    console.log('Adding interactive links to menu with page mappings:', pageNumbers);
    
    // Go back to first page to add links
    pdf.setPage(1);
    
    // Calculate positions for menu items using the actual rendered positions
    // These values are based on the 794px width container with 20px padding
    const menuStartY = 85; // Y position where menu grid starts (adjusted)
    const itemWidth = 87;  // Width of each grid item
    const itemHeight = 87; // Height of each grid item
    const gapX = 6;        // Gap between columns
    const gapY = 6;        // Gap between rows
    const leftColX = 10;   // Left column X position
    const rightColX = leftColX + itemWidth + gapX; // Right column X position
    
    // Row 1: Welcome, Directions
    if (pageNumbers.welcome) {
      pdf.link(leftColX, menuStartY, itemWidth, itemHeight, { pageNumber: pageNumbers.welcome });
      console.log(`✓ Link added: Welcome (${leftColX}, ${menuStartY}) -> page ${pageNumbers.welcome}`);
    }
    if (pageNumbers.directions) {
      pdf.link(rightColX, menuStartY, itemWidth, itemHeight, { pageNumber: pageNumbers.directions });
      console.log(`✓ Link added: Directions (${rightColX}, ${menuStartY}) -> page ${pageNumbers.directions}`);
    }
    
    // Row 2: Checkin, WiFi
    const row2Y = menuStartY + itemHeight + gapY;
    if (pageNumbers.checkin) {
      pdf.link(leftColX, row2Y, itemWidth, itemHeight, { pageNumber: pageNumbers.checkin });
      console.log(`✓ Link added: Checkin (${leftColX}, ${row2Y}) -> page ${pageNumbers.checkin}`);
    }
    if (pageNumbers.wifi) {
      pdf.link(rightColX, row2Y, itemWidth, itemHeight, { pageNumber: pageNumbers.wifi });
      console.log(`✓ Link added: WiFi (${rightColX}, ${row2Y}) -> page ${pageNumbers.wifi}`);
    }
    
    // Row 3: Rules, Guide
    const row3Y = menuStartY + (itemHeight + gapY) * 2;
    if (pageNumbers.rules) {
      pdf.link(leftColX, row3Y, itemWidth, itemHeight, { pageNumber: pageNumbers.rules });
      console.log(`✓ Link added: Rules (${leftColX}, ${row3Y}) -> page ${pageNumbers.rules}`);
    }
    if (pageNumbers.guide) {
      pdf.link(rightColX, row3Y, itemWidth, itemHeight, { pageNumber: pageNumbers.guide });
      console.log(`✓ Link added: Guide (${rightColX}, ${row3Y}) -> page ${pageNumbers.guide}`);
    }
    
    // Contact button (full width at bottom)
    const contactButtonY = menuStartY + (itemHeight + gapY) * 3 + 8;
    const contactButtonHeight = 16;
    if (pageNumbers.contact) {
      pdf.link(leftColX, contactButtonY, itemWidth * 2 + gapX, contactButtonHeight, { pageNumber: pageNumbers.contact });
      console.log(`✓ Link added: Contact (${leftColX}, ${contactButtonY}) -> page ${pageNumbers.contact}`);
    }

    console.log('PDF generation complete, downloading...');
    pdf.save(`Helens-Guidebook-${this.lang()}.pdf`);
  }

  private async waitForAllImagesToLoad() {
    const images = Array.from(document.querySelectorAll('img'));
    
    // Set crossOrigin for all images to handle CORS
    images.forEach(img => {
      if (!img.crossOrigin && (img.src.includes('googleusercontent') || img.src.includes('qrserver'))) {
        img.crossOrigin = 'anonymous';
        // Force reload if src is already set
        const src = img.src;
        img.src = '';
        img.src = src;
      }
    });
    
    const promises = images.map(img => {
      if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = () => resolve(true);
        img.onerror = () => {
          console.warn('Failed to load image:', img.src);
          resolve(false);
        };
      });
    });
    
    // Timeout of 10 seconds total for images on mobile
    await Promise.race([
      Promise.all(promises),
      new Promise(resolve => setTimeout(resolve, 10000))
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