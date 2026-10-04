<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Formatters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Box_Shadow_Prefix_Converter}.
 * Reassembles `<prefix>_box_shadow_type` (visibility toggle) + `<prefix>_box_shadow`
 * (shape) into `box-shadow: [inset ]<h> <v> <blur> <spread> <color>`.
 */
class Box_Shadow_Prefix_Serializer extends Base_Property_Serializer {

	const PIXEL_UNIT = 'px';

	public function is_supported( array $entry, string $property, ?string $state ): bool {
		return isset( $entry['box_shadow_prefix'] );
	}

	public function emit( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		$prefix = (string) $entry['box_shadow_prefix'];
		$type = $settings[ $prefix . '_box_shadow_type' ] ?? null;
		$shadow = $settings[ $prefix . '_box_shadow' ] ?? null;
		if ( 'yes' !== $type || ! is_array( $shadow ) ) {
			return;
		}

		$parts = [
			$this->format_length( $shadow['horizontal'] ?? 0 ),
			$this->format_length( $shadow['vertical'] ?? 0 ),
			$this->format_length( $shadow['blur'] ?? 0 ),
			$this->format_length( $shadow['spread'] ?? 0 ),
		];
		if ( isset( $shadow['color'] ) && '' !== $shadow['color'] ) {
			$parts[] = $shadow['color'];
		}
		if ( isset( $shadow['position'] ) && 'inset' === $shadow['position'] ) {
			array_unshift( $parts, 'inset' );
		}

		$blocks->push( self::BASE_BREAKPOINT, $state, 'box-shadow', implode( ' ', $parts ) );
	}

	/**
	 * The box-shadow control stores lengths as unitless pixel numbers.
	 *
	 * @param mixed $size
	 */
	private function format_length( $size ): string {
		$formatted = V3_Value_Formatters::format_size( $size );

		return is_numeric( $formatted ) ? $formatted . self::PIXEL_UNIT : $formatted;
	}
}
