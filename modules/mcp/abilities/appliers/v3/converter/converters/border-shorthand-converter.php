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
 * Handles `border_prefix` overrides: explodes `border: <width> <style> <color>` into
 * three prefixed V3 settings via V3_Value_Resolvers::resolve_border_shorthand.
 */
class Border_Shorthand_Converter implements V3_Property_Converter {

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );

		return null !== $override && isset( $override['border_prefix'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );
		if ( null === $override || ! isset( $override['border_prefix'] ) ) {
			return false;
		}

		$patch = V3_Value_Resolvers::resolve_border_shorthand( (string) $rule['value'], (string) $override['border_prefix'] );
		if ( null === $patch ) {
			return false;
		}

		$ctx->merge_patch( $patch );

		return true;
	}
}
