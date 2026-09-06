<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * V3-element counterpart of `Atomic_Elements_Utils`.
 *
 * What it solves — reviewer question:
 *   V3 widgets have no atomic `classes` prop. The wrapper stores a raw
 *   space-separated string in the `_css_classes` setting. That's the only shape
 *   the V3 data model exposes for global-class assignment on the wrapper.
 *   Without this scan, `Global_Classes_Relations` only sees V4 elements and
 *   `Atomic_Global_Styles` therefore never enqueues the class stylesheet for
 *   a page whose only reference to a global class is on a V3 wrapper. Result:
 *   the DOM shows the class name but no CSS ships → the class silently no-ops.
 *
 * How it bridges the gap:
 *   - Wrapper-level (this utility): the class-applier writes global class LABELS
 *     to `_css_classes`; we read those labels back on document scan and resolve
 *     them to global-class ids, so the enqueue path picks them up.
 *   - Inner-element level (NOT here): V3 inner elements have no `_css_classes`
 *     analogue on their sub-settings. That's why `V3_Node_Bridge::apply_classes_to_target()`
 *     consults per-widget maps under `modules/mcp/abilities/appliers/v3/maps/`:
 *     each alias may declare `class_setting` pointing at the concrete V3 setting
 *     that receives the class labels (e.g. `search_field_css_classes`). This
 *     utility is intentionally wrapper-scoped and does not attempt to walk into
 *     inner elements — the bridge on write side already resolves inner-element
 *     class settings, and those live in dedicated V3 settings that the same
 *     `_css_classes`-style read will not find.
 */
class V3_Elements_Utils {

	const V3_CSS_CLASSES_SETTING = '_css_classes';

	/**
	 * Returns the raw class-name tokens found in the V3 `_css_classes` setting of the
	 * given element data. Returns an empty array when the element is atomic (V4) or when
	 * the setting is absent / empty.
	 *
	 * @param array<string, mixed> $element_data Single element data node.
	 * @return string[]
	 */
	public static function collect_class_labels_from_v3_element( array $element_data ): array {
		$element_type = Atomic_Elements_Utils::get_element_type( $element_data );
		$element_instance = Atomic_Elements_Utils::get_element_instance( $element_type );

		if ( Atomic_Utils::is_atomic( $element_instance ) ) {
			return [];
		}

		$raw = $element_data['settings'][ self::V3_CSS_CLASSES_SETTING ] ?? '';

		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return [];
		}

		$tokens = preg_split( '/\s+/', trim( $raw ) );

		if ( ! is_array( $tokens ) ) {
			return [];
		}

		return array_values( array_filter( $tokens, static fn( $token ) => is_string( $token ) && '' !== $token ) );
	}
}
