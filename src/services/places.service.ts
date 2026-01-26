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

  private initService() {
    // Only initialize if the Google script has loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      const dummyElement = document.createElement('div');
      this.placesService = new google.maps.places.PlacesService(dummyElement);
    } else {
      // Retry in a second if script hasn't loaded yet
      setTimeout(() => this.initService(), 1000);
    }
  }

  getPlacePhoto(query: string): Promise<string | null> {
    if (this.cache.has(query)) {
      return Promise.resolve(this.cache.get(query)!);
    }

    if (!this.placesService) {
      this.initService();
      if (!this.placesService) return Promise.resolve(null);
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