/**
 * Show AI gate for all Angie entry points (V3 and V4).
 * ED-26336 will replace this with the Show AI user setting.
 * Package load is already gated by e_angie_in_panels.
 */
export function isAngieEntryPointsEnabled(): boolean {
	return Boolean( window.elementorV2?.editorAngie?.openAngie );
}
