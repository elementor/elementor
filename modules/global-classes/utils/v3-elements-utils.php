<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * V3-element counterpart of Atomic_Elements_Utils. V3 widgets do not carry an atomic
 * classes prop; instead, they store a space-separated list of CSS class names in the
 * `_css_classes` setting. Those names ARE the labels of V4 global classes when the MCP
 * class applier writes to a V3 wrapper — so a document scan must read them and resolve
 * them back to global-class ids so the corresponding rule files ship with the page.
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
