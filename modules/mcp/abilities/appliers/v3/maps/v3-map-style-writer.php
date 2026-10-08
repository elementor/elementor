<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Style_Writer {

	const WRAPPER_PLACEHOLDER = '{{WRAPPER}}';

	const PLACEHOLDER_OPEN = '{{';

	const CUSTOM_CSS_WRAPPER = 'selector';

	private Css_Converter $css_converter;
	private V3_Control_Adapter_Registry $adapters;
	private Css_Declaration_Parser $declaration_parser;

	/**
	 * @var array<string, array{direction: string, value: int, is_enabled?: bool}>|null
	 */
	private ?array $breakpoints_config;

	/**
	 * @param Css_Converter                                                               $css_converter
	 * @param V3_Control_Adapter_Registry                                                 $adapters
	 * @param Css_Declaration_Parser                                                      $declaration_parser
	 * @param array<string, array{direction: string, value: int, is_enabled?: bool}>|null $breakpoints_config Defaults to the site breakpoints.
	 */
	public function __construct(
		Css_Converter $css_converter,
		V3_Control_Adapter_Registry $adapters,
		Css_Declaration_Parser $declaration_parser,
		?array $breakpoints_config = null
	) {
		$this->css_converter = $css_converter;
		$this->adapters = $adapters;
		$this->declaration_parser = $declaration_parser;
		$this->breakpoints_config = $breakpoints_config;
	}

	/**
	 * @param V3_Conversion_Context    $ctx
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $controls
	 * @param string                   $breakpoint
	 * @param string|null              $state
	 * @param string                   $css
	 */
	public function write( V3_Conversion_Context $ctx, array $bindings, array $controls, string $breakpoint, ?string $state, string $css ): void {
		$converted = $this->css_converter->convert( $css );
		$state = $state ?? Style_Target::DEFAULT_STATE;

		foreach ( $converted['props'] as $prop => $prop_value ) {
			$prop_bindings = $this->bindings_for( $bindings, (string) $prop, $state );

			if ( empty( $prop_bindings ) ) {
				$bound_states = $this->states_bound_for( $bindings, (string) $prop );
				$message = empty( $bound_states )
					? self::unsupported_property_message( (string) $prop )
					: self::state_only_property_message( (string) $prop, $bound_states );
				$ctx->warn( $message );
				continue;
			}

			if ( self::has_no_breakpoint_value( $prop_bindings, $breakpoint ) ) {
				$this->write_custom_css( $ctx, $prop_bindings, $controls, $breakpoint, $this->declarations_of( $css, (string) $prop ) );
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
	 * @param Compiled_Style_Binding[] $bindings
	 */
	private static function has_no_breakpoint_value( array $bindings, string $breakpoint ): bool {
		if ( Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ) {
			return false;
		}

		foreach ( $bindings as $binding ) {
			if ( $binding->is_responsive() ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * A control without a per-device value still renders through its own selectors, so the
	 * breakpoint value is kept as custom CSS on those selectors instead of being dropped.
	 *
	 * @param V3_Conversion_Context    $ctx
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $controls
	 * @param string                   $breakpoint
	 * @param string[]                 $declarations
	 */
	private function write_custom_css( V3_Conversion_Context $ctx, array $bindings, array $controls, string $breakpoint, array $declarations ): void {
		$selectors = self::custom_css_selectors( $bindings, $controls );
		$media_query = $this->media_query( $breakpoint );

		if ( empty( $selectors ) || null === $media_query || empty( $declarations ) ) {
			$ctx->warn( $this->missing_breakpoint_message( $bindings[0]->get_prop(), $breakpoint ) );

			return;
		}

		$ctx->mark_unmapped( $media_query . ' { ' . implode( ', ', $selectors ) . ' { ' . implode( ' ', $declarations ) . ' } }' );
	}

	/**
	 * @param Compiled_Style_Binding[] $bindings
	 * @param array<string, mixed>     $controls
	 * @return string[]
	 */
	private static function custom_css_selectors( array $bindings, array $controls ): array {
		$selectors = [];

		foreach ( $bindings as $binding ) {
			foreach ( array_keys( $controls[ $binding->get_setting() ]['selectors'] ?? [] ) as $selector ) {
				$selectors[] = str_replace( self::WRAPPER_PLACEHOLDER, self::CUSTOM_CSS_WRAPPER, (string) $selector );
			}
		}

		return array_values( array_unique( array_filter(
			$selectors,
			fn( string $selector ) => false === strpos( $selector, self::PLACEHOLDER_OPEN )
		) ) );
	}

	/**
	 * @return string[]
	 */
	private function declarations_of( string $css, string $prop ): array {
		$declarations = [];

		foreach ( $this->declaration_parser->parse_declarations( $css ) as $declaration ) {
			$text = $declaration['property'] . ': ' . $declaration['value'] . ';';

			if ( array_key_exists( $prop, $this->css_converter->convert( $text )['props'] ) ) {
				$declarations[] = $text;
			}
		}

		return $declarations;
	}

	/**
	 * Spelled the way `Css_Media_Splitter` normalizes custom media queries, so reading the
	 * fallback back and writing it again keeps custom_css unchanged.
	 */
	private function media_query( string $breakpoint ): ?string {
		$this->breakpoints_config ??= Plugin::$instance->breakpoints->get_breakpoints_config();
		$config = $this->breakpoints_config[ $breakpoint ] ?? null;

		if ( ! is_array( $config ) || ( isset( $config['is_enabled'] ) && ! $config['is_enabled'] ) ) {
			return null;
		}

		return sprintf( '@media (%s-width:%dpx)', $config['direction'], $config['value'] );
	}

	private function write_binding( V3_Conversion_Context $ctx, Compiled_Style_Binding $binding, array $controls, string $breakpoint, $prop_value ): void {
		if ( null !== $binding->get_part() ) {
			$prop_value = $prop_value['value'][ $binding->get_part() ] ?? null;
		}

		if ( ! is_array( $prop_value ) || ! $this->touches_bound_sides( $prop_value, $binding->get_sides() ) ) {
			return;
		}

		if ( Responsive_Key_Resolver::BASE_BREAKPOINT !== $breakpoint && ! $binding->is_responsive() ) {
			$ctx->warn( $this->missing_breakpoint_message( $binding->get_prop(), $breakpoint ) );

			return;
		}

		$adapter = $this->adapters->find( (string) ( $prop_value['$$type'] ?? '' ), $binding->get_control_type(), null !== $binding->get_sides() );
		$control_value = null === $adapter
			? null
			: $adapter->to_control_value( $prop_value, $binding->get_sides(), $controls[ $binding->get_setting() ] ?? [] );

		if ( null === $control_value ) {
			$ctx->warn( $this->unstorable_value_message( $binding->get_prop() ) );

			return;
		}

		$setting = Responsive_Key_Resolver::BASE_BREAKPOINT === $breakpoint ? $binding->get_setting() : $binding->get_setting() . '_' . $breakpoint;

		$ctx->merge_patch( array_merge( [ $setting => $control_value ], self::requirements_at( $binding->get_dependency_values(), $controls, $breakpoint ) ) );
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
