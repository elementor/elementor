<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles `typography_prefix` overrides: buckets declarations by (breakpoint, state, prefix)
 * for a deferred group expansion via V3_Value_Resolvers::resolve_typography_group.
 */
class Typography_Group_Converter implements V3_Property_Converter {

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );

		return null !== $override && isset( $override['typography_prefix'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );
		if ( null === $override || ! isset( $override['typography_prefix'] ) ) {
			return false;
		}

		$ctx->add_typography_declaration(
			(string) $override['typography_prefix'],
			(string) $rule['breakpoint'],
			$rule['state'],
			! empty( $override['responsive'] ),
			(string) $rule['property'],
			(string) $rule['value']
		);

		return true;
	}
}
