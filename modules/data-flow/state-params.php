<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Params {
	const DATA_KEY = 'state_params';
	const VALUES_DATA_KEY = 'state';
	const TYPE_STRING = 'string';
	const TYPE_NUMBER = 'number';
	const TYPE_BOOLEAN = 'boolean';
	const TYPE_JSON = 'json';
	const TYPES = [ self::TYPE_STRING, self::TYPE_NUMBER, self::TYPE_BOOLEAN, self::TYPE_JSON ];
	const MAX_PARAMS = 20;
	const MAX_LABEL_LENGTH = 100;
	const MAX_ENCODED_VALUE_LENGTH = 10000;
	const KEY_PATTERN = '/^[A-Za-z_]\w*$/';
	const PARENT_BINDING_PATTERN = '/^\{\{\s*state\.([\w.]+)\s*\}\}$/';
	const BOOLEAN_STRINGS = [
		'true' => true,
		'false' => false,
	];

	public static function sanitize( $params ): array {
		$params = self::decode( $params );

		if ( ! is_array( $params ) ) {
			return [];
		}

		$sanitized = [];

		foreach ( $params as $param ) {
			if ( ! self::is_valid_param( $param ) || isset( $sanitized[ $param['key'] ] ) ) {
				continue;
			}

			$sanitized[ $param['key'] ] = [
				'key' => $param['key'],
				'label' => self::sanitize_label( $param['label'] ?? '', $param['key'] ),
				'type' => $param['type'],
				'default' => self::sanitize_default( $param['default'] ?? null, $param['type'] ),
			];
		}

		return array_slice( array_values( $sanitized ), 0, self::MAX_PARAMS );
	}

	public static function sanitize_values( $values ): array {
		$values = self::decode( $values );

		if ( ! is_array( $values ) || array_values( $values ) === $values ) {
			return [];
		}

		$sanitized = [];

		foreach ( $values as $key => $value ) {
			if ( self::is_valid_key( $key ) && self::is_within_size_limit( $value ) ) {
				$sanitized[ $key ] = $value;
			}
		}

		return array_slice( $sanitized, 0, self::MAX_PARAMS, true );
	}

	public static function coerce( $value, string $type, &$coerced ): bool {
		$coerced = null;
		$result = self::to_type( $value, $type );

		if ( null === $result || ! self::is_within_size_limit( $result['value'] ) ) {
			return false;
		}

		$coerced = $result['value'];

		return true;
	}

	public static function is_parent_binding( $value ): bool {
		return is_string( $value ) && 1 === preg_match( self::PARENT_BINDING_PATTERN, $value );
	}

	public static function resolve( array $params, array $parent_state ): array {
		$state = [];

		foreach ( $params as $param ) {
			$value = self::is_parent_binding( $param['default'] )
				? self::get_bound_value( $param['default'], array_merge( $parent_state, $state ) )
				: $param['default'];

			$state[ $param['key'] ] = self::coerce( $value, $param['type'], $coerced )
				? $coerced
				: self::get_empty_value( $param['type'] );
		}

		return $state;
	}

	/**
	 * @return array{params: array, unknown_keys: string[], invalid_keys: string[]}
	 */
	public static function apply_values( array $params, array $values ): array {
		$declared_keys = array_column( $params, 'key' );
		$invalid_keys = [];

		foreach ( $params as $index => $param ) {
			if ( ! array_key_exists( $param['key'], $values ) ) {
				continue;
			}

			$value = $values[ $param['key'] ];

			if ( self::is_parent_binding( $value ) ) {
				$params[ $index ]['default'] = $value;
				continue;
			}

			if ( self::coerce( $value, $param['type'], $coerced ) ) {
				$params[ $index ]['default'] = $coerced;
				continue;
			}

			$invalid_keys[] = $param['key'];
		}

		return [
			'params' => $params,
			'unknown_keys' => array_values( array_diff( array_keys( $values ), $declared_keys ) ),
			'invalid_keys' => $invalid_keys,
		];
	}

	/**
	 * @return array{params: array, duplicate_keys: string[]}
	 */
	public static function merge_roots( array $roots_params ): array {
		$merged = [];
		$duplicate_keys = [];

		foreach ( $roots_params as $root_params ) {
			foreach ( $root_params as $param ) {
				if ( isset( $merged[ $param['key'] ] ) ) {
					$duplicate_keys[] = $param['key'];
					continue;
				}

				$merged[ $param['key'] ] = $param;
			}
		}

		return [
			'params' => array_values( $merged ),
			'duplicate_keys' => array_values( array_unique( $duplicate_keys ) ),
		];
	}

	public static function get_empty_value( string $type ) {
		switch ( $type ) {
			case self::TYPE_NUMBER:
				return 0;
			case self::TYPE_BOOLEAN:
				return false;
			case self::TYPE_JSON:
				return null;
			default:
				return '';
		}
	}

	private static function to_type( $value, string $type ): ?array {
		switch ( $type ) {
			case self::TYPE_STRING:
				return self::to_string( $value );
			case self::TYPE_NUMBER:
				return self::to_number( $value );
			case self::TYPE_BOOLEAN:
				return self::to_boolean( $value );
			case self::TYPE_JSON:
				return self::to_json( $value );
			default:
				return null;
		}
	}

	private static function to_string( $value ): ?array {
		if ( is_string( $value ) || is_int( $value ) || is_float( $value ) ) {
			return [ 'value' => (string) $value ];
		}

		return null;
	}

	private static function to_number( $value ): ?array {
		if ( is_bool( $value ) || ! is_numeric( $value ) ) {
			return null;
		}

		return [ 'value' => $value + 0 ];
	}

	private static function to_boolean( $value ): ?array {
		if ( is_bool( $value ) ) {
			return [ 'value' => $value ];
		}

		if ( 0 === $value || 1 === $value ) {
			return [ 'value' => 1 === $value ];
		}

		if ( is_string( $value ) && array_key_exists( strtolower( $value ), self::BOOLEAN_STRINGS ) ) {
			return [ 'value' => self::BOOLEAN_STRINGS[ strtolower( $value ) ] ];
		}

		return null;
	}

	private static function to_json( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return [ 'value' => $value ];
		}

		$decoded = json_decode( $value, true );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return null;
		}

		return [ 'value' => $decoded ];
	}

	private static function decode( $value ) {
		return is_string( $value ) ? json_decode( $value, true ) : $value;
	}

	private static function is_valid_param( $param ): bool {
		return is_array( $param )
			&& isset( $param['key'], $param['type'] )
			&& self::is_valid_key( $param['key'] )
			&& in_array( $param['type'], self::TYPES, true );
	}

	private static function is_valid_key( $key ): bool {
		return is_string( $key ) && 1 === preg_match( self::KEY_PATTERN, $key );
	}

	private static function sanitize_label( $label, string $key ): string {
		$label = is_string( $label ) ? trim( $label ) : '';

		return '' === $label ? $key : mb_substr( $label, 0, self::MAX_LABEL_LENGTH );
	}

	private static function sanitize_default( $value, string $type ) {
		if ( self::is_parent_binding( $value ) ) {
			return $value;
		}

		return self::coerce( $value, $type, $coerced ) ? $coerced : self::get_empty_value( $type );
	}

	private static function get_bound_value( string $binding, array $state ) {
		preg_match( self::PARENT_BINDING_PATTERN, $binding, $match );

		return array_reduce(
			explode( '.', $match[1] ),
			fn( $value, $segment ) => is_array( $value ) && array_key_exists( $segment, $value ) ? $value[ $segment ] : null,
			$state
		);
	}

	private static function is_within_size_limit( $value ): bool {
		$encoded = wp_json_encode( $value );

		return false !== $encoded && strlen( $encoded ) <= self::MAX_ENCODED_VALUE_LENGTH;
	}
}
