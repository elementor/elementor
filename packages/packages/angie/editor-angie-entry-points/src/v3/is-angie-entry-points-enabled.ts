/**
 * Show AI gate for all Angie entry points (V3 and V4).
 * Stub until ED-26336: always enabled. Package load is already gated by
 * e_angie_in_panels; do not add a second experiment check here.
 * ED-26336 owns this function — replace the body with the user setting check.
 */
export function isAngieEntryPointsEnabled(): boolean {
	return true;
}
