<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Writer {

	private Css_Converter $css_converter;
	private V3_Control_Adapter_Registry $adapters;
	private Css_Declaration_Parser $declaration_parser;

	public function __construct(
		Css_Converter $css_converter,
		V3_Control_Adapter_Registry $adapters,
		Css_Declaration_Parser $declaration_parser
	) {
		$this->css_converter = $css_converter;
		$this->adapters = $adapters;
		$this->declaration_parser = $declaration_parser;
	}

	public function write( V3_Conversion_Context $ctx, array $bindings, array $controls, string $breakpoint, ?string $state, string $css ): void {
		$converted = $this->css_converter->convert( $css );
		$state = $state ?? Style_Target::DEFAULT_STATE;

		foreach ( $converted['props'] as $prop => $prop_value ) {
			$prop_bindings = $this->bindings_for( $bindings, (string) $prop, $state );

			if ( empty( $prop_bindings ) ) {
				$ctx->warn( self::unsupported_property_message( (string) $prop ) );
				continue;
			}

			foreach ( $prop_bindings as $binding ) {
				$this->write_binding( $ctx, $binding, $controls, $breakpoint, $prop_value );
			}
		}

		$this->warn_unconverted( $ctx, $converted );
	}

	private static function unsupported_property_message( string $property ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s is not supported by this Elementor widget and was skipped.', 'elementor' ),
			$property
		);
	}

	private function write_binding( V3_Conversion_Context $ctx, array $binding, array $controls, string $breakpoint, $prop_value ): void {
		if ( ! is_array( $prop_value ) || ! $this->touches_bound_sides( $prop_value, $binding['sides'] ) ) {
			return;
		}

		if ( Responsive_Key_Resolver::BASE_BREAKPOINT !== $breakpoint && ! $binding['responsive'] ) {
			$ctx->warn( $this->missing_breakpoint_message( $binding['prop'], $breakpoint ) );

			return;
		}

		$adapter = $this->adapters->find( (string) ( $prop_value['$$type'] ?? '' ), $binding['control_type'], null !== $binding['sides'] );
		$control_value = null === $adapter
			? null
			: $adapter->to_control_value( $prop_value, $binding['sides'], $controls[ $binding['setting'] ] ?? [] );

		if ( null === $control_value ) {
			$ctx->warn( $this->unstorable_value_message( $binding['prop'] ) );

			return;
		}

		$setting = Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ? $binding['setting'] : $binding['setting'] . '_' . $breakpoint;

		$ctx->merge_patch( array_merge( [ $setting => $control_value ], $binding['dependency_values'] ) );
	}

	/**
	 * A side binding only owns part of a dimensions value, so a value that leaves all of its
	 * sides untouched belongs to another binding of the same prop.
	 */
	private function touches_bound_sides( array $prop_value, ?array $sides ): bool {
		if ( null === $sides || Dimensions_Prop_Type::get_key() !== ( $prop_value['$$type'] ?? null ) ) {
			return true;
		}

		$value = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];

		return ! empty( array_intersect( $sides, array_keys( array_filter( $value ) ) ) );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private function bindings_for( array $bindings, string $prop, string $state ): array {
		return array_values( array_filter(
			$bindings,
			fn( array $binding ) => $prop === $binding['prop'] && $state === $binding['state']
		) );
	}

	private function warn_unconverted( V3_Conversion_Context $ctx, array $converted ): void {
		$unconverted_css = implode( ';', array_merge( [ $converted['customCss'] ], $converted['rejected'] ) );

		foreach ( $this->declaration_parser->parse_declarations( $unconverted_css ) as $declaration ) {
			$ctx->warn( self::unsupported_property_message( $declaration['property'] ) );
		}
	}

	private function missing_breakpoint_message( string $property, string $breakpoint ): string {
		return sprintf(
			/* translators: 1: CSS property name, 2: breakpoint name */
			__( 'CSS property %1$s has no per-device value in this Elementor widget, so its @media(--%2$s) value was skipped.', 'elementor' ),
			$property,
			$breakpoint
		);
	}

	private function unstorable_value_message( string $property ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s has a value this Elementor widget cannot store and was skipped.', 'elementor' ),
			$property
		);
	}
}
