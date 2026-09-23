<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Widget_Map_Compiler {

	const ERROR_CODE = 'elementor_v3_map_invalid';

	const CATALOG_VISIBILITY_ALWAYS = 'always';
	const CATALOG_VISIBILITY_V4_DISABLED = 'v4_disabled';

	const REQUIRED_FIELDS = [
		'widget_type',
		'description',
		'catalog_visibility',
		'settings',
		'default_style_target',
		'style_targets',
	];

	const COMPATIBLE_CONTROL_TYPES = [
		'color' => [ 'color' ],
		'slider' => [ 'slider' ],
		'dimension' => [ 'slider' ],
		'line_height' => [ 'slider' ],
		'sides' => [ 'dimensions' ],
		Style_Control_Target::TYPOGRAPHY_TOGGLE_RESOLVER => [ 'popover_toggle' ],
	];

	const SUPPORTED_DESCRIPTOR_KINDS = [
		Style_Control_Target::KIND_SIMPLE,
		Style_Control_Target::KIND_TYPOGRAPHY,
	];

	const ALLOWED_STATE_KEYS = [ 'default', 'hover' ];

	const RESPONSIVE_PROBE_SUFFIX = '_mobile';

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
				return $this->error( 'missing_field', $field );
			}
		}

		if ( null !== $expected_widget_type && $expected_widget_type !== $map['widget_type'] ) {
			return $this->error( 'widget_type_mismatch', $map['widget_type'] );
		}

		if ( ! in_array( $map['catalog_visibility'], [ self::CATALOG_VISIBILITY_ALWAYS, self::CATALOG_VISIBILITY_V4_DISABLED ], true ) ) {
			return $this->error( 'invalid_visibility', $map['catalog_visibility'] );
		}

		if ( ! is_array( $map['settings'] ) || ! is_array( $map['style_targets'] ) || empty( $map['style_targets'] ) ) {
			return $this->error( 'missing_field', 'style_targets' );
		}

		if ( ! isset( $map['style_targets'][ $map['default_style_target'] ] ) ) {
			return $this->error( 'missing_default_style_target', $map['default_style_target'] );
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
				return $this->error( 'invalid_setting_schema', (string) $public_key );
			}

			$control_key = $schema['key'] ?? $public_key;

			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $controls[ $control_key ] ?? null ) ) {
				return $this->error( 'missing_control', is_string( $control_key ) ? $control_key : '' );
			}

			if ( true === ( $schema['dynamic'] ?? false ) && ! V3_Dynamic_Resolver::is_dynamic_capable( $controls[ $control_key ] ) ) {
				return $this->error( 'incompatible_dynamic_control', $control_key );
			}

			if ( Setting_Schemas::KIND_LINK === ( $schema['kind'] ?? null ) && 'url' !== ( $controls[ $control_key ]['type'] ?? '' ) ) {
				return $this->error( 'incompatible_setting_shape', $control_key );
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
		foreach ( $map['style_targets'] as $alias => $target ) {
			if ( ! is_string( $alias ) || 1 !== preg_match( '/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $alias ) ) {
				return $this->error( 'invalid_alias', (string) $alias );
			}

			if ( ! is_array( $target ) || ! is_array( $target['css_properties'] ?? null ) ) {
				return $this->error( 'missing_field', 'css_properties' );
			}

			foreach ( $target['css_properties'] as $property => $states ) {
				if ( ! is_array( $states ) ) {
					return $this->error( 'missing_field', (string) $property );
				}

				foreach ( $states as $state_key => $descriptor ) {
					if ( ! in_array( $state_key, self::ALLOWED_STATE_KEYS, true ) ) {
						return $this->error( 'invalid_state_key', (string) $state_key );
					}

					$descriptor_error = $this->validate_descriptor( $descriptor, $controls );

					if ( $descriptor_error instanceof WP_Error ) {
						return $descriptor_error;
					}
				}
			}
		}

		return $map;
	}

	/**
	 * @param mixed                $descriptor
	 * @param array<string, mixed> $controls
	 * @return WP_Error|null
	 */
	private function validate_descriptor( $descriptor, array $controls ) {
		if ( ! is_array( $descriptor ) || ! is_string( $descriptor['kind'] ?? null ) ) {
			return $this->error( 'invalid_descriptor_kind', '' );
		}

		if ( ! in_array( $descriptor['kind'], self::SUPPORTED_DESCRIPTOR_KINDS, true ) ) {
			return $this->error( 'invalid_descriptor_kind', $descriptor['kind'] );
		}

		$destinations = $descriptor['destinations'] ?? null;

		if ( ! is_array( $destinations ) || empty( $destinations ) ) {
			return $this->error( 'missing_field', 'destinations' );
		}

		foreach ( $destinations as $destination ) {
			$setting = $destination['setting'] ?? null;

			if ( ! is_string( $setting ) || '' === $setting ) {
				return $this->error( 'missing_control', '' );
			}

			if ( ! isset( $controls[ $setting ] ) ) {
				return $this->error( 'missing_control', $setting );
			}

			$resolver = $destination['resolver'] ?? $descriptor['resolver'] ?? '';
			$control_type = $controls[ $setting ]['type'] ?? '';

			if ( ! $this->is_resolver_compatible( $resolver, $control_type ) ) {
				return $this->error( 'incompatible_resolver', $setting );
			}
		}

		$primary_setting = $destinations[0]['setting'];

		if ( ! empty( $descriptor['responsive'] ) && ! $this->is_responsive_control( $primary_setting, $controls ) ) {
			return $this->error( 'incompatible_responsive_control', $primary_setting );
		}

		return null;
	}

	/**
	 * Responsive controls are either registered once with `is_responsive` (when responsive
	 * control duplication is off) or duplicated per device with a `_<device>` suffix.
	 *
	 * @param string               $setting
	 * @param array<string, mixed> $controls
	 */
	private function is_responsive_control( string $setting, array $controls ): bool {
		return ! empty( $controls[ $setting ]['is_responsive'] )
			|| isset( $controls[ $setting . self::RESPONSIVE_PROBE_SUFFIX ] );
	}

	private function is_resolver_compatible( string $resolver, string $control_type ): bool {
		$allowed = self::COMPATIBLE_CONTROL_TYPES[ $resolver ] ?? null;

		if ( null === $allowed ) {
			return true;
		}

		return in_array( $control_type, $allowed, true );
	}

	private function error( string $reason, string $detail ): WP_Error {
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
