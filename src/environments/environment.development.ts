/**
 * Configuração de desenvolvimento (usada por `ng serve`).
 *
 * Substitui `environment.ts` em builds de desenvolvimento via `fileReplacements`
 * no angular.json. Coloca aqui a tua token do Cesium Ion para teres imagery de
 * satélite real + terreno. Se ficar vazia, o globo usa as tiles offline.
 */
export const environment = {
  production: false,
  /** Cesium Ion access token. Vazio => fallback offline. */
  cesiumIonToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4MjA5NGFkNy1mZTkyLTQxMTUtYWRjZi0xNzE4NDgyZGMxZmIiLCJpZCI6NDUwOTM4LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODI4NDMyNTh9.Kzmb_VRUlcEmFeVn3MuZIanEqB_wg3X_y6ZdC3FMMBg',
};
