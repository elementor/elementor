<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Formatters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Common helpers for concrete serializers: responsive-suffix walking and
 * setting-key -> CSS emission via {@see V3_Value_Formatters}.
 */
abstract class Base_Property_Serializer implements V3_Property_Serializer {

	const RESPONSIVE_SUFFIXES = [
		'_tablet' => 'tablet',
		'_mobile' => 'mobile',
	];

	const BASE_BREAKPOINT = 'desktop';

	protected function emit_setting_at_breakpoint(
		V3_Block_Accumulator $blocks,
		array $settings,
		string $property,
		?string $state,
		string $setting_key,
		string $resolver,
		string $breakpoint
	): void {
		if ( ! array_key_exists( $setting_key, $settings ) ) {
			return;
		}

		$css_value = V3_Value_Formatters::format( $resolver, $settings[ $setting_key ] );
		if ( null === $css_value ) {
			return;
		}

		$blocks->push( $breakpoint, $state, $property, $css_value );
	}
}
