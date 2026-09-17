<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Resolvers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles `box_shadow_prefix` overrides: writes `<prefix>_box_shadow_type` (visibility
 * toggle) + `<prefix>_box_shadow` (parsed shape) as a pair.
 */
class Box_Shadow_Prefix_Converter implements V3_Property_Converter {

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );

		return null !== $override && isset( $override['box_shadow_prefix'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );
		if ( null === $override || ! isset( $override['box_shadow_prefix'] ) ) {
			return false;
		}

		$resolved = V3_Value_Resolvers::resolve_box_shadow( (string) $rule['value'] );
		if ( null === $resolved ) {
			return false;
		}

		$prefix = (string) $override['box_shadow_prefix'];
		$ctx->merge_patch( [
			$prefix . '_box_shadow_type' => $resolved['box_shadow_type'],
			$prefix . '_box_shadow' => $resolved['box_shadow'],
		] );

		return true;
	}
}
