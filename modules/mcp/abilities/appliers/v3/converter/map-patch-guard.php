<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Runs the resolved-patch validator when the override was produced from a compiled
 * V3 widget map (see {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Overrides_Builder}).
 * Returns false when the patch must be dropped atomically; emits a structured warning
 * on the shared conversion context in that case.
 */
class Map_Patch_Guard {

	public static function accept( V3_Conversion_Context $ctx, array $override, array $rule, array $patch ): bool {
		$descriptor = $override['_map_descriptor'] ?? null;

		if ( ! is_array( $descriptor ) ) {
			return true;
		}

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, $patch );

		if ( $result['valid'] ) {
			return true;
		}

		$property = (string) ( $rule['property'] ?? '' );

		$ctx->warn(
			sprintf(
				/* translators: %s: CSS property name */
				__( 'CSS property %s is not supported by this Elementor widget and was skipped.', 'elementor' ),
				$property
			)
		);

		return false;
	}
}
