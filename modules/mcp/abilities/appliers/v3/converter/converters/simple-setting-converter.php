<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Property_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Value_Compatibility;
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

		if ( null === $override ) {
			return false;
		}

		if ( 'element_width' === ( $override['resolver'] ?? null ) ) {
			return true;
		}

		return isset( $override['setting'] );
	}

	public function convert( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta ): bool {
		$override = $meta->get_override( $rule['property'], $rule['state'] );
		if ( null === $override ) {
			return false;
		}

		$resolver = $override['resolver'] ?? 'text';

		if ( 'element_width' === $resolver ) {
			return $this->convert_element_width( $ctx, $rule, $meta, $override );
		}

		if ( ! isset( $override['setting'] ) ) {
			return false;
		}

		$setting = $override['setting'];
		if ( ! is_string( $setting ) || '' === $setting ) {
			return false;
		}

		$resolver_args = array_merge( $override, [ 'property' => (string) $rule['property'] ] );
		$resolved = V3_Value_Resolvers::resolve( (string) $resolver, (string) $rule['value'], $resolver_args );
		if ( null === $resolved ) {
			return false;
		}

		if ( V3_Value_Resolvers::is_rejected( $resolved ) ) {
			$ctx->warn( self::format_reject_warning( (string) $rule['property'], (string) $rule['value'], $setting, (string) $resolved['reason'] ) );

			return true;
		}

		if ( 'box_shadow' === $resolver && is_array( $resolved ) ) {
			$ctx->merge_patch( [
				$setting . '_type' => $resolved['box_shadow_type'],
				$setting => $resolved['box_shadow'],
			] );

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

		$control = $meta->controls()[ $key ] ?? null;
		if ( is_array( $control ) && ! V3_Control_Value_Compatibility::accepts( $control, (string) $resolver, $resolved ) ) {
			return false;
		}

		$ctx->merge_patch( [ $key => $resolved ] );

		return true;
	}

	/**
	 * @param V3_Conversion_Context $ctx
	 * @param array<string, mixed>  $rule
	 * @param V3_Context_Meta       $meta
	 * @param array<string, mixed>  $override
	 */
	private function convert_element_width( V3_Conversion_Context $ctx, array $rule, V3_Context_Meta $meta, array $override ): bool {
		$patch = V3_Value_Resolvers::resolve_element_width( (string) $rule['value'], (string) $rule['property'] );
		if ( null === $patch ) {
			return false;
		}

		if ( V3_Value_Resolvers::is_rejected( $patch ) ) {
			$ctx->warn( self::format_reject_warning( (string) $rule['property'], (string) $rule['value'], V3_Value_Resolvers::ELEMENT_WIDTH_SETTING, (string) $patch['reason'] ) );

			return true;
		}

		$responsive = ! empty( $override['responsive'] );
		$merged = [];

		foreach ( $patch as $setting => $value ) {
			$key = $this->responsive_resolver->resolve(
				(string) $setting,
				(string) $rule['breakpoint'],
				$responsive,
				$meta
			);

			if ( null === $key ) {
				continue;
			}

			$control = $meta->controls()[ $key ] ?? null;
			if ( is_array( $control ) && ! V3_Control_Value_Compatibility::accepts( $control, 'text', $value ) ) {
				return false;
			}

			$merged[ $key ] = $value;
		}

		if ( empty( $merged ) ) {
			return false;
		}

		$ctx->merge_patch( $merged );

		return true;
	}

	public static function format_reject_warning( string $property, string $value, string $setting, string $reason ): string {
		return sprintf( 'Property `%s` value `%s` rejected on `%s`: %s', $property, trim( $value ), $setting, $reason );
	}
}
