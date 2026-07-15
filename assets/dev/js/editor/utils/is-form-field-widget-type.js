/**
 * Returns whether a `widgetType` value belongs to the Atomic Form family of field widgets
 * (e.g. `e-form-input`, `e-form-label`, `e-form-checkbox`, `e-form-submit-button`, ...).
 *
 * A dedicated helper — instead of an inline `startsWith` call — because the value can legitimately
 * be `undefined` for atomic elements without a widget type, and can be a prop-shaped object
 * (`{ $$type, value }`) or other non-string when loading legacy documents that predate the current
 * atomic schema. Calling `.startsWith` on such values throws `r.startsWith is not a function` and
 * crashes the browser tab (ED-24909).
 *
 * @param {unknown} widgetType
 * @return {boolean}
 */
export default function isFormFieldWidgetType( widgetType ) {
	return 'string' === typeof widgetType && widgetType.startsWith( 'e-form-' );
}
