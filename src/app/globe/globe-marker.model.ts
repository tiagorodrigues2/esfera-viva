/**
 * Modelos para entidades colocadas no globo.
 *
 * Ainda NÃO são usados na UI — existem para que, no futuro, se possam adicionar
 * pins/marcadores em coordenadas (lat/lon) com dados customizados associados
 * (ex.: lista de espécies de animais) sem mexer na lógica de inicialização do
 * globo. Ver `GlobeService.addMarker`.
 */

/** Dados arbitrários associados a um marcador (ex.: espécies). */
export type GlobeMarkerData = Record<string, unknown>;

/** Descreve um marcador a colocar no globo. */
export interface GlobeMarker<TData = GlobeMarkerData> {
  /** Identificador único (usado para atualizar/remover). */
  id: string;
  /** Latitude em graus (-90..90). */
  latitude: number;
  /** Longitude em graus (-180..180). */
  longitude: number;
  /** Altura em metros acima do elipsoide. Default: 0 (assente no terreno). */
  height?: number;
  /** Texto opcional a apresentar junto ao marcador. */
  label?: string;
  /** Dados customizados associados (ex.: espécies presentes neste local). */
  data?: TData;
}
