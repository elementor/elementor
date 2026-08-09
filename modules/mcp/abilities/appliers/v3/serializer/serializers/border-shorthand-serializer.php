<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Formatters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Border_Shorthand_Converter}.
 * Combines `<prefix>_border` (style) + `<prefix>_width` (sides) + `<prefix>_color` back
 * into a single `border: <width> <style> <color>` declaration.
 */
class Border_Shorthand_Serializer extends Base_Property_Serializer {

	public function is_supported( array $entry, string $property, ?string $state ): bool {
		return isset( $entry['border_prefix'] );
	}

	public function emit( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		$prefix = (string) $entry['border_prefix'];
		$style = $settings[ $prefix . '_border' ] ?? null;
		if ( ! is_string( $style ) || '' === $style ) {
			return;
		}

		$width_value = V3_Value_Formatters::format( 'sides', $settings[ $prefix . '_width' ] ?? null );
		$color_value = V3_Value_Formatters::format( 'color', $settings[ $prefix . '_color' ] ?? null );

		$parts = [];
		if ( null !== $width_value ) {
			$parts[] = $width_value;
		}
		$parts[] = $style;
		if ( null !== $color_value ) {
			$parts[] = $color_value;
		}

		$blocks->push( self::BASE_BREAKPOINT, $state, 'border', implode( ' ', $parts ) );

		if ( empty( $entry['responsive'] ) ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix => $breakpoint ) {
			$responsive_width = V3_Value_Formatters::format( 'sides', $settings[ $prefix . '_width' . $suffix ] ?? null );
			if ( null === $responsive_width ) {
				continue;
			}
			$blocks->push( $breakpoint, $state, 'border-width', $responsive_width );
		}
	}
}
