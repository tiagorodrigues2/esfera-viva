import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';

import { MapService } from './map.service';

/**
 * Componente standalone que renderiza o mapa 2D em ecrã inteiro.
 *
 * Fornece o contentor DOM e delega toda a lógica ao `MapService`. Arrastar para
 * mover, scroll para zoom (nativo do Leaflet).
 */
@Component({
  selector: 'app-map',
  template: `<div #mapContainer class="map"></div>`,
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        inset: 0;
        overflow: hidden;
      }

      .map {
        width: 100%;
        height: 100%;
        background: var(--ev-bg-2);
      }

      /* Afasta os controlos do topo para não ficarem sob a toolbar. */
      :host ::ng-deep .leaflet-top {
        top: var(--ev-toolbar-h);
      }

      /* Ícones de marcador da marca: sem a caixa branca default do Leaflet. */
      :host ::ng-deep .ev-marker {
        background: none;
        border: none;
        filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.45));
      }

      /* Controlos e atribuição em tom escuro, coerentes com a marca. */
      :host ::ng-deep .leaflet-bar a {
        background: rgba(17, 22, 15, 0.82);
        color: var(--ev-cream);
        border-bottom-color: var(--ev-line);
      }
      :host ::ng-deep .leaflet-bar a:hover {
        background: rgba(40, 51, 43, 0.92);
      }
      :host ::ng-deep .leaflet-control-attribution {
        background: rgba(17, 22, 15, 0.7);
        color: var(--ev-cream-dim);
      }
      :host ::ng-deep .leaflet-control-attribution a {
        color: var(--ev-green-bright);
      }
    `,
  ],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private readonly mapService = inject(MapService);

  private readonly container =
    viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  ngAfterViewInit(): void {
    this.mapService.initialize(this.container().nativeElement);
  }

  ngOnDestroy(): void {
    this.mapService.destroy();
  }
}
