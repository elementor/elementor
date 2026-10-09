<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\Dimensions_Adapter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Style_Binding_Compiler {

	const ALLOWED_STATES = [ 'default', 'hover' ];

	const DEPENDENCY_OPERATOR = 'eq';

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
		$covered_sides = [];

		foreach ( $target->get_bindings() as $binding ) {
			$entry = self::entry_name( $target->get_alias(), $binding['prop'], $binding['state'] );
			$result = $this->compile_binding( $binding, $controls );

			if ( $result instanceof WP_Error ) {
				self::record( $diagnostics, $widget_type, $entry, $result );
				continue;
			}

			$coverage_key = $result->get_prop() . '|' . $result->get_state();
			$sides = $result->get_sides() ?? self::all_sides();

			if ( ! empty( array_intersect( $covered_sides[ $coverage_key ] ?? [], $sides ) ) ) {
				$diagnostics->add( $widget_type, $entry, 'overlapping_bindings', $result->get_setting() );
				continue;
			}

			$covered_sides[ $coverage_key ] = array_merge( $covered_sides[ $coverage_key ] ?? [], $sides );
			$compiled[] = $result;
		}

		return new Compiled_Style_Target( $target->get_alias(), $target->get_label(), $compiled );
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
	 * @return Compiled_Style_Binding|WP_Error
	 */
	private function compile_binding( array $binding, array $controls ) {
		$prop = $binding['prop'];
		$state = $binding['state'];
		$control = $binding['control'];
		$setting = $control->get_setting();
		$sides = $control->get_sides();

		if ( ! in_array( $state, self::ALLOWED_STATES, true ) ) {
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

		$dependency_values = $this->dependency_values( $control->get_dependencies(), $controls );

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

			$values[ $setting ] = $term['value'];
		}

		return $values;
	}
}
