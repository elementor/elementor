<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Block_Accumulator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\V3_Property_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Choice_Values;
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

	const BASE_BREAKPOINT = Responsive_Key_Resolver::BASE_BREAKPOINT;

	protected function emit_setting_at_breakpoint(
		V3_Block_Accumulator $blocks,
		array $settings,
		string $property,
		?string $state,
		string $setting_key,
		string $resolver,
		string $breakpoint,
		array $value_map = []
	): void {
		if ( ! array_key_exists( $setting_key, $settings ) ) {
			return;
		}

		$css_value = Style_Control_Target::CHOICE_RESOLVER === $resolver
			? V3_Choice_Values::format( $value_map, $settings[ $setting_key ] )
			: V3_Value_Formatters::format( $resolver, $settings[ $setting_key ] );
		if ( null === $css_value ) {
			return;
		}

		$blocks->push( $breakpoint, $state, $property, $css_value );
	}
}
