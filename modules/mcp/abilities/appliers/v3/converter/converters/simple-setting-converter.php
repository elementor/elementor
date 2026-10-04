<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Map_Patch_Guard;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Choice_Values;
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
		$override = $meta->get_override( $rule['property'], $rule['state'], $rule['target'] ?? null );

		return null !== $override && isset( $override['setting'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'], $rule['target'] ?? null );
		if ( null === $override || ! isset( $override['setting'] ) ) {
			return false;
		}

		$setting = $override['setting'];
		if ( ! is_string( $setting ) || '' === $setting ) {
			return false;
		}

		$resolver = $override['resolver'] ?? 'text';
		$resolved = $this->resolve_value( (string) $resolver, (string) $rule['value'], $override );
		if ( null === $resolved ) {
			return false;
		}

		if ( 'box_shadow' === $resolver && is_array( $resolved ) ) {
			$patch = [
				$setting . '_type' => $resolved['box_shadow_type'],
				$setting => $resolved['box_shadow'],
			];

			if ( ! Map_Patch_Guard::accept( $ctx, $override, $rule, $patch ) ) {
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

		$companion_settings = $override['companion_settings'] ?? [];

		if ( ! Map_Patch_Guard::accept( $ctx, $override, $rule, [ $setting => $resolved ] + $companion_settings ) ) {
			return true;
		}

		$ctx->merge_patch( [ $key => $resolved ] + $companion_settings );

		return true;
	}

	/**
	 * @return mixed
	 */
	private function resolve_value( string $resolver, string $css_value, array $override ) {
		if ( Style_Control_Target::CHOICE_RESOLVER === $resolver ) {
			return V3_Choice_Values::resolve( $override['_map_descriptor']['value_map'] ?? [], $css_value );
		}

		return V3_Value_Resolvers::resolve( $resolver, $css_value );
	}
}
