/**
 * v1 route used with `routeOpenEvent` + `openRoute` so “wait until editor is ready” matches what we navigate to.
 *
 * **Design system:** Both URL deep-link and window-event entry use this single route so the listener always
 * corresponds to `openRoute( DESIGN_SYSTEM_V1_READY_ROUTE )` (no mismatch between files).
 *
 * **Compared to legacy packages:**
 * - `editor-variables` / `editor-global-classes` **URL** openers use `panel/elements` for the same “init complete” idea.
 * - `editor-variables` **event** opener still uses `panel/elements/categories` so `openRoute` and `routeOpenEvent`
 *   stay paired there; we intentionally align design-system on `panel/elements` for one shared constant.
 */
export const DESIGN_SYSTEM_V1_READY_ROUTE = 'panel/elements';
