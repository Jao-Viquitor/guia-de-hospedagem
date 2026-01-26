import { Injectable } from '@angular/core';

// Declare google variable to avoid TypeScript errors without installing types
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesService: any;
  private cache = new Map<string, string>();

  constructor() {
    this.initService();
  }

  private initService(): boolean {
    // Only initialize if the Google script has loaded
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps && (window as any).google.maps.places) {
      if (!this.placesService) {
        const dummyElement = document.createElement('div');
        this.placesService = new (window as any).google.maps.places.PlacesService(dummyElement);
      }
      return true;
    }
    return false;
  }

  async getPlacePhoto(query: string): Promise<string | null> {
    if (this.cache.has(query)) {
      return this.cache.get(query)!;
    }

    // Try to initialize if not ready
    if (!this.placesService) {
      if (!this.initService()) {
        // Wait a bit and try one more time
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!this.initService()) return null;
      }
    }

    const request = {
      query: query,
      fields: ['photos']
    };

    return new Promise((resolve) => {
      this.placesService.findPlaceFromQuery(request, (results: any[], status: any) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const photos = results[0].photos;
          if (photos && photos.length > 0) {
            // Get URL with max width of 400px
            const url = photos[0].getUrl({ maxWidth: 400 });
            this.cache.set(query, url);
            resolve(url);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}