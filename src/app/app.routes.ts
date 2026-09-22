import { Routes } from '@angular/router';

import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'esferaviva',
  },
  {
    path: 'explorar',
    title: 'Explorar — esferaviva',
    // Lazy load: o Leaflet só carrega quando se abre o mapa, mantendo a landing
    // page leve e rápida.
    loadComponent: () =>
      import('./map/map.component').then((m) => m.MapComponent),
  },
];
