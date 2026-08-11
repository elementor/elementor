<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Resolvers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fallback converter: uses V3_Style_Settings_Index auto-discovered mappings when no
 * registry override matches. Registered last.
 *
 * Note the responsive rule differs from `Simple_Setting_Converter`: the generic index
 * does not carry an explicit `responsive` flag, so any non-desktop breakpoint requires
 * the suffixed control to exist — otherwise the write is dropped.
 */
class Generic_Index_Converter implements V3_Property_Converter {

	const BASE_BREAKPOINT = Responsive_Key_Resolver::BASE_BREAKPOINT;

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool {
		return null !== $meta->get_generic_rule( $rule['property'], $rule['state'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$generic_rule = $meta->get_generic_rule( $rule['property'], $rule['state'] );
		if ( null === $generic_rule ) {
			return false;
		}

		$resolved = V3_Value_Resolvers::resolve( (string) $generic_rule['resolver'], (string) $rule['value'] );
		if ( null === $resolved ) {
			return false;
		}

		$setting = (string) $generic_rule['setting'];
		$breakpoint = (string) $rule['breakpoint'];

		if ( self::BASE_BREAKPOINT !== $breakpoint ) {
			$suffixed = $setting . '_' . $breakpoint;
			if ( ! $meta->has_control( $suffixed ) ) {
				return false;
			}
			$setting = $suffixed;
		}

		$ctx->merge_patch( [ $setting => $resolved ] );

		return true;
	}
}
