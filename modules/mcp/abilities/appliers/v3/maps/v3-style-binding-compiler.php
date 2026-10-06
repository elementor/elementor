<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Dimensions_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Style_Binding_Compiler {

	const STATE_PATTERN = '/^[a-z]+(?:-[a-z]+)*$/';

	const TOGGLE_CONTROL_TYPES = [ 'popover_toggle', 'switcher' ];

	const DEFAULT_TOGGLE_VALUE = 'yes';

	const NEGATION_SUFFIX = '!';

	const RESPONSIVE_PROBE_SUFFIX = '_mobile';

	/** @var array<string, Prop_Type> */
	private array $style_schema;

	private V3_Control_Adapter_Registry $adapters;

	public function __construct( array $style_schema, V3_Control_Adapter_Registry $adapters ) {
		$this->style_schema = $style_schema;
		$this->adapters = $adapters;
	}

	public function compile( Style_Target $target, array $controls, V3_Map_Diagnostics $diagnostics, string $widget_type ): Compiled_Style_Target {
		$compiled = [];
		$coverages = [];
		$allowed_states = self::allowed_states( $target );

		foreach ( $target->get_bindings() as $binding ) {
			$entry = self::entry_name( $target->get_alias(), $binding['prop'], $binding['state'] );
			$result = $this->compile_binding( $binding, $controls, $allowed_states );

			if ( $result instanceof WP_Error ) {
				self::record( $diagnostics, $widget_type, $entry, $result );
				continue;
			}

			$coverage_key = $result->get_prop() . '|' . $result->get_state();
			$coverage = null === $result->get_sides() ? Binding_Coverage::whole() : Binding_Coverage::sides( $result->get_sides() );

			if ( self::overlaps_any( $coverage, $coverages[ $coverage_key ] ?? [] ) ) {
				$diagnostics->add( $widget_type, $entry, 'overlapping_bindings', $result->get_setting() );
				continue;
			}

			$coverages[ $coverage_key ][] = $coverage;
			$compiled[] = $result;
		}

		return new Compiled_Style_Target( $target->get_alias(), $target->get_label(), $compiled );
	}

	/**
	 * @return string[]
	 */
	private static function allowed_states( Style_Target $target ): array {
		$declared = array_filter(
			$target->get_declared_states(),
			fn( string $state ) => 1 === preg_match( self::STATE_PATTERN, $state )
		);

		return array_values( array_unique( array_merge( Style_Target::GLOBAL_STATES, $declared ) ) );
	}

	private static function entry_name( string $alias, string $prop, string $state ): string {
		$entry = $alias . '.' . $prop;

		return Style_Target::DEFAULT_STATE === $state ? $entry : $entry . ':' . $state;
	}

	private static function record( V3_Map_Diagnostics $diagnostics, string $widget_type, string $entry, WP_Error $error ): void {
		$data = $error->get_error_data( $error->get_error_code() );

		$diagnostics->add( $widget_type, $entry, (string) ( $data['reason'] ?? '' ), (string) ( $data['detail'] ?? '' ) );
	}

	/**
	 * @return string[]
	 */
	private static function all_sides(): array {
		return array_keys( Dimensions_Adapter::LOGICAL_TO_PHYSICAL_SIDES );
	}

	/**
	 * @param array{prop: string, state: string, control: V3_Control} $binding
	 * @param array<string, mixed>                                    $controls
	 * @param string[]                                                $allowed_states
	 * @return Compiled_Style_Binding|WP_Error
	 */
	private function compile_binding( array $binding, array $controls, array $allowed_states ) {
		$prop = $binding['prop'];
		$state = $binding['state'];
		$control = $binding['control'];
		$setting = $control->get_setting();
		$sides = $control->get_sides();

		if ( ! in_array( $state, $allowed_states, true ) ) {
			return V3_Widget_Map_Compiler::error( 'invalid_state_key', $state );
		}

		if ( ! isset( $this->style_schema[ $prop ] ) ) {
			return V3_Widget_Map_Compiler::error( 'unknown_style_prop', $prop );
		}

		if ( ! is_array( $controls[ $setting ] ?? null ) ) {
			return V3_Widget_Map_Compiler::error( 'missing_control', $setting );
		}

		if ( null !== $sides && ( empty( $sides ) || ! empty( array_diff( $sides, self::all_sides() ) ) ) ) {
			return V3_Widget_Map_Compiler::error( 'invalid_sides', $setting );
		}

		$control_type = (string) ( $controls[ $setting ]['type'] ?? '' );
		$read_type = $this->find_read_type( $this->style_schema[ $prop ], $control_type, null !== $sides );

		if ( null === $read_type ) {
			return V3_Widget_Map_Compiler::error( 'incompatible_control', $setting );
		}

		if ( $control->is_responsive() && ! self::is_responsive_control( $setting, $controls ) ) {
			return V3_Widget_Map_Compiler::error( 'incompatible_responsive_control', $setting );
		}

		$dependency_values = $this->requirements( $control, $controls );

		if ( $dependency_values instanceof WP_Error ) {
			return $dependency_values;
		}

		return new Compiled_Style_Binding( [
			'prop' => $prop,
			'state' => $state,
			'setting' => $setting,
			'control_type' => $control_type,
			'responsive' => $control->is_responsive(),
			'sides' => $sides,
			'dependency_values' => $dependency_values,
			'read_type' => $read_type,
		] );
	}

	/**
	 * Responsive controls are either registered once with `is_responsive` (when responsive
	 * control duplication is off) or duplicated per device with a `_<device>` suffix.
	 */
	private static function is_responsive_control( string $setting, array $controls ): bool {
		return ! empty( $controls[ $setting ]['is_responsive'] )
			|| isset( $controls[ $setting . self::RESPONSIVE_PROBE_SUFFIX ] );
	}

	private function find_read_type( Prop_Type $prop_type, string $control_type, bool $has_sides ): ?string {
		foreach ( $this->prop_type_keys( $prop_type ) as $key ) {
			if ( null !== $this->adapters->find( $key, $control_type, $has_sides ) ) {
				return $key;
			}
		}

		return null;
	}

	/**
	 * @return string[]
	 */
	private function prop_type_keys( Prop_Type $prop_type ): array {
		if ( $prop_type instanceof Union_Prop_Type ) {
			return array_keys( $prop_type->get_prop_types() );
		}

		return [ $prop_type::get_key() ];
	}

	/**
	 * @param Binding_Coverage   $coverage
	 * @param Binding_Coverage[] $existing
	 */
	private static function overlaps_any( Binding_Coverage $coverage, array $existing ): bool {
		foreach ( $existing as $covered ) {
			if ( $coverage->overlaps( $covered ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Sibling values the writer fills so the bound control takes effect. Explicit requirements
	 * win; otherwise they are derived from the control `condition` terms that have exactly one
	 * satisfying value. Other terms are left to `is_control_visible()` and the inactive warnings.
	 *
	 * @param V3_Control           $control
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>|WP_Error
	 */
	private function requirements( V3_Control $control, array $controls ) {
		$explicit = $control->get_requirements();

		if ( null !== $explicit ) {
			return self::validate_requirements( $explicit, $controls );
		}

		$condition = $controls[ $control->get_setting() ]['condition'] ?? null;

		return is_array( $condition ) ? self::derive_requirements( $condition, $controls ) : [];
	}

	/**
	 * @param array<string, mixed> $requirements
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>|WP_Error
	 */
	private static function validate_requirements( array $requirements, array $controls ) {
		foreach ( $requirements as $setting => $value ) {
			if ( ! is_array( $controls[ $setting ] ?? null ) || ! is_scalar( $value ) ) {
				return V3_Widget_Map_Compiler::error( 'invalid_requirement', (string) $setting );
			}
		}

		return $requirements;
	}

	/**
	 * @param array<string, mixed> $condition
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>
	 */
	private static function derive_requirements( array $condition, array $controls ): array {
		$requirements = [];

		foreach ( $condition as $term => $expected ) {
			$is_negated = str_ends_with( (string) $term, self::NEGATION_SUFFIX );
			$setting = $is_negated ? substr( (string) $term, 0, -1 ) : (string) $term;
			$sibling = $controls[ $setting ] ?? null;

			if ( ! is_array( $sibling ) ) {
				continue;
			}

			if ( ! $is_negated && is_scalar( $expected ) ) {
				$requirements[ $setting ] = $expected;
				continue;
			}

			if ( $is_negated && '' === $expected && in_array( $sibling['type'] ?? null, self::TOGGLE_CONTROL_TYPES, true ) ) {
				$requirements[ $setting ] = $sibling['return_value'] ?? self::DEFAULT_TOGGLE_VALUE;
			}
		}

		return $requirements;
	}
}
