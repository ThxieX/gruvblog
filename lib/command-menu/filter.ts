import commandScore from 'command-score'

/**
 * Minimum score (0–1) an item must reach to be considered a match.
 *
 * Tuning notes:
 * - command-score returns 1 for a perfect prefix match, ~0.4 for a typical
 *   in-word substring hit, and very small values (<0.05) for scattered
 *   subsequence matches.
 * - 0.15 sits in the sweet spot: it preserves typo tolerance ("elastci" ->
 *   "Elasticsearch") while filtering garbage queries ("elasticssdasd").
 * - Bump this up if false positives appear; bump down if legitimate typos
 *   stop matching.
 */
export const MIN_SCORE = 0.15

/**
 * Weight applied to keyword (secondary field) matches.
 *
 * A perfect hit on a keyword like a tag or excerpt scores 0.6 instead of 1.0,
 * ensuring a partial title hit still ranks above a perfect keyword hit.
 */
export const KEYWORD_WEIGHT = 0.6

/**
 * cmdk-compatible filter that scores a command item by its primary `value`
 * (e.g. a post title) and optional `keywords` (e.g. tags, category, excerpt).
 *
 * The function is a drop-in replacement for cmdk's default filter — pass it as
 * the `filter` prop on `<Command>`. Returning 0 hides the item from results.
 *
 * @example
 * scoreItem('Elasticsearch 初探', 'elastic') // 1.0  (substring hit on title)
 * scoreItem('Docker 镜像仓库', 'elastic', ['容器', '镜像']) // 0    (no match)
 * scoreItem('RAG Improvements', 'rag', ['retrieval-augmented-generation']) // ~1.0
 */
export function scoreItem(
  value: string,
  search: string,
  keywords?: string[],
): number {
  if (!search) return 1

  let best = commandScore(value, search)

  if (keywords) {
    for (const keyword of keywords) {
      const score = commandScore(keyword, search) * KEYWORD_WEIGHT
      if (score > best) best = score
    }
  }

  return best < MIN_SCORE ? 0 : best
}
