import { Injectable } from '@angular/core';
import {
  Cartesian3,
  Color,
  CustomDataSource,
  DistanceDisplayCondition,
  Entity,
  GeoJsonDataSource,
  Ion,
  ImageryLayer,
  LabelStyle,
  NearFarScalar,
  Terrain,
  TileMapServiceImageryProvider,
  VerticalOrigin,
  Viewer,
  buildModuleUrl,
} from 'cesium';

import { environment } from '../../environments/environment';
import { GlobeMarker, GlobeMarkerData } from './globe-marker.model';

/**
 * Gere o ciclo de vida do globo Cesium e (no futuro) as entidades nele
 * colocadas. Está deliberadamente separado do `GlobeComponent`: o componente
 * trata do DOM/Angular, o serviço trata do Cesium.
 *
 * `providedIn: 'root'` torna-o num singleton — há um único globo na app.
 */
/** Caminho (servido de `public/`) para as linhas de fronteira entre países. */
const COUNTRY_BORDERS_URL = '/data/country-borders.geojson';

/** Caminho (servido de `public/`) para os rótulos (nomes) dos países. */
const COUNTRY_LABELS_URL = '/data/country-labels.json';

/** Um rótulo de país: nome em PT + ponto de ancoragem + importância. */
interface CountryLabel {
  name: string;
  lon: number;
  lat: number;
  /** LABELRANK do Natural Earth: menor = país mais proeminente. */
  rank: number;
}

/**
 * Altura (m) a que os rótulos flutuam acima do elipsoide. Acima de qualquer
 * montanha (Evereste ~8,8 km), por isso o terreno em frente não recorta as
 * letras; mas o corpo do globo continua a ocultar os rótulos do lado oposto.
 */
const LABEL_HEIGHT_METERS = 25_000;

/**
 * Distância máxima (m) a que a câmara pode afastar-se da superfície. Limita o
 * zoom-out para o globo nunca ficar pequeno no ecrã. ~13.000 km mantém o globo
 * a preencher a maior parte da viewport.
 */
const MAX_CAMERA_DISTANCE_METERS = 13_000_000;

@Injectable({ providedIn: 'root' })
export class GlobeService {
  private viewer: Viewer | null = null;

  /** Marcadores ativos, indexados por id (preparação para uso futuro). */
  private readonly markers = new Map<string, Entity>();

  /** Camada de dados com as fronteiras entre países (null até ser carregada). */
  private bordersDataSource: GeoJsonDataSource | null = null;

  /** Camada de dados com os nomes dos países (null até ser carregada). */
  private labelsDataSource: CustomDataSource | null = null;

  /** True se uma token do Cesium Ion estiver configurada. */
  private get hasIonToken(): boolean {
    return environment.cesiumIonToken.trim().length > 0;
  }

  /**
   * Cria o `Viewer` do Cesium dentro do contentor fornecido.
   *
   * Com token Ion: imagery de satélite + terreno mundial reais (carregamento
   * progressivo de detalhe por tiles, à la Google Earth).
   * Sem token: fallback offline com as tiles NaturalEarthII que acompanham o
   * Cesium, garantindo que o globo renderiza sempre.
   */
  initialize(container: HTMLElement): Viewer {
    if (this.viewer) {
      return this.viewer;
    }

    if (this.hasIonToken) {
      Ion.defaultAccessToken = environment.cesiumIonToken;
    } else {
      console.warn(
        '[GlobeService] Cesium Ion token não configurada — a usar tiles ' +
          'offline (NaturalEarthII). Define environment.cesiumIonToken para ' +
          'imagery de satélite e terreno reais.',
      );
    }

    const options: Viewer.ConstructorOptions = {
      // Vista limpa, estilo Google Earth: desligamos os widgets do Cesium.
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
    };

    // Sem token usamos as tiles offline como camada base.
    if (!this.hasIonToken) {
      options.baseLayer = ImageryLayer.fromProviderAsync(
        TileMapServiceImageryProvider.fromUrl(
          buildModuleUrl('Assets/Textures/NaturalEarthII'),
        ),
        {},
      );
    }

    const viewer = new Viewer(container, options);

    // --- Qualidade de render (nitidez do texto e da imagery) ------------------
    // Renderiza à resolução nativa do ecrã (HiDPI) em vez da resolução CSS.
    viewer.useBrowserRecommendedResolution = false;
    viewer.resolutionScale = window.devicePixelRatio || 1;
    // MSAA dá anti-aliasing de qualidade nas arestas SEM desfocar texturas/texto,
    // ao contrário do FXAA (que borra o ecrã inteiro). Desligamos o FXAA.
    viewer.scene.msaaSamples = 4;
    viewer.scene.postProcessStages.fxaa.enabled = false;

    // Limita o zoom-out para o globo nunca ficar pequeno.
    viewer.scene.screenSpaceCameraController.maximumZoomDistance =
      MAX_CAMERA_DISTANCE_METERS;

    // Com token, ativamos o terreno mundial (relevo real, progressivo).
    if (this.hasIonToken) {
      viewer.scene.setTerrain(Terrain.fromWorldTerrain());
    }

    // Esconde o crédito/marca de água por baixo do globo para uma vista limpa.
    viewer.cesiumWidget.creditContainer.classList.add('globe-credits');

    // Vista global inicial: começa já no limite máximo de zoom-out.
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(0, 0, MAX_CAMERA_DISTANCE_METERS),
    });

    this.viewer = viewer;

    // Hook de depuração (apenas em dev): permite inspecionar o globo na consola.
    if (!environment.production) {
      (globalThis as unknown as { __globe?: GlobeService }).__globe = this;
    }

    // Fronteiras entre países por cima da imagery (vetorial, nítida a qualquer
    // zoom). Carrega de forma assíncrona — não bloqueia a renderização.
    void this.loadCountryBorders().catch((err) =>
      console.error('[GlobeService] Falha ao carregar fronteiras:', err),
    );

    // Nomes dos países (também assíncrono).
    void this.loadCountryLabels().catch((err) =>
      console.error('[GlobeService] Falha ao carregar nomes:', err),
    );

    return viewer;
  }

  /** Acesso ao `Viewer` (null antes de `initialize`). */
  getViewer(): Viewer | null {
    return this.viewer;
  }

  // ---------------------------------------------------------------------------
  // Fronteiras entre países (linhas vetoriais GeoJSON, clampadas ao terreno).
  // ---------------------------------------------------------------------------

  /**
   * Carrega e apresenta as linhas de fronteira entre países. Idempotente: se já
   * estiverem carregadas, apenas garante que ficam visíveis.
   */
  async loadCountryBorders(): Promise<void> {
    if (!this.viewer) {
      throw new Error(
        '[GlobeService] loadCountryBorders chamado antes de initialize.',
      );
    }

    if (this.bordersDataSource) {
      this.bordersDataSource.show = true;
      return;
    }

    const dataSource = await GeoJsonDataSource.load(COUNTRY_BORDERS_URL, {
      stroke: Color.WHITE.withAlpha(0.6),
      strokeWidth: 2,
      // Faz as linhas seguirem a superfície/relevo do globo.
      clampToGround: true,
    });

    await this.viewer.dataSources.add(dataSource);
    this.bordersDataSource = dataSource;
  }

  /** Mostra/esconde as fronteiras (sem as descarregar). */
  setCountryBordersVisible(visible: boolean): void {
    if (this.bordersDataSource) {
      this.bordersDataSource.show = visible;
    }
  }

  // ---------------------------------------------------------------------------
  // Nomes dos países (rótulos de texto clampados ao terreno).
  // ---------------------------------------------------------------------------

  /**
   * Carrega e apresenta os nomes dos países (em PT). Cada nome só aparece a
   * partir de uma certa distância da câmara consoante a sua proeminência
   * (LABELRANK): países grandes veem-se de longe, os pequenos só ao aproximar —
   * evitando sobreposição de texto na vista global. Idempotente.
   */
  async loadCountryLabels(): Promise<void> {
    if (!this.viewer) {
      throw new Error(
        '[GlobeService] loadCountryLabels chamado antes de initialize.',
      );
    }

    if (this.labelsDataSource) {
      this.labelsDataSource.show = true;
      return;
    }

    const response = await fetch(COUNTRY_LABELS_URL);
    const countries = (await response.json()) as CountryLabel[];

    const dataSource = new CustomDataSource('country-labels');

    for (const country of countries) {
      // Distância máxima a que o rótulo é visível, derivada do rank: rank baixo
      // (proeminente) => visível de muito longe; rank alto => só de perto.
      const maxDistance = 6.0e7 / Math.max(1, country.rank);

      dataSource.entities.add({
        // Flutua acima do terreno: evita o recorte das letras pelo relevo em
        // frente, mas mantém o depth-test (o globo oculta o lado de trás).
        position: Cartesian3.fromDegrees(
          country.lon,
          country.lat,
          LABEL_HEIGHT_METERS,
        ),
        label: {
          text: country.name,
          font: '500 14px "Segoe UI", Roboto, Arial, sans-serif',
          fillColor: Color.WHITE,
          outlineColor: Color.BLACK.withAlpha(0.9),
          outlineWidth: 2,
          style: LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: VerticalOrigin.CENTER,
          // Mantém o texto a 1:1 (sem downscale, que tornava as bordas moles);
          // o declutter por distância fica só a cargo do distanceDisplayCondition.
          // Fade suave em vez de "pop" ao surgir/desaparecer.
          translucencyByDistance: new NearFarScalar(
            maxDistance * 0.7,
            1.0,
            maxDistance,
            0.0,
          ),
          // Esconde rótulos pouco proeminentes na vista global.
          distanceDisplayCondition: new DistanceDisplayCondition(
            0.0,
            maxDistance,
          ),
        },
      });
    }

    this.viewer.dataSources.add(dataSource);
    this.labelsDataSource = dataSource;
  }

  /** Mostra/esconde os nomes dos países (sem os descarregar). */
  setCountryLabelsVisible(visible: boolean): void {
    if (this.labelsDataSource) {
      this.labelsDataSource.show = visible;
    }
  }

  // ---------------------------------------------------------------------------
  // API de entidades — preparada para uso futuro (pins/marcadores + dados).
  // Ainda não é chamada por nenhuma UI; existe para que adicionar marcadores
  // mais tarde seja trivial e não toque na inicialização acima.
  // ---------------------------------------------------------------------------

  /**
   * Adiciona (ou substitui) um marcador numa coordenada lat/lon. Os dados
   * customizados ficam guardados em `entity.properties` para recuperação
   * posterior (ex.: ao clicar). Devolve a `Entity` criada.
   */
  addMarker<TData extends GlobeMarkerData = GlobeMarkerData>(
    marker: GlobeMarker<TData>,
  ): Entity {
    if (!this.viewer) {
      throw new Error('[GlobeService] addMarker chamado antes de initialize.');
    }

    this.removeMarker(marker.id);

    const entity = this.viewer.entities.add({
      id: marker.id,
      position: Cartesian3.fromDegrees(
        marker.longitude,
        marker.latitude,
        marker.height ?? 0,
      ),
      point: {
        pixelSize: 12,
        color: Color.fromCssColorString('#22d3ee'),
        outlineColor: Color.WHITE,
        outlineWidth: 2,
      },
      label: marker.label
        ? { text: marker.label, pixelOffset: new Cartesian3(0, -20, 0) }
        : undefined,
      properties: { data: marker.data ?? null },
    });

    this.markers.set(marker.id, entity);
    return entity;
  }

  /** Remove um marcador pelo id. Devolve true se existia. */
  removeMarker(id: string): boolean {
    const entity = this.markers.get(id);
    if (!entity || !this.viewer) {
      return false;
    }
    this.viewer.entities.remove(entity);
    this.markers.delete(id);
    return true;
  }

  /** Remove todos os marcadores. */
  clearMarkers(): void {
    if (!this.viewer) {
      return;
    }
    for (const entity of this.markers.values()) {
      this.viewer.entities.remove(entity);
    }
    this.markers.clear();
  }

  /** Recupera os dados customizados associados a um marcador. */
  getMarkerData<TData extends GlobeMarkerData = GlobeMarkerData>(
    id: string,
  ): TData | null {
    const entity = this.markers.get(id);
    const properties = entity?.properties as unknown as
      | { data?: unknown }
      | undefined;
    return (properties?.data as TData) ?? null;
  }

  /** Destrói o globo e liberta recursos. Chamar no `ngOnDestroy`. */
  destroy(): void {
    this.clearMarkers();
    if (this.viewer && !this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
    this.bordersDataSource = null;
    this.labelsDataSource = null;
    this.viewer = null;
  }
}
