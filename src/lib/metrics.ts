/**
 * Helpers de conversion des métriques de satisfaction.
 *
 * CONTRAT COMMUN: `score_sentiment` est stocké côté backend sur l'intervalle [-1, 1]
 *   -1 = très négatif, 0 = neutre, 1 = très positif.
 * Ces helpers centralisent la conversion vers les échelles d'affichage pour garantir
 * la cohérence entre toutes les pages (Analytics, Vue d'ensemble, Dashboard…).
 */

/** Borne une valeur dans [-1, 1]. */
function clampScore(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null;
  return Math.min(Math.max(score, -1), 1);
}

/** Convertit un score_sentiment [-1, 1] en pourcentage de satisfaction [0, 100]. */
export function scoreSentimentToPercent(score: number | null | undefined): number {
  const clamped = clampScore(score);
  if (clamped === null) return 0;
  return ((clamped + 1) / 2) * 100;
}

/** Convertit un score_sentiment [-1, 1] en note sur 5 [0, 5]. */
export function scoreSentimentToScale5(score: number | null | undefined): number {
  const clamped = clampScore(score);
  if (clamped === null) return 0;
  return ((clamped + 1) / 2) * 5;
}
