<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Dimensions_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Choice_Values;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Style_Binding_Compiler {

	const ALLOWED_STATES = [ 'default', 'hover', 'selected' ];

	const DEPENDENCY_OPERATOR = 'eq';

	const RESPONSIVE_PROBE_SUFFIX = '_mobile';

	/** @var array<string, Prop_Type> */
	private array $style_schema;

	private V3_Control_Adapter_Registry $adapters;

	public function __construct( array $style_schema, V3_Control_Adapter_Registry $adapters ) {
		$this->style_schema = $style_schema;
		$this->adapters = $adapters;
	}

	/**
	 * @return array<int, array<string, mixed>>|WP_Error
	 */
	public function compile( Style_Target $target, array $controls ) {
		$compiled = [];
		$covered_sides = [];

		foreach ( $target->get_bindings() as $binding ) {
			$result = $this->compile_binding( $binding, $controls );

			if ( $result instanceof WP_Error ) {
				return $result;
			}

			$coverage_key = $result['prop'] . '|' . $result['state'];
			$tokens = $this->coverage_tokens( $result );

			if ( $this->overlaps( $covered_sides[ $coverage_key ] ?? [], $tokens ) ) {
				return V3_Widget_Map_Compiler::error( 'overlapping_bindings', $result['prop'] );
			}

			$covered_sides[ $coverage_key ] = array_merge( $covered_sides[ $coverage_key ] ?? [], $tokens );
			$compiled[] = $result;
		}

		return $compiled;
	}

	/**
	 * @return string[]
	 */
	private static function all_sides(): array {
		return array_keys( Dimensions_Adapter::LOGICAL_TO_PHYSICAL_SIDES );
	}

	/**
	 * A binding owns every side, a listed set of sides, or one object field.
	 * Owning every side overlaps any other binding of the same prop and state.
	 *
	 * @param array<string, mixed> $binding
	 * @return string[]
	 */
	private function coverage_tokens( array $binding ): array {
		if ( is_string( $binding['part'] ?? null ) && '' !== $binding['part'] ) {
			return [ 'part:' . $binding['part'] ];
		}

		return $binding['sides'] ?? [ '*' ];
	}

	/**
	 * @param string[] $existing
	 * @param string[] $tokens
	 */
	private function overlaps( array $existing, array $tokens ): bool {
		if ( empty( $existing ) ) {
			return false;
		}

		if ( in_array( '*', $existing, true ) || in_array( '*', $tokens, true ) ) {
			return true;
		}

		return ! empty( array_intersect( $existing, $tokens ) );
	}

	/**
	 * @param array{prop: string, state: string, control: V3_Control} $binding
	 * @param array<string, mixed>                                    $controls
	 * @return array<string, mixed>|WP_Error
	 */
	private function compile_binding( array $binding, array $controls ) {
		$prop = $binding['prop'];
		$state = $binding['state'];
		$control = $binding['control'];
		$setting = $control->get_setting();
		$sides = $control->get_sides();
		$part = $control->get_part();

		if ( ! in_array( $state, self::ALLOWED_STATES, true ) ) {
			return V3_Widget_Map_Compiler::error( 'invalid_state_key', $state );
		}

		if ( ! isset( $this->style_schema[ $prop ] ) ) {
			return V3_Widget_Map_Compiler::error( 'unknown_style_prop', $prop );
		}

		if ( ! is_array( $controls[ $setting ] ?? null ) ) {
			return V3_Widget_Map_Compiler::error( 'missing_control', $setting );
		}

		if ( null !== $part && null !== $sides ) {
			return V3_Widget_Map_Compiler::error( 'invalid_part', $setting );
		}

		if ( null !== $sides && ( empty( $sides ) || ! empty( array_diff( $sides, self::all_sides() ) ) ) ) {
			return V3_Widget_Map_Compiler::error( 'invalid_sides', $setting );
		}

		$schema_prop = $this->style_schema[ $prop ];
		$read_prop = $schema_prop;

		if ( null !== $part ) {
			if ( ! $schema_prop instanceof Object_Prop_Type || null === $schema_prop->get_shape_field( $part ) ) {
				return V3_Widget_Map_Compiler::error( 'invalid_part', $setting );
			}

			$read_prop = $schema_prop->get_shape_field( $part );
		}

		$control_type = (string) ( $controls[ $setting ]['type'] ?? '' );
		$read_type = $this->find_read_type( $read_prop, $control_type, null !== $sides );

		if ( null === $read_type ) {
			return V3_Widget_Map_Compiler::error( 'incompatible_control', $setting );
		}

		if ( $control->is_responsive() && ! self::is_responsive_control( $setting, $controls ) ) {
			return V3_Widget_Map_Compiler::error( 'incompatible_responsive_control', $setting );
		}

		$dependency_values = $this->dependency_values( $control->get_dependencies(), $controls );

		if ( $dependency_values instanceof WP_Error ) {
			return $dependency_values;
		}

		$value_map = $this->choice_value_map( $control, $controls[ $setting ], $control_type );

		if ( $value_map instanceof WP_Error ) {
			return $value_map;
		}

		return [
			'prop' => $prop,
			'state' => $state,
			'setting' => $setting,
			'control_type' => $control_type,
			'responsive' => $control->is_responsive(),
			'sides' => $sides,
			'part' => $part,
			'dependency_values' => $dependency_values,
			'value_map' => $value_map,
			'read_type' => $read_type,
		];
	}

	/**
	 * @param V3_Control           $control
	 * @param array<string, mixed> $control_config
	 * @param string               $control_type
	 * @return array<string, string>|null|WP_Error
	 */
	private function choice_value_map( V3_Control $control, array $control_config, string $control_type ) {
		if ( ! in_array( $control_type, [ 'select', 'choose' ], true ) ) {
			return null;
		}

		$value_map = V3_Choice_Values::build_value_map( $control_config, $control->get_css_values() );

		if ( null === $value_map ) {
			return V3_Widget_Map_Compiler::error( 'incompatible_choice_values', $control->get_setting() );
		}

		return $value_map;
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
	 * @param array<string, mixed>|null $dependencies
	 * @param array<string, mixed>      $controls
	 * @return array<string, mixed>|WP_Error
	 */
	private function dependency_values( ?array $dependencies, array $controls ) {
		if ( null === $dependencies ) {
			return [];
		}

		$terms = $dependencies['terms'] ?? null;

		if ( ! is_array( $terms ) || empty( $terms ) || ( count( $terms ) > 1 && Dependency_Manager::RELATION_AND !== ( $dependencies['relation'] ?? null ) ) ) {
			return V3_Widget_Map_Compiler::error( 'invalid_dependency', '' );
		}

		$values = [];

		foreach ( $terms as $term ) {
			$path = $term['path'] ?? null;
			$setting = is_array( $path ) && 1 === count( $path ) ? (string) reset( $path ) : '';

			if ( self::DEPENDENCY_OPERATOR !== ( $term['operator'] ?? null ) || '' === $setting || ! isset( $controls[ $setting ] ) || ! is_scalar( $term['value'] ?? null ) ) {
				return V3_Widget_Map_Compiler::error( 'invalid_dependency', $setting );
			}

			$values[ $setting ] = [
				'value' => $term['value'],
				'responsive' => self::is_responsive_control( $setting, $controls ),
			];
		}

		return $values;
	}
}
