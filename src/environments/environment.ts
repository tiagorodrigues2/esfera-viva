/**
 * Configuração de produção (default).
 *
 * A token do Cesium Ion é a mesma em todos os ambientes (ver
 * `environment.development.ts`). Se ficar vazia, o GlobeService recorre
 * automaticamente às tiles offline (NaturalEarthII) que acompanham o Cesium.
 */
export const environment = {
  production: true,
  /** Cesium Ion access token. Vazio => fallback offline. */
  cesiumIonToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MjA5NGFkNy1mZTkyLTQxMTUtYWRjZi0xNzE4NDgyZGMxZmIiLCJpZCI6NDUwOTM4LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODI4NDMyNTh9.Kzmb_VRUlcEmFeVn3MuZIanEqB_wg3X_y6ZdC3FMMBg',
};
