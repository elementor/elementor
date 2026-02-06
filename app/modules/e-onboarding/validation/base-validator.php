<?php

namespace Elementor\App\Modules\E_Onboarding\Validation;

use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Base_Validator {

	protected array $errors = [];

	abstract protected function get_rules(): array;

	/**
	 * @param array $params
	 * @return array|WP_Error
	 */
	public function validate( array $params ) {
		if ( ! is_array( $params ) ) {
			return new WP_Error( 'invalid_params', 'Parameters must be an array.', [ 'status' => 400 ] );
		}

		$this->errors = [];
		$validated = [];

		foreach ( $this->get_rules() as $field => $rule ) {
			if ( ! array_key_exists( $field, $params ) ) {
				continue;
			}

			$result = $this->validate_field( $field, $params[ $field ], $rule );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			$validated[ $field ] = $result;
		}

		return $validated;
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @param array  $rule
	 * @return mixed|WP_Error
	 */
	protected function validate_field( string $field, $value, array $rule ) {
		$type = $rule['type'] ?? 'string';
		$nullable = $rule['nullable'] ?? false;

		if ( null === $value ) {
			if ( $nullable ) {
				return null;
			}

			return $this->error( $field, "{$field} cannot be null." );
		}

		switch ( $type ) {
			case 'string':
				return $this->validate_string( $field, $value );
			case 'int':
				return $this->validate_int( $field, $value );
			case 'bool':
				return $this->validate_bool( $field, $value );
			case 'array':
				return $this->validate_array( $field, $value, $rule );
			case 'string_array':
				return $this->validate_string_array( $field, $value );
			case 'custom_data':
				return $this->validate_custom_data( $field, $value );
			default:
				return $value;
		}
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return string|WP_Error
	 */
	protected function validate_string( string $field, $value ) {
		if ( ! is_string( $value ) ) {
			return $this->error( $field, "{$field} must be a string." );
		}

		return sanitize_text_field( $value );
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return int|WP_Error
	 */
	protected function validate_int( string $field, $value ) {
		if ( ! is_numeric( $value ) ) {
			return $this->error( $field, "{$field} must be a number." );
		}

		return (int) $value;
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return bool|WP_Error
	 */
	protected function validate_bool( string $field, $value ) {
		if ( ! is_bool( $value ) ) {
			return $this->error( $field, "{$field} must be a boolean." );
		}

		return $value;
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @param array  $rule
	 * @return array|WP_Error
	 */
	protected function validate_array( string $field, $value, array $rule ) {
		if ( ! is_array( $value ) ) {
			return $this->error( $field, "{$field} must be an array." );
		}

		$allowed = $rule['allowed'] ?? null;

		if ( $allowed && ! in_array( $value, $allowed, true ) ) {
			return $this->error( $field, "{$field} contains invalid value." );
		}

		return $value;
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return array|WP_Error
	 */
	protected function validate_string_array( string $field, $value ) {
		if ( ! is_array( $value ) ) {
			return $this->error( $field, "{$field} must be an array." );
		}

		return array_values(
			array_filter(
				array_map(
					static function ( $item ) {
						return is_string( $item ) ? sanitize_text_field( $item ) : null;
					},
					$value
				),
				static function ( $item ) {
					return null !== $item;
				}
			)
		);
	}

	/**
	 * @param string $field
	 * @param mixed  $value
	 * @return array|WP_Error
	 */
	protected function validate_custom_data( string $field, $value ) {
		if ( ! is_array( $value ) ) {
			return $this->error( $field, "{$field} must be an array." );
		}

		return $this->sanitize_recursive( $value );
	}

	protected function sanitize_recursive( array $data ): array {
		$sanitized = [];

		foreach ( $data as $key => $value ) {
			$safe_key = sanitize_key( $key );

			if ( is_string( $value ) ) {
				$sanitized[ $safe_key ] = sanitize_text_field( $value );
			} elseif ( is_array( $value ) ) {
				$sanitized[ $safe_key ] = $this->sanitize_recursive( $value );
			} elseif ( is_numeric( $value ) || is_bool( $value ) || null === $value ) {
				$sanitized[ $safe_key ] = $value;
			} else {
				$sanitized[ $safe_key ] = null;
			}
		}

		return $sanitized;
	}

	protected function error( string $field, string $message ): WP_Error {
		return new WP_Error(
			'invalid_' . $field,
			$message,
			[ 'status' => 400 ]
		);
	}
}
