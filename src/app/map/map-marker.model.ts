/**
 * Modelos para elementos colocados no mapa.
 *
 * Preparam o passo seguinte: marcar coordenadas com ícones customizados e
 * delimitar zonas, cada um com dados associados (ex.: lista de espécies).
 * Ver `MapService.addMarker` / `MapService.addZone`.
 */

/** Dados arbitrários associados a um elemento do mapa (ex.: espécies). */
export type MapFeatureData = Record<string, unknown>;

/** Um par latitude/longitude em graus. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Aparência do ícone de um marcador. */
export interface MarkerIcon {
  /**
   * HTML/SVG do ícone (usado num `L.divIcon`). Permite ícones totalmente
   * customizados sem imagens externas. Se omitido, usa-se o pin da marca.
   */
  html?: string;
  /** Tamanho do ícone em pixéis `[largura, altura]`. Default: `[32, 40]`. */
  size?: [number, number];
  /**
   * Ponto do ícone que assenta na coordenada `[x, y]`. Default: base central,
   * i.e. `[size.w / 2, size.h]`.
   */
  anchor?: [number, number];
  /** Classe(s) CSS extra a aplicar ao ícone. */
  className?: string;
}

/** Descreve um marcador a colocar numa coordenada. */
export interface MapMarker<TData = MapFeatureData> {
  /** Identificador único (usado para atualizar/remover). */
  id: string;
  latitude: number;
  longitude: number;
  /** Texto do tooltip/popup opcional. */
  label?: string;
  /** Ícone customizado. Se omitido, usa o pin da marca. */
  icon?: MarkerIcon;
  /** Dados customizados associados (ex.: espécies deste local). */
  data?: TData;
}

/** Descreve uma zona (área) a delimitar no mapa. */
export interface MapZone<TData = MapFeatureData> {
  /** Identificador único. */
  id: string;
  /** Vértices do polígono (anel exterior). */
  coordinates: LatLng[];
  /** Texto do tooltip/popup opcional. */
  label?: string;
  /** Cor do contorno/preenchimento (CSS). Default: verde da marca. */
  color?: string;
  /** Dados customizados associados. */
  data?: TData;
}
