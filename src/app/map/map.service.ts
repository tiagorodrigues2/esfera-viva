import { Injectable } from '@angular/core';
import * as L from 'leaflet';

import {
  MapFeatureData,
  MapMarker,
  MapZone,
  MarkerIcon,
} from './map-marker.model';

/**
 * Basemap escuro da Esri (Dark Gray Canvas) — gratuito, sem API key, e o tom
 * escuro combina com a marca. Duas camadas: a base (relevo/oceanos) e a de
 * referência (fronteiras + nomes de lugares), sobreposta.
 */
const BASEMAP_BASE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const BASEMAP_REFERENCE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}';
const BASEMAP_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, ' +
  'Garmin, &copy; OpenStreetMap contributors';
/** Zoom nativo máximo do Dark Gray Canvas. */
const BASEMAP_MAX_ZOOM = 16;

/** Verde vivo da marca (para o pin por defeito e zonas). */
const BRAND_GREEN = '#5fbd86';

/**
 * Gere o mapa 2D (Leaflet) e os elementos nele colocados. Separado do
 * `MapComponent`: o componente trata do DOM/Angular, o serviço trata do mapa.
 *
 * `providedIn: 'root'` => singleton (um único mapa na app).
 */
@Injectable({ providedIn: 'root' })
export class MapService {
  private map: L.Map | null = null;

  private readonly markers = new Map<string, L.Marker>();
  private readonly zones = new Map<string, L.Polygon>();
  private readonly featureData = new Map<string, unknown>();

  /** Cria o mapa dentro do contentor fornecido. */
  initialize(container: HTMLElement): L.Map {
    if (this.map) {
      return this.map;
    }

    const map = L.map(container, {
      center: [20, 0],
      zoom: 3,
      // Limita o zoom-out para o mapa nunca ficar minúsculo.
      minZoom: 2,
      maxZoom: BASEMAP_MAX_ZOOM,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true,
      // Impede arrastar para além das latitudes reais (mantém o horizontal livre).
      maxBounds: [
        [-85, -Infinity],
        [85, Infinity],
      ],
      maxBoundsViscosity: 1,
    });

    // Camada base (relevo escuro) + camada de referência (fronteiras/nomes).
    L.tileLayer(BASEMAP_BASE_URL, {
      maxZoom: BASEMAP_MAX_ZOOM,
      attribution: BASEMAP_ATTRIBUTION,
    }).addTo(map);
    L.tileLayer(BASEMAP_REFERENCE_URL, {
      maxZoom: BASEMAP_MAX_ZOOM,
    }).addTo(map);

    this.map = map;
    return map;
  }

  /** Acesso ao mapa Leaflet (null antes de `initialize`). */
  getMap(): L.Map | null {
    return this.map;
  }

  /** Recalcula o tamanho do mapa (chamar se o contentor mudar de tamanho). */
  refreshSize(): void {
    this.map?.invalidateSize();
  }

  // ---------------------------------------------------------------------------
  // Marcadores (coordenadas com ícones customizados).
  // ---------------------------------------------------------------------------

  /**
   * Adiciona (ou substitui) um marcador. Se `marker.icon` for omitido, usa o
   * pin da marca. Devolve o `L.Marker` criado.
   */
  addMarker<TData extends MapFeatureData = MapFeatureData>(
    marker: MapMarker<TData>,
  ): L.Marker {
    if (!this.map) {
      throw new Error('[MapService] addMarker chamado antes de initialize.');
    }

    this.removeMarker(marker.id);

    const leafletMarker = L.marker([marker.latitude, marker.longitude], {
      icon: this.buildIcon(marker.icon),
      title: marker.label,
    }).addTo(this.map);

    if (marker.label) {
      leafletMarker.bindTooltip(marker.label, { direction: 'top' });
    }

    this.markers.set(marker.id, leafletMarker);
    if (marker.data !== undefined) {
      this.featureData.set(marker.id, marker.data);
    }
    return leafletMarker;
  }

  /** Remove um marcador pelo id. Devolve true se existia. */
  removeMarker(id: string): boolean {
    const marker = this.markers.get(id);
    if (!marker) {
      return false;
    }
    marker.remove();
    this.markers.delete(id);
    this.featureData.delete(id);
    return true;
  }

  /** Remove todos os marcadores. */
  clearMarkers(): void {
    for (const marker of this.markers.values()) {
      marker.remove();
    }
    this.markers.clear();
  }

  // ---------------------------------------------------------------------------
  // Zonas (áreas delimitadas).
  // ---------------------------------------------------------------------------

  /** Adiciona (ou substitui) uma zona poligonal. Devolve o `L.Polygon`. */
  addZone<TData extends MapFeatureData = MapFeatureData>(
    zone: MapZone<TData>,
  ): L.Polygon {
    if (!this.map) {
      throw new Error('[MapService] addZone chamado antes de initialize.');
    }

    this.removeZone(zone.id);

    const color = zone.color ?? BRAND_GREEN;
    const polygon = L.polygon(
      zone.coordinates.map((c) => [c.lat, c.lng] as L.LatLngTuple),
      { color, weight: 2, fillColor: color, fillOpacity: 0.15 },
    ).addTo(this.map);

    if (zone.label) {
      polygon.bindTooltip(zone.label, { sticky: true });
    }

    this.zones.set(zone.id, polygon);
    if (zone.data !== undefined) {
      this.featureData.set(zone.id, zone.data);
    }
    return polygon;
  }

  /** Remove uma zona pelo id. Devolve true se existia. */
  removeZone(id: string): boolean {
    const zone = this.zones.get(id);
    if (!zone) {
      return false;
    }
    zone.remove();
    this.zones.delete(id);
    this.featureData.delete(id);
    return true;
  }

  /** Remove todas as zonas. */
  clearZones(): void {
    for (const zone of this.zones.values()) {
      zone.remove();
    }
    this.zones.clear();
  }

  /** Recupera os dados customizados associados a um marcador ou zona. */
  getFeatureData<TData extends MapFeatureData = MapFeatureData>(
    id: string,
  ): TData | null {
    return (this.featureData.get(id) as TData) ?? null;
  }

  /** Destrói o mapa e liberta recursos. Chamar no `ngOnDestroy`. */
  destroy(): void {
    this.clearMarkers();
    this.clearZones();
    this.map?.remove();
    this.map = null;
  }

  // ---------------------------------------------------------------------------
  // Interno.
  // ---------------------------------------------------------------------------

  /** Constrói o ícone Leaflet a partir do `MarkerIcon` (ou o pin da marca). */
  private buildIcon(icon?: MarkerIcon): L.DivIcon {
    const size = icon?.size ?? [30, 40];
    const anchor = icon?.anchor ?? [size[0] / 2, size[1]];
    const html = icon?.html ?? this.defaultPinHtml();

    return L.divIcon({
      html,
      className: `ev-marker ${icon?.className ?? ''}`.trim(),
      iconSize: size,
      iconAnchor: anchor,
    });
  }

  /** Pin em forma de gota, nas cores da marca. */
  private defaultPinHtml(): string {
    return `
      <svg viewBox="0 0 30 40" width="30" height="40" fill="none"
           xmlns="http://www.w3.org/2000/svg">
        <path d="M15 39C15 39 27 24.5 27 15A12 12 0 1 0 3 15C3 24.5 15 39 15 39Z"
              fill="${BRAND_GREEN}" stroke="#f7f5ee" stroke-width="2"/>
        <circle cx="15" cy="15" r="4.5" fill="#11160f"/>
      </svg>`;
  }
}
