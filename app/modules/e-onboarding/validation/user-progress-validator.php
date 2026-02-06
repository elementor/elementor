<?php

namespace Elementor\App\Modules\E_Onboarding\Validation;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Progress_Validator extends Base_Validator {

	private const ALLOWED_EXIT_TYPES = [ 'user_exit', 'unexpected', null, '' ];

	protected function get_rules(): array {
		return [
			'current_step' => [
				'type' => 'int',
			],
			'completed_steps' => [
				'type' => 'mixed_array',
			],
			'exit_type' => [
				'type' => 'exit_type',
				'nullable' => true,
			],
			'complete_step' => [
				'type' => 'string_or_int',
			],
			'total_steps' => [
				'type' => 'int',
			],
			'start' => [
				'type' => 'bool',
			],
			'complete' => [
				'type' => 'bool',
			],
			'user_exit' => [
				'type' => 'bool',
			],
		];
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @param array  $rule
	 * @return mixed|WP_Error
	 */
	protected function validate_field( string $field, $value, array $rule ) {
		$type = $rule['type'] ?? 'string';

		switch ( $type ) {
			case 'exit_type':
				return $this->validate_exit_type( $value );
			case 'string_or_int':
				return $this->validate_string_or_int( $field, $value );
			case 'mixed_array':
				return $this->validate_mixed_array( $field, $value );
			default:
				return parent::validate_field( $field, $value, $rule );
		}
	}

	/**
	 * @param mixed $value
	 * @return string|null|WP_Error
	 */
	private function validate_exit_type( $value ) {
		if ( ! in_array( $value, self::ALLOWED_EXIT_TYPES, true ) ) {
			return $this->error( 'exit_type', 'Exit type is invalid.' );
		}

		return '' === $value ? null : $value;
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return string|int|WP_Error
	 */
	private function validate_string_or_int( string $field, $value ) {
		if ( is_numeric( $value ) ) {
			return (int) $value;
		}

		if ( is_string( $value ) ) {
			return sanitize_text_field( $value );
		}

		return $this->error( $field, "{$field} must be a number or string." );
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return array|WP_Error
	 */
	private function validate_mixed_array( string $field, $value ) {
		if ( ! is_array( $value ) ) {
			return $this->error( $field, "{$field} must be an array." );
		}

		return array_values(
			array_filter(
				array_map(
					static function ( $item ) {
						if ( is_numeric( $item ) ) {
							return (int) $item;
						}

						if ( is_string( $item ) ) {
							return sanitize_text_field( $item );
						}

						return null;
					},
					$value
				),
				static function ( $item ) {
					return null !== $item;
				}
			)
		);
	}
}
