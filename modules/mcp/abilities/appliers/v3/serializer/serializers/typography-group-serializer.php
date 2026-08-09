<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Typography_Group_Converter}.
 * Emits one CSS property from a typography group (font-family, font-size, etc.) by
 * reading its matching `<prefix>_<suffix>` V3 setting.
 */
class Typography_Group_Serializer extends Base_Property_Serializer {

	const TYPOGRAPHY_PROPERTIES = [
		'font-family' => 'font_family',
		'font-weight' => 'font_weight',
		'font-style' => 'font_style',
		'text-transform' => 'text_transform',
		'text-decoration' => 'text_decoration',
		'font-size' => 'font_size',
		'line-height' => 'line_height',
		'letter-spacing' => 'letter_spacing',
		'word-spacing' => 'word_spacing',
	];

	const DIMENSION_PROPERTIES = [ 'font-size', 'line-height', 'letter-spacing', 'word-spacing' ];

	public function is_supported( array $entry, string $property, ?string $state ): bool {
		return isset( $entry['typography_prefix'] ) && isset( self::TYPOGRAPHY_PROPERTIES[ $property ] );
	}

	public function emit( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		$suffix = self::TYPOGRAPHY_PROPERTIES[ $property ] ?? null;
		if ( null === $suffix ) {
			return;
		}

		$prefix = (string) $entry['typography_prefix'];
		$resolver = in_array( $property, self::DIMENSION_PROPERTIES, true ) ? 'dimension' : 'text';
		$setting_key = $prefix . '_' . $suffix;

		$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key, $resolver, self::BASE_BREAKPOINT );

		if ( empty( $entry['responsive'] ) ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $sfx => $breakpoint ) {
			$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key . $sfx, $resolver, $breakpoint );
		}
	}
}
