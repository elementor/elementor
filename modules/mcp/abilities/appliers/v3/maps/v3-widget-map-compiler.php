<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Compiler {

	const ERROR_CODE = 'elementor_v3_map_invalid';

	const REQUIRED_FIELDS = [
		'widget_type',
		'description',
		'settings',
		'default_style_target',
		'style_targets',
	];

	const ALIAS_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

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
	 * @param array<string, mixed> $map
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>|WP_Error
	 */
	public function compile( array $map, array $controls, ?string $expected_widget_type = null ) {
		$shape_error = $this->validate_map_shape( $map, $expected_widget_type );

		if ( $shape_error instanceof WP_Error ) {
			return $shape_error;
		}

		$settings_error = $this->validate_settings( $map, $controls );

		if ( $settings_error instanceof WP_Error ) {
			return $settings_error;
		}

		return $this->validate_style_targets( $map, $controls );
	}

	/**
	 * @param array<string, mixed> $map
	 * @return WP_Error|null
	 */
	private function validate_map_shape( array $map, ?string $expected_widget_type ) {
		foreach ( self::REQUIRED_FIELDS as $field ) {
			if ( ! array_key_exists( $field, $map ) || ( is_string( $map[ $field ] ) && '' === $map[ $field ] ) ) {
				return self::error( 'missing_field', $field );
			}
		}

		if ( null !== $expected_widget_type && $expected_widget_type !== $map['widget_type'] ) {
			return self::error( 'widget_type_mismatch', $map['widget_type'] );
		}

		if ( ! is_array( $map['settings'] ) || ! is_array( $map['style_targets'] ) || empty( $map['style_targets'] ) ) {
			return self::error( 'missing_field', 'style_targets' );
		}

		if ( ! isset( $map['style_targets'][ $map['default_style_target'] ] ) ) {
			return self::error( 'missing_default_style_target', $map['default_style_target'] );
		}

		return null;
	}

	/**
	 * @param array<string, mixed> $map
	 * @param array<string, mixed> $controls
	 * @return WP_Error|null
	 */
	private function validate_settings( array $map, array $controls ) {
		foreach ( $map['settings'] as $public_key => $schema ) {
			if ( ! is_string( $public_key ) || '' === $public_key || ! is_array( $schema ) ) {
				return self::error( 'invalid_setting_schema', (string) $public_key );
			}

			$control_key = $schema['key'] ?? $public_key;

			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $controls[ $control_key ] ?? null ) ) {
				return self::error( 'missing_control', is_string( $control_key ) ? $control_key : '' );
			}

			if ( true === ( $schema['dynamic'] ?? false ) && ! V3_Dynamic_Resolver::is_dynamic_capable( $controls[ $control_key ] ) ) {
				return self::error( 'incompatible_dynamic_control', $control_key );
			}

			if ( Setting_Schemas::KIND_LINK === ( $schema['kind'] ?? null ) && 'url' !== ( $controls[ $control_key ]['type'] ?? '' ) ) {
				return self::error( 'incompatible_setting_shape', $control_key );
			}
		}

		return null;
	}

	/**
	 * @param array<string, mixed> $map
	 * @param array<string, mixed> $controls
	 * @return array<string, mixed>|WP_Error
	 */
	private function validate_style_targets( array $map, array $controls ) {
		$binding_compiler = new V3_Style_Binding_Compiler( $this->style_schema ?? Style_Schema::get(), $this->adapters );
		$compiled_targets = [];

		foreach ( $map['style_targets'] as $alias => $target ) {
			if ( ! is_string( $alias ) || 1 !== preg_match( self::ALIAS_PATTERN, $alias ) ) {
				return self::error( 'invalid_alias', (string) $alias );
			}

			if ( ! $target instanceof Style_Target ) {
				return self::error( 'invalid_style_target', $alias );
			}

			$bindings = $binding_compiler->compile( $target, $controls );

			if ( $bindings instanceof WP_Error ) {
				return $bindings;
			}

			$compiled_targets[ $alias ] = [
				'label' => $target->get_label(),
				'bindings' => $bindings,
			];
		}

		$map['style_targets'] = $compiled_targets;

		return $map;
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
