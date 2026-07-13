/**
 * Widget/element types whose atomic props schema exposes a `link` prop.
 * A `link` sent to any other type is silently skipped (reported in `warnings`).
 *
 * Keep in sync with the PHP source of truth (elements registering
 * `Link_Prop_Type::make()`); the guard test
 * `tests/phpunit/elementor/modules/atomic-widgets/elements/test-link-prop-coverage.php`
 * fails if the two drift apart.
 */
export const LINKABLE_WIDGET_TYPES = [
	'e-button',
	'e-div-block',
	'e-flexbox',
	'e-grid',
	'e-heading',
	'e-image',
	'e-paragraph',
	'e-svg',
] as const;

export const LINKABLE_WIDGET_TYPES_LIST = LINKABLE_WIDGET_TYPES.join( ', ' );
