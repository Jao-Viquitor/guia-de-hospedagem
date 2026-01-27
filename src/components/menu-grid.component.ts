import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-menu-grid',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="grid grid-cols-2 gap-6 p-4 max-w-md mx-auto">
      @if (isPdfMode()) {
        <a href="#welcome" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="home"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().welcome }}</span>
        </a>

        <a href="#directions" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="map"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().directions }}</span>
        </a>

        <a href="#checkin" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="key"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().checkin }}</span>
        </a>

        <a href="#wifi" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="wifi"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().wifi }}</span>
        </a>

        <a href="#rules" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="file-text"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().rules }}</span>
        </a>

        <a href="#guide" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="shopping-cart"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().guide }}</span>
        </a>

        <a href="#contact" class="col-span-2 flex flex-row items-center justify-center gap-4 p-6 bg-primary rounded-xl shadow-lg hover:brightness-95 transition-all duration-200">
          <div class="text-white">
             <div class="w-8 h-8">
               <app-icon name="phone"></app-icon>
             </div>
          </div>
          <span class="text-lg font-bold text-white uppercase tracking-wider">{{ labels().contact }}</span>
        </a>
      } @else {
        <button (click)="onSelect('welcome')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="home"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().welcome }}</span>
        </button>

        <button (click)="onSelect('directions')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="map"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().directions }}</span>
        </button>

        <button (click)="onSelect('checkin')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="key"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().checkin }}</span>
        </button>

        <button (click)="onSelect('wifi')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="wifi"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().wifi }}</span>
        </button>

        <button (click)="onSelect('rules')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="file-text"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().rules }}</span>
        </button>

        <button (click)="onSelect('guide')" class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border-b-4 border-primary hover:bg-slate-50 transition-all duration-200 aspect-square group">
          <div class="text-primary group-hover:scale-110 transition-transform duration-200">
             <div class="w-12 h-12">
               <app-icon name="shopping-cart"></app-icon>
             </div>
          </div>
          <span class="mt-4 text-sm font-bold text-center text-gray-700 uppercase tracking-wide">{{ labels().guide }}</span>
        </button>

        <button (click)="onSelect('contact')" class="col-span-2 flex flex-row items-center justify-center gap-4 p-6 bg-primary rounded-xl shadow-lg hover:brightness-95 transition-all duration-200">
          <div class="text-white">
             <div class="w-8 h-8">
               <app-icon name="phone"></app-icon>
             </div>
          </div>
          <span class="text-lg font-bold text-white uppercase tracking-wider">{{ labels().contact }}</span>
        </button>
      }
    </div>
  `
})
export class MenuGridComponent {
  labels = input.required<any>();
  isPdfMode = input<boolean>(false);
  select = output<string>();

  onSelect(view: string) {
    this.select.emit(view);
  }
}