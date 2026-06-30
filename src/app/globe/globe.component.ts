import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  viewChild,
} from '@angular/core';

import { GlobeService } from './globe.service';

/**
 * Componente standalone que renderiza o globo 3D em ecrã inteiro.
 *
 * Limita-se a fornecer o contentor DOM e a delegar toda a lógica do Cesium ao
 * `GlobeService`. Drag para rodar e scroll para zoom são comportamentos nativos
 * do Cesium; o detalhe das texturas carrega progressivamente via tiles.
 */
@Component({
  selector: 'app-globe',
  template: `<div #globeContainer class="globe"></div>`,
  styles: [
    `
      :host {
        display: block;
        position: fixed;
        inset: 0;
        overflow: hidden;
      }

      .globe {
        width: 100%;
        height: 100%;
      }

      /* Crédito do Cesium discreto, no canto inferior. */
      :host ::ng-deep .globe-credits {
        position: absolute;
        bottom: 4px;
        left: 6px;
        color: rgba(255, 255, 255, 0.55);
        font-size: 11px;
      }
    `,
  ],
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  private readonly globe = inject(GlobeService);

  private readonly container =
    viewChild.required<ElementRef<HTMLDivElement>>('globeContainer');

  ngAfterViewInit(): void {
    this.globe.initialize(this.container().nativeElement);
  }

  ngOnDestroy(): void {
    this.globe.destroy();
  }
}
