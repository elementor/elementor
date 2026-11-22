<?php

namespace Elementor\Modules\CompositeWidgets\Instance;

use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\CompositeWidgets\Definitions\Validation\Template_Rules;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The named elements (parts) of a widget template or instance.
 */
class Template_Parts {
	/**
	 * Calls `$visit( array &$element, string $part )` for every part, the element itself included.
	 * Slot content isn't part of the widget, so the walk doesn't go below a slot.
	 */
	public static function walk( array &$element, callable $visit ): void {
		$part = $element[ Widget_Markers::PART_KEY ] ?? null;

		if ( is_string( $part ) && '' !== $part ) {
			$visit( $element, $part );
		}

		if ( ! empty( $element[ Widget_Markers::SLOT_KEY ] ) || empty( $element['elements'] ) || ! is_array( $element['elements'] ) ) {
			return;
		}

		foreach ( array_keys( $element['elements'] ) as $index ) {
			self::walk( $element['elements'][ $index ], $visit );
		}
	}

	/**
	 * @return array<string, array{type: string, slot?: true}> Part name => its element type, and whether it's a slot.
	 */
	public static function describe( array $template ): array {
		$parts = [];

		self::walk( $template, function ( array &$element, string $part ) use ( &$parts ) {
			$parts[ $part ] = [ 'type' => self::get_element_type( $element ) ];

			if ( ! empty( $element[ Widget_Markers::SLOT_KEY ] ) ) {
				$parts[ $part ]['slot'] = true;
			}
		} );

		return $parts;
	}

	public static function get_element_type( array $element ): string {
		$type_key = Template_Rules::WIDGET_EL_TYPE === ( $element[ Template_Rules::EL_TYPE_KEY ] ?? null )
			? Template_Rules::WIDGET_TYPE_KEY
			: Template_Rules::EL_TYPE_KEY;

		return (string) ( $element[ $type_key ] ?? '' );
	}
}
