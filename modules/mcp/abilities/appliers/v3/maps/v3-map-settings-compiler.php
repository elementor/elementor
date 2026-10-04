<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Dynamic_Resolver;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Validates a map's `settings` against the registered controls and resolves the parts that
 * depend on them: `enum_from_control` options, the switcher `return_value`, and each
 * control's `condition`.
 */
class V3_Map_Settings_Compiler {

	/**
	 * @param array<string, mixed> $settings
	 * @param array<string, mixed> $controls
	 * @return array<string, array<string, mixed>>|WP_Error
	 */
	public function compile( array $settings, array $controls ) {
		$compiled = [];

		foreach ( $settings as $public_key => $schema ) {
			if ( ! is_string( $public_key ) || '' === $public_key || ! is_array( $schema ) ) {
				return $this->error( 'invalid_setting_schema', (string) $public_key );
			}

			$control_key = $schema['key'] ?? $public_key;

			if ( ! is_string( $control_key ) || '' === $control_key || ! is_array( $controls[ $control_key ] ?? null ) ) {
				return $this->error( 'missing_control', is_string( $control_key ) ? $control_key : '' );
			}

			$compiled_schema = $this->compile_schema( $schema, $controls[ $control_key ], $control_key );

			if ( $compiled_schema instanceof WP_Error ) {
				return $compiled_schema;
			}

			$compiled[ $public_key ] = $compiled_schema;
		}

		return $compiled;
	}

	/**
	 * @return array<string, mixed>|WP_Error
	 */
	private function compile_schema( array $schema, array $control, string $control_key ) {
		if ( true === ( $schema['dynamic'] ?? false ) && ! V3_Dynamic_Resolver::is_dynamic_capable( $control ) ) {
			return $this->error( 'incompatible_dynamic_control', $control_key );
		}

		$kind = $schema['kind'] ?? null;
		$allowed_types = Setting_Schemas::CONTROL_TYPES_BY_KIND[ $kind ] ?? null;

		if ( null !== $allowed_types && ! in_array( $control['type'] ?? '', $allowed_types, true ) ) {
			return $this->error( 'incompatible_setting_shape', $control_key );
		}

		if ( Setting_Schemas::KIND_ENUM_FROM_CONTROL === $kind ) {
			$options = is_array( $control['options'] ?? null ) ? array_map( 'strval', array_keys( $control['options'] ) ) : [];

			if ( empty( $options ) ) {
				return $this->error( 'incompatible_setting_shape', $control_key );
			}

			$schema['enum'] = $options;
		}

		if ( Setting_Schemas::KIND_SWITCHER === $kind ) {
			$schema['convert'] = [
				'true' => (string) ( $control['return_value'] ?? Setting_Schemas::SWITCHER_DEFAULT_RETURN_VALUE ),
				'false' => '',
			];
		}

		if ( ! empty( $control['condition'] ) && is_array( $control['condition'] ) ) {
			$schema['condition'] = $control['condition'];
		}

		return $schema;
	}

	private function error( string $reason, string $detail ): WP_Error {
		return new WP_Error(
			V3_Widget_Map_Compiler::ERROR_CODE,
			$reason,
			[
				'reason' => $reason,
				'detail' => $detail,
			]
		);
	}
}
