<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Resolved_Patch_Validator;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Value_Resolvers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles simple `setting` + `resolver` overrides: single-key writes with responsive
 * suffixing. Also handles the `resolver = box_shadow` sub-case (writes both
 * `<setting>_type` and `<setting>`).
 */
class Simple_Setting_Converter implements V3_Property_Converter {

	private Responsive_Key_Resolver $responsive_resolver;

	public function __construct( Responsive_Key_Resolver $responsive_resolver ) {
		$this->responsive_resolver = $responsive_resolver;
	}

	public function is_supported( array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );

		return null !== $override && isset( $override['setting'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );
		if ( null === $override || ! isset( $override['setting'] ) ) {
			return false;
		}

		$setting = $override['setting'];
		if ( ! is_string( $setting ) || '' === $setting ) {
			return false;
		}

		$resolver = $override['resolver'] ?? 'text';
		$resolved = V3_Value_Resolvers::resolve( (string) $resolver, (string) $rule['value'] );
		if ( null === $resolved ) {
			return false;
		}

		if ( 'box_shadow' === $resolver && is_array( $resolved ) ) {
			$patch = [
				$setting . '_type' => $resolved['box_shadow_type'],
				$setting => $resolved['box_shadow'],
			];

			if ( ! $this->accept_map_patch( $ctx, $override, $rule, $patch ) ) {
				return true;
			}

			$ctx->merge_patch( $patch );

			return true;
		}

		$key = $this->responsive_resolver->resolve(
			$setting,
			(string) $rule['breakpoint'],
			! empty( $override['responsive'] ),
			$meta
		);

		if ( null === $key ) {
			return false;
		}

		$patch = [ $key => $resolved ];

		if ( ! $this->accept_map_patch( $ctx, $override, $rule, $patch ) ) {
			return true;
		}

		$ctx->merge_patch( $patch );

		return true;
	}

	/**
	 * Runs the resolved-patch validator when the override was produced from a compiled
	 * V3 widget map (see {@see \Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Overrides_Builder}).
	 * Returns false when the patch must be dropped atomically; emits a structured warning
	 * on the shared conversion context in that case.
	 */
	private function accept_map_patch( V3_Conversion_Context $ctx, array $override, array $rule, array $patch ): bool {
		$descriptor = $override['_map_descriptor'] ?? null;

		if ( ! is_array( $descriptor ) ) {
			return true;
		}

		$result = V3_Resolved_Patch_Validator::validate( $descriptor, $patch );

		if ( $result['valid'] ) {
			return true;
		}

		$target = (string) ( $override['_map_target'] ?? '' );
		$property = (string) ( $rule['property'] ?? '' );
		$state = $rule['state'] ?? null;

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
