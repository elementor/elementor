<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Plain_Llm_Schema_Converter;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Condition;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Compiler {

	const ERROR_CODE = 'elementor_v3_map_invalid';

	const ALIAS_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

	const SETTING_ENTRY_PREFIX = 'setting.';

	/** @var array<string, Prop_Type>|null */
	private ?array $style_schema;

	private V3_Control_Adapter_Registry $adapters;

	/**
	 * @param array<string, Prop_Type>|null $style_schema
	 */
	public function __construct( ?array $style_schema = null, ?V3_Control_Adapter_Registry $adapters = null ) {
		$this->style_schema = $style_schema;
		$this->adapters = $adapters ?? V3_Control_Adapter_Registry::create_default();
	}

	/**
	 * Map-shape errors fail the whole map. A setting or binding whose control is missing or
	 * incompatible is dropped and recorded in the diagnostics, so control drift in the widget
	 * degrades the map instead of removing the widget from the catalog.
	 *
	 * @param V3_Widget_Map        $map
	 * @param array<string, mixed> $controls
	 * @param V3_Map_Diagnostics   $diagnostics
	 * @param string|null          $expected_widget_type
	 * @return Compiled_V3_Map|WP_Error
	 */
	public function compile( V3_Widget_Map $map, array $controls, V3_Map_Diagnostics $diagnostics, ?string $expected_widget_type = null ) {
		$widget_type = $map->get_widget_type();
		$shape_error = $this->validate_map_shape( $map, $expected_widget_type );

		if ( $shape_error instanceof WP_Error ) {
			$data = $shape_error->get_error_data( self::ERROR_CODE );
			$diagnostics->add( $expected_widget_type ?? $widget_type, V3_Map_Diagnostics::MAP_ENTRY, $data['reason'], $data['detail'] );

			return $shape_error;
		}

		return new Compiled_V3_Map(
			$widget_type,
			$map->get_description(),
			$this->compile_settings( $map, $controls, $diagnostics ),
			$map->get_default_target()->get_alias(),
			$this->compile_targets( $map, $controls, $diagnostics )
		);
	}

	private function validate_map_shape( V3_Widget_Map $map, ?string $expected_widget_type ): ?WP_Error {
		if ( '' === $map->get_widget_type() ) {
			return self::error( 'missing_field', 'widget_type' );
		}

		if ( null !== $expected_widget_type && $expected_widget_type !== $map->get_widget_type() ) {
			return self::error( 'widget_type_mismatch', $map->get_widget_type() );
		}

		if ( '' === $map->get_description() ) {
			return self::error( 'missing_field', 'description' );
		}

		if ( null === $map->get_default_target() ) {
			return self::error( 'missing_default_style_target', '' );
		}

		$seen_aliases = [];

		foreach ( $map->get_all_targets() as $target ) {
			$alias = $target->get_alias();

			if ( 1 !== preg_match( self::ALIAS_PATTERN, $alias ) ) {
				return self::error( 'invalid_alias', $alias );
			}

			if ( isset( $seen_aliases[ $alias ] ) ) {
				return self::error( 'duplicate_alias', $alias );
			}

			$seen_aliases[ $alias ] = true;
		}

		return null;
	}

	/**
	 * @param V3_Widget_Map        $map
	 * @param array<string, mixed> $controls
	 * @param V3_Map_Diagnostics   $diagnostics
	 * @return array<string, Compiled_V3_Setting>
	 */
	private function compile_settings( V3_Widget_Map $map, array $controls, V3_Map_Diagnostics $diagnostics ): array {
		$compiled = [];

		foreach ( $map->get_settings() as $public_key => $setting ) {
			$reason = $setting instanceof V3_Setting && is_string( $public_key ) && '' !== $public_key
				? $this->find_setting_error( $setting, $controls )
				: 'invalid_setting_schema';

			if ( null !== $reason ) {
				$control_key = $setting instanceof V3_Setting ? $setting->get_control_key() : '';
				$diagnostics->add( $map->get_widget_type(), self::SETTING_ENTRY_PREFIX . $public_key, $reason, $control_key );
				continue;
			}

			$compiled[ $public_key ] = $this->compile_setting( $setting, $controls[ $setting->get_control_key() ] );
		}

		return $compiled;
	}

	/**
	 * @param V3_Setting           $setting
	 * @param array<string, mixed> $control
	 */
	private function compile_setting( V3_Setting $setting, array $control ): Compiled_V3_Setting {
		$adapter = $setting->get_adapter();
		$prop_type = $adapter->prop_type( $control );

		return new Compiled_V3_Setting(
			$setting->get_control_key(),
			$setting->is_dynamic(),
			$adapter,
			$prop_type,
			$control,
			$this->build_setting_schema( $setting, $control, $prop_type )
		);
	}

	/**
	 * @param V3_Setting           $setting
	 * @param array<string, mixed> $control
	 * @param Prop_Type            $prop_type
	 * @return array<string, mixed>
	 */
	private function build_setting_schema( V3_Setting $setting, array $control, Prop_Type $prop_type ): array {
		$schema = Plain_Llm_Schema_Converter::convert( $prop_type->to_json_schema() );

		if ( null !== $setting->get_default() ) {
			$schema['default'] = $setting->get_default();
		}

		$condition = is_array( $control['condition'] ?? null ) ? V3_Control_Condition::describe( $control['condition'] ) : '';

		if ( '' !== $condition ) {
			$schema['description'] = sprintf( 'Only takes effect when %s.', $condition );
		}

		if ( $setting->is_dynamic() ) {
			$schema['dynamic'] = true;
		}

		return $schema;
	}

	private function find_setting_error( V3_Setting $setting, array $controls ): ?string {
		$control = $controls[ $setting->get_control_key() ] ?? null;

		if ( ! is_array( $control ) ) {
			return 'missing_control';
		}

		if ( $setting->is_dynamic() && ! V3_Dynamic_Resolver::is_dynamic_capable( $control ) ) {
			return 'incompatible_dynamic_control';
		}

		if ( ! $setting->get_adapter()->supports( $control ) ) {
			return 'incompatible_setting_shape';
		}

		return null;
	}

	/**
	 * @param V3_Widget_Map        $map
	 * @param array<string, mixed> $controls
	 * @param V3_Map_Diagnostics   $diagnostics
	 * @return array<string, Compiled_Style_Target>
	 */
	private function compile_targets( V3_Widget_Map $map, array $controls, V3_Map_Diagnostics $diagnostics ): array {
		$binding_compiler = new V3_Style_Binding_Compiler( $this->style_schema ?? Style_Schema::get(), $this->adapters );
		$compiled = [];

		foreach ( $map->get_all_targets() as $target ) {
			$compiled[ $target->get_alias() ] = $binding_compiler->compile( $target, $controls, $diagnostics, $map->get_widget_type() );
		}

		return $compiled;
	}

	public static function error( string $reason, string $detail ): WP_Error {
		return new WP_Error(
			self::ERROR_CODE,
			$reason,
			[
				'reason' => $reason,
				'detail' => $detail,
			]
		);
	}
}
