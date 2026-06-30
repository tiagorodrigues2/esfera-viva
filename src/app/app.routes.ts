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
    // Lazy load: o Cesium (volumoso) só carrega quando se abre o globo,
    // mantendo a landing page leve e rápida.
    loadComponent: () =>
      import('./globe/globe.component').then((m) => m.GlobeComponent),
  },
];
