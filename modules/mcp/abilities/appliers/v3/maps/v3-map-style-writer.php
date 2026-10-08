<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Controls_Manager;
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

	const NONE_KEYWORD = 'none';

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

	/**
	 * @param V3_Conversion_Context    $ctx
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $controls
	 * @param string                   $breakpoint
	 * @param string|null              $state
	 * @param string                   $css
	 * @return array<int, array{property: string, value: string, reason: string}> Declarations the bindings cannot store, for the caller to fall back on.
	 */
	public function write( V3_Conversion_Context $ctx, array $bindings, array $controls, string $breakpoint, ?string $state, string $css ): array {
		$converted = $this->css_converter->convert( $css );
		$state = $state ?? Style_Target::DEFAULT_STATE;
		$failures = [];

		foreach ( $converted['props'] as $prop => $prop_value ) {
			$prop_bindings = $this->bindings_for( $bindings, (string) $prop, $state );

			if ( empty( $prop_bindings ) ) {
				$bound_states = $this->states_bound_for( $bindings, (string) $prop );

				if ( empty( $bound_states ) ) {
					$failures[ $prop ] = self::unsupported_property_message( (string) $prop );
					continue;
				}

				$ctx->warn( self::state_only_property_message( (string) $prop, $bound_states ) );
				continue;
			}

			foreach ( $prop_bindings as $binding ) {
				$failure = $this->write_binding( $ctx, $binding, $controls, $breakpoint, $prop_value );

				if ( null !== $failure ) {
					$failures[ $prop ] = $failures[ $prop ] ?? $failure;
				}
			}
		}

		return array_merge(
			$this->declarations_of( $css, $failures ),
			$this->unconverted_declarations( $ctx, $converted, $bindings, $controls, $breakpoint, $state )
		);
	}

	private static function unsupported_property_message( string $property ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s is not supported by this Elementor widget.', 'elementor' ),
			$property
		);
	}

	/**
	 * Converted props lose the declaration they came from, so each declaration is converted on
	 * its own to find the ones behind a failed prop.
	 *
	 * @param string                $css
	 * @param array<string, string> $failures Prop => reason.
	 * @return array<int, array{property: string, value: string, reason: string}>
	 */
	private function declarations_of( string $css, array $failures ): array {
		if ( empty( $failures ) ) {
			return [];
		}

		$declarations = [];

		foreach ( $this->declaration_parser->parse_declarations( $css ) as $declaration ) {
			$props = $this->css_converter->convert( $declaration['property'] . ': ' . $declaration['value'] )['props'];
			$failed = array_intersect_key( $failures, $props );

			if ( ! empty( $failed ) ) {
				$declarations[] = array_merge( $declaration, [ 'reason' => reset( $failed ) ] );
			}
		}

		return $declarations;
	}

	/**
	 * @param string   $property
	 * @param string[] $states
	 */
	private static function state_only_property_message( string $property, array $states ): string {
		$selectors = array_map( fn( string $state ) => Style_Target::DEFAULT_STATE === $state ? 'default' : ':' . $state, $states );
		$example = Style_Target::DEFAULT_STATE === $states[0] ? '<target> { }' : '<target>:' . $states[0] . ' { }';

		return sprintf(
			/* translators: 1: CSS property name, 2: Comma-separated states, 3: Example CSS block */
			__( 'CSS property %1$s is only supported in the %2$s state of this style target. Move it into a `%3$s` block.', 'elementor' ),
			$property,
			implode( ', ', $selectors ),
			$example
		);
	}

	/**
	 * @param Compiled_Style_Binding[] $bindings
	 * @return string[]
	 */
	private function states_bound_for( array $bindings, string $prop ): array {
		$states = [];

		foreach ( $bindings as $binding ) {
			if ( $prop === $binding->get_prop() ) {
				$states[] = $binding->get_state();
			}
		}

		return array_values( array_unique( $states ) );
	}

	/**
	 * @return string|null Why the value could not be stored, or null when it was written or belongs to another binding.
	 */
	private function write_binding( V3_Conversion_Context $ctx, Compiled_Style_Binding $binding, array $controls, string $breakpoint, $prop_value ): ?string {
		if ( null !== $binding->get_part() ) {
			$prop_value = $prop_value['value'][ $binding->get_part() ] ?? null;
		}

		if ( ! is_array( $prop_value ) || ! $this->touches_bound_sides( $prop_value, $binding->get_sides() ) ) {
			return null;
		}

		if ( Responsive_Key_Resolver::BASE_BREAKPOINT !== $breakpoint && ! $binding->is_responsive() ) {
			return $this->missing_breakpoint_message( $binding->get_prop(), $breakpoint );
		}

		$adapter = $this->adapters->find( (string) ( $prop_value['$$type'] ?? '' ), $binding->get_control_type(), null !== $binding->get_sides() );
		$control_value = null === $adapter
			? null
			: $adapter->to_control_value( $prop_value, $binding->get_sides(), $controls[ $binding->get_setting() ] ?? [] );

		if ( null === $control_value ) {
			return self::unstorable_value_message( $binding, $controls[ $binding->get_setting() ] ?? [] );
		}

		$setting = Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ? $binding->get_setting() : $binding->get_setting() . '_' . $breakpoint;

		$requirements = self::requirements_at( $binding->get_dependency_values(), $controls, $breakpoint );

		$ctx->merge_patch( array_merge( [ $setting => $control_value ], $requirements ) );
		$ctx->require_settings( $requirements, self::declaration_label( $binding ) );

		return null;
	}

	private static function declaration_label( Compiled_Style_Binding $binding ): string {
		return Style_Target::DEFAULT_STATE === $binding->get_state()
			? $binding->get_prop()
			: $binding->get_prop() . ' (:' . $binding->get_state() . ')';
	}

	/**
	 * A responsive requirement is written at the same breakpoint as the bound value, so a
	 * mobile-only write does not change the desktop sibling.
	 *
	 * @param array<string, mixed> $requirements
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	private static function requirements_at( array $requirements, array $controls, string $breakpoint ): array {
		if ( Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ) {
			return $requirements;
		}

		$scoped = [];

		foreach ( $requirements as $setting => $value ) {
			$responsive_key = $setting . '_' . $breakpoint;
			$is_responsive = isset( $controls[ $responsive_key ] ) || ! empty( $controls[ $setting ]['is_responsive'] );

			$scoped[ $is_responsive ? $responsive_key : $setting ] = $value;
		}

		return $scoped;
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
	 * @param Compiled_Style_Binding[] $bindings
	 * @return Compiled_Style_Binding[]
	 */
	private function bindings_for( array $bindings, string $prop, string $state ): array {
		return array_values( array_filter(
			$bindings,
			fn( Compiled_Style_Binding $binding ) => $prop === $binding->get_prop() && $state === $binding->get_state()
		) );
	}

	/**
	 * The converter leaves out unknown properties and values its style schema does not allow,
	 * before any binding sees them.
	 *
	 * @param V3_Conversion_Context    $ctx
	 * @param array                    $converted
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $controls
	 * @param string                   $breakpoint
	 * @param string                   $state
	 * @return array<int, array{property: string, value: string, reason: string}>
	 */
	private function unconverted_declarations( V3_Conversion_Context $ctx, array $converted, array $bindings, array $controls, string $breakpoint, string $state ): array {
		$unconverted_css = implode( ';', array_merge( [ $converted['customCss'] ], $converted['rejected'] ) );
		$declarations = [];

		foreach ( $this->declaration_parser->parse_declarations( $unconverted_css ) as $declaration ) {
			$binding = $this->bindings_for( $bindings, $declaration['property'], $state )[0] ?? null;

			if ( null !== $binding && self::is_box_shadow_none( $binding, $declaration['value'], $breakpoint ) ) {
				$ctx->merge_patch( array_fill_keys( array_keys( $binding->get_dependency_values() ), '' ) );
				continue;
			}

			$reason = null === $binding
				? self::unsupported_property_message( $declaration['property'] )
				: self::unstorable_value_message( $binding, $controls[ $binding->get_setting() ] ?? [] );

			$declarations[] = array_merge( $declaration, [ 'reason' => $reason ] );
		}

		return $declarations;
	}

	/**
	 * The converter declines `box-shadow: none`; on a box shadow group it means the group's toggle is off.
	 */
	private static function is_box_shadow_none( Compiled_Style_Binding $binding, string $value, string $breakpoint ): bool {
		return Controls_Manager::BOX_SHADOW === $binding->get_control_type()
			&& self::NONE_KEYWORD === strtolower( trim( $value ) )
			&& Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint
			&& ! empty( $binding->get_dependency_values() );
	}

	private function missing_breakpoint_message( string $property, string $breakpoint ): string {
		return sprintf(
			/* translators: 1: CSS property name, 2: breakpoint name */
			__( 'CSS property %1$s has no per-device value in this Elementor widget at @media(--%2$s).', 'elementor' ),
			$property,
			$breakpoint
		);
	}

	private static function unstorable_value_message( Compiled_Style_Binding $binding, array $control ): string {
		$message = sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s has a value this Elementor widget cannot store.', 'elementor' ),
			$binding->get_prop()
		);

		return trim( $message . ' ' . self::storable_values_hint( $binding->get_control_type(), $control ) );
	}

	private static function storable_values_hint( string $control_type, array $control ): string {
		if ( Controls_Manager::BOX_SHADOW === $control_type ) {
			return __( 'Box shadow lengths must be px.', 'elementor' );
		}

		$options = array_filter( array_map( 'strval', array_keys( $control['options'] ?? [] ) ), fn( string $option ) => '' !== $option );

		if ( ! empty( $options ) ) {
			/* translators: %s: Comma-separated allowed values */
			return sprintf( __( 'Allowed values: %s.', 'elementor' ), implode( ', ', $options ) );
		}

		if ( ! empty( $control['size_units'] ) ) {
			/* translators: %s: Comma-separated allowed units */
			return sprintf( __( 'Allowed units: %s.', 'elementor' ), implode( ', ', $control['size_units'] ) );
		}

		return '';
	}
}
