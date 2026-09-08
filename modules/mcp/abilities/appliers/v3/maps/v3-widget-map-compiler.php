<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

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
		'dimension' => [ 'slider' ],
		'slider' => [ 'slider' ],
		'sides' => [ 'dimensions' ],
		'dimension_side' => [ 'dimensions' ],
		'box_shadow' => [ 'box_shadow' ],
		'text' => [ 'text', 'textarea', 'select', 'choose', 'switcher', 'number', 'hidden', 'popover_toggle', 'font', 'animation', 'visual_choice' ],
		'typography' => [ 'popover_toggle', 'font', 'select', 'slider' ],
		'border' => [ 'select', 'dimensions', 'color' ],
	];

	const GROUP_KINDS = [
		Style_Control_Target::KIND_TYPOGRAPHY,
		Style_Control_Target::KIND_BORDER,
		Style_Control_Target::KIND_BOX_SHADOW,
	];

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

		$nested_error = $this->validate_settings( $map['settings'] );

		if ( $nested_error instanceof WP_Error ) {
			return $nested_error;
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
	 * @param array<string, mixed> $settings
	 * @return WP_Error|null
	 */
	private function validate_settings( array $settings ) {
		foreach ( $settings as $schema ) {
			if ( ! is_array( $schema ) ) {
				continue;
			}

			if ( $this->schema_has_nested_repeater( $schema ) ) {
				return $this->error( 'nested_repeater', 'settings' );
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

				foreach ( $states as $descriptor ) {
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

		if ( ! in_array( $descriptor['kind'], Style_Control_Target::KINDS, true ) ) {
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
				$reason = in_array( $descriptor['kind'], self::GROUP_KINDS, true )
					? 'incomplete_group_destination'
					: 'missing_control';

				return $this->error( $reason, $setting );
			}

			$resolver = $destination['resolver'] ?? $descriptor['resolver'] ?? '';
			$control_type = $controls[ $setting ]['type'] ?? '';

			if ( ! $this->is_resolver_compatible( $resolver, $control_type ) ) {
				return $this->error( 'incompatible_resolver', $setting );
			}
		}

		return null;
	}

	private function is_resolver_compatible( string $resolver, string $control_type ): bool {
		$allowed = self::COMPATIBLE_CONTROL_TYPES[ $resolver ] ?? null;

		if ( null === $allowed ) {
			return true;
		}

		return in_array( $control_type, $allowed, true );
	}

	/**
	 * @param array<string, mixed> $schema
	 */
	private function schema_has_nested_repeater( array $schema, bool $inside_repeater = false ): bool {
		$is_repeater = 'repeater' === ( $schema['type'] ?? null );

		if ( $is_repeater && $inside_repeater ) {
			return true;
		}

		$fields = $schema['fields'] ?? [];

		if ( ! is_array( $fields ) ) {
			return false;
		}

		foreach ( $fields as $field ) {
			if ( is_array( $field ) && $this->schema_has_nested_repeater( $field, $inside_repeater || $is_repeater ) ) {
				return true;
			}
		}

		return false;
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
