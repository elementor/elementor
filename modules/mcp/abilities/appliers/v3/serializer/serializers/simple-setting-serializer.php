<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Inverse of {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Simple_Setting_Converter}.
 * Emits declarations for `setting` + `resolver` overrides (and their `_tablet`/`_mobile`
 * responsive variants when applicable).
 */
class Simple_Setting_Serializer extends Base_Property_Serializer {

	public function is_supported( array $entry, string $property, ?string $state ): bool {
		if ( isset( $entry['typography_prefix'] ) || isset( $entry['border_prefix'] ) || isset( $entry['box_shadow_prefix'] ) ) {
			return false;
		}

		return isset( $entry['setting'], $entry['resolver'] );
	}

	public function emit( V3_Block_Accumulator $blocks, array $settings, array $entry, string $property, ?string $state ): void {
		$setting_key = (string) $entry['setting'];
		$resolver = (string) $entry['resolver'];
		$responsive = ! empty( $entry['responsive'] );

		$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key, $resolver, self::BASE_BREAKPOINT );

		if ( ! $responsive ) {
			return;
		}

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix => $breakpoint ) {
			$this->emit_setting_at_breakpoint( $blocks, $settings, $property, $state, $setting_key . $suffix, $resolver, $breakpoint );
		}
	}
}
