<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Controls_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Size_Values;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Text_Alignment;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Writer {

	const NONE_KEYWORD = 'none';

	const POSITION_PROPERTY = 'position';

	const POSITION_OFFSET_PROPERTIES = [ 'inset-inline-start', 'inset-inline-end', 'inset-block-start', 'inset-block-end' ];

	const PHYSICAL_TEXT_ALIGN_PATTERN = '/(text-align\s*:\s*)(left|right)\b/i';

	const PHYSICAL_SIDES = [
		'block-start' => 'top',
		'inline-end' => 'right',
		'block-end' => 'bottom',
		'inline-start' => 'left',
	];

	const SIDE_LONGHAND_FORMATS = [
		'margin' => 'margin-%s',
		'padding' => 'padding-%s',
		'border-width' => 'border-%s-width',
	];

	private Css_Converter $css_converter;
	private V3_Control_Adapter_Registry $adapters;
	private Css_Declaration_Parser $declaration_parser;
	private V3_Color_Variables $color_variables;

	public function __construct(
		Css_Converter $css_converter,
		V3_Control_Adapter_Registry $adapters,
		Css_Declaration_Parser $declaration_parser,
		?V3_Color_Variables $color_variables = null
	) {
		$this->css_converter = $css_converter;
		$this->adapters = $adapters;
		$this->declaration_parser = $declaration_parser;
		$this->color_variables = $color_variables ?? V3_Color_Variables::create_default();
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
		$converted = $this->css_converter->convert( self::with_logical_text_align( $css ) );
		$state = $state ?? Style_Target::DEFAULT_STATE;
		$failures = [];
		$uncovered_sides = [];
		$unconverted = $this->unconverted_declarations( $ctx, $converted, $bindings, $controls, $breakpoint, $state );
		$position_fell_back = in_array( self::POSITION_PROPERTY, array_column( $unconverted, 'property' ), true );

		foreach ( self::position_first( $converted['props'] ) as $prop => $prop_value ) {
			if ( $position_fell_back && in_array( $prop, self::POSITION_OFFSET_PROPERTIES, true ) ) {
				$failures[ $prop ] = self::position_offset_message( (string) $prop );
				continue;
			}

			$prop_bindings = $this->bindings_for( $bindings, (string) $prop, $state );

			if ( empty( $prop_bindings ) ) {
				$bound_states = $this->states_bound_for( $bindings, (string) $prop );

				$failures[ $prop ] = empty( $bound_states )
					? self::unsupported_property_message( (string) $prop )
					: self::state_only_property_message( (string) $prop, $bound_states );
				$position_fell_back = $position_fell_back || self::POSITION_PROPERTY === $prop;
				continue;
			}

			foreach ( $prop_bindings as $binding ) {
				$failure = $this->write_binding( $ctx, $binding, $controls, $breakpoint, $prop_value );

				if ( null !== $failure ) {
					$failures[ $prop ] = $failures[ $prop ] ?? $failure;
				}
			}

			if ( ! isset( $failures[ $prop ] ) ) {
				$uncovered_sides = array_merge( $uncovered_sides, self::uncovered_side_declarations( (string) $prop, $prop_value, $prop_bindings ) );
			}

			$position_fell_back = $position_fell_back || isset( $failures[ self::POSITION_PROPERTY ] );
		}

		return array_merge( $this->declarations_of( $css, $failures ), $unconverted, $uncovered_sides );
	}

	private static function with_logical_text_align( string $css ): string {
		return preg_replace_callback(
			self::PHYSICAL_TEXT_ALIGN_PATTERN,
			fn( array $matches ) => $matches[1] . Text_Alignment::to_logical( $matches[2] ),
			$css
		) ?? $css;
	}

	/**
	 * When every binding of a prop owns only some sides, the sides none of them owns keep their
	 * value as physical longhands in the custom CSS.
	 *
	 * @param string                   $prop
	 * @param mixed                    $prop_value
	 * @param Compiled_Style_Binding[] $prop_bindings
	 * @return array<int, array{property: string, value: string, reason: string}>
	 */
	private static function uncovered_side_declarations( string $prop, $prop_value, array $prop_bindings ): array {
		if ( ! Size_Values::is_sides_prop( $prop_value ) || ! isset( self::SIDE_LONGHAND_FORMATS[ $prop ] ) ) {
			return [];
		}

		$covered = [];

		foreach ( $prop_bindings as $binding ) {
			if ( null === $binding->get_sides() ) {
				return [];
			}

			$covered = array_merge( $covered, $binding->get_sides() );
		}

		$declarations = [];

		foreach ( self::PHYSICAL_SIDES as $side => $physical_side ) {
			$size = in_array( $side, $covered, true ) ? null : Size_Values::from_prop( $prop_value['value'][ $side ] ?? null );

			if ( null === $size ) {
				continue;
			}

			$declarations[] = [
				'property' => sprintf( self::SIDE_LONGHAND_FORMATS[ $prop ], $physical_side ),
				'value' => $size['size'] . $size['unit'],
				'reason' => self::uncovered_side_message( $prop ),
			];
		}

		return $declarations;
	}

	private static function uncovered_side_message( string $property ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'This Elementor widget stores only some sides of CSS property %s; the other sides were written to the widget custom CSS.', 'elementor' ),
			$property
		);
	}

	/**
	 * Offsets are written after position, so they know whether position fell back.
	 */
	private static function position_first( array $props ): array {
		return array_merge( array_intersect_key( $props, [ self::POSITION_PROPERTY => true ] ), $props );
	}

	private static function position_offset_message( string $property ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s only works with position, which was written to the widget custom CSS.', 'elementor' ),
			$property
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
			$props = $this->css_converter->convert( self::with_logical_text_align( $declaration['property'] . ': ' . $declaration['value'] ) )['props'];
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

		return sprintf(
			/* translators: 1: CSS property name, 2: Comma-separated states */
			__( 'CSS property %1$s is only stored in the %2$s state of this style target.', 'elementor' ),
			$property,
			implode( ', ', $selectors )
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

		$variable_id = V3_Color_Variables::variable_id_in( $prop_value );

		if ( null !== $variable_id ) {
			$variable = $this->color_variables->find( $variable_id );

			if ( null === $variable ) {
				return self::unknown_variable_message( $binding );
			}

			$global_link = Controls_Manager::COLOR === $binding->get_control_type() ? $this->color_variables->global_link( $variable ) : null;

			if ( null !== $global_link ) {
				$this->store( $ctx, $binding, $controls, $breakpoint, '', $global_link );

				return null;
			}

			$prop_value = V3_Color_Variables::with_resolved_color( $prop_value, $variable['value'] );
			$ctx->warn( self::unlinked_variable_message( $binding, (string) $variable['label'] ) );
		}

		$adapter = $this->adapters->find( (string) ( $prop_value['$$type'] ?? '' ), $binding->get_control_type(), null !== $binding->get_sides() );
		$control_value = null === $adapter
			? null
			: $adapter->to_control_value( $prop_value, $binding->get_sides(), $controls[ $binding->get_setting() ] ?? [] );

		if ( null === $control_value ) {
			return self::unstorable_value_message( $binding, $controls[ $binding->get_setting() ] ?? [], $prop_value );
		}

		$this->store( $ctx, $binding, $controls, $breakpoint, $control_value );

		return null;
	}

	private function store( V3_Conversion_Context $ctx, Compiled_Style_Binding $binding, array $controls, string $breakpoint, $control_value, ?string $global_link = null ): void {
		$setting = Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ? $binding->get_setting() : $binding->get_setting() . '_' . $breakpoint;
		$requirements = self::requirements_at( $binding->get_dependency_values(), $controls, $breakpoint );
		$patch = array_merge( [ $setting => $control_value ], $requirements );

		if ( null !== $global_link ) {
			$patch[ V3_Settings_Patch::GLOBALS_KEY ] = [ $setting => $global_link ];
		}

		$ctx->merge_patch( $patch );
		$ctx->require_settings( $requirements, self::declaration_label( $binding ) );
	}

	private static function unknown_variable_message( Compiled_Style_Binding $binding ): string {
		return sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s uses a color variable that does not exist.', 'elementor' ),
			$binding->get_prop()
		);
	}

	private static function unlinked_variable_message( Compiled_Style_Binding $binding, string $label ): string {
		return sprintf(
			/* translators: 1: CSS property name, 2: Variable label */
			__( 'CSS property %1$s stores the current value of var(--%2$s), not a link to it: this Elementor widget can only link to color variables synced to Global Colors. Use "Sync to Global Colors" on the variable to keep the link.', 'elementor' ),
			$binding->get_prop(),
			$label
		);
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
		if ( null === $sides || ! Size_Values::is_sides_prop( $prop_value ) ) {
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

	/**
	 * @param Compiled_Style_Binding $binding
	 * @param array                  $control
	 * @param mixed                  $prop_value
	 */
	private static function unstorable_value_message( Compiled_Style_Binding $binding, array $control, $prop_value = null ): string {
		$message = sprintf(
			/* translators: %s: CSS property name */
			__( 'CSS property %s has a value this Elementor widget cannot store.', 'elementor' ),
			$binding->get_prop()
		);

		$hint = self::has_different_bound_sides( $binding, $prop_value )
			? __( 'This Elementor widget stores one length for all sides, so use a single value.', 'elementor' )
			: self::storable_values_hint( $binding->get_control_type(), $control );

		return trim( $message . ' ' . $hint );
	}

	/**
	 * @param Compiled_Style_Binding $binding
	 * @param mixed                  $prop_value
	 */
	private static function has_different_bound_sides( Compiled_Style_Binding $binding, $prop_value ): bool {
		$sides = $binding->get_sides() ?? [];

		if ( count( $sides ) < 2 || ! Size_Values::is_sides_prop( $prop_value ) ) {
			return false;
		}

		$sizes = array_map( fn( string $side ) => Size_Values::from_prop( $prop_value['value'][ $side ] ?? null ), $sides );

		return in_array( null, $sizes, true ) || ! Size_Values::are_equal( $sizes );
	}

	private static function storable_values_hint( string $control_type, array $control ): string {
		if ( Controls_Manager::BOX_SHADOW === $control_type ) {
			return __( 'Box shadow lengths, offsets and blur must be px, and the color must be a valid color.', 'elementor' );
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
