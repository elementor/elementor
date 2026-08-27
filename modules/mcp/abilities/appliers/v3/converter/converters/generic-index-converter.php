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
 */
class Generic_Index_Converter implements V3_Property_Converter {

	private Responsive_Key_Resolver $responsive_resolver;

	public function __construct( Responsive_Key_Resolver $responsive_resolver ) {
		$this->responsive_resolver = $responsive_resolver;
	}

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

		$setting = $this->responsive_resolver->resolve(
			(string) $generic_rule['setting'],
			(string) $rule['breakpoint'],
			! empty( $generic_rule['responsive'] ),
			$meta
		);

		if ( null === $setting ) {
			return false;
		}

		$ctx->merge_patch( [ $setting => $resolved ] );

		return true;
	}
}
