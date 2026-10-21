<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Accepts or rejects a raw plain setting value against the same JSON schema `get-widget-schemas`
 * publishes, before any resolver converts it, so the error the agent gets names a keyword it can see.
 */
class Plain_Schema_Validator {

	const ENVELOPE_TYPE_KEY = '$$type';

	const ANY_TYPE = [ 'array', 'object', 'string', 'number', 'integer', 'boolean', 'null' ];

	const STRING_OR_NUMBER = [ 'string', 'number' ];

	const COMBINING_KEYWORDS = [ 'anyOf', 'oneOf' ];

	private bool $lenient;

	private function __construct( bool $lenient ) {
		$this->lenient = $lenient;
	}

	public static function strict(): self {
		return new self( false );
	}

	/**
	 * Keeps the V4 write path's existing tolerance: unlisted object keys are left for the caller to
	 * drop with a warning, numbers are accepted where a string is published, null object keys count
	 * as not set, and `$$type` envelopes are left for `Props_Parser`.
	 */
	public static function lenient(): self {
		return new self( true );
	}

	/**
	 * @param mixed                $value  Raw value sent by the caller.
	 * @param array<string, mixed> $schema Published plain schema of the setting.
	 * @param string               $name   Setting key, used as the path root in error messages.
	 * @return array{value: mixed, error: string|null} The sanitized value, or the rejection reason.
	 */
	public function validate( $value, array $schema, string $name ): array {
		if ( $this->lenient && self::contains_envelope( $value ) ) {
			return self::accepted( $value );
		}

		if ( $this->lenient ) {
			$value = self::without_nested_nulls( $value );
		}

		$checked_schema = $this->prepare( $schema );
		$result = rest_validate_value_from_schema( $value, $checked_schema, $name );

		if ( is_wp_error( $result ) ) {
			return [
				'value' => null,
				'error' => rtrim( $result->get_error_message(), '.' ),
			];
		}

		return self::accepted( rest_sanitize_value_from_schema( $value, $checked_schema, $name ) );
	}

	/**
	 * @param mixed $value
	 * @return array{value: mixed, error: null}
	 */
	private static function accepted( $value ): array {
		return [
			'value' => $value,
			'error' => null,
		];
	}

	private function prepare( array $schema ): array {
		$is_combined = ! empty( array_intersect_key( $schema, array_flip( self::COMBINING_KEYWORDS ) ) );

		if ( ! isset( $schema['type'] ) && ! $is_combined ) {
			$schema['type'] = self::ANY_TYPE;
		}

		if ( $this->lenient && 'string' === ( $schema['type'] ?? null ) ) {
			$schema['type'] = self::STRING_OR_NUMBER;
		}

		if ( $this->lenient && false === ( $schema['additionalProperties'] ?? null ) ) {
			unset( $schema['additionalProperties'] );
		}

		foreach ( [ 'properties', 'patternProperties' ] as $keyword ) {
			if ( is_array( $schema[ $keyword ] ?? null ) ) {
				$schema[ $keyword ] = array_map( fn( $child ) => is_array( $child ) ? $this->prepare( $child ) : $child, $schema[ $keyword ] );
			}
		}

		foreach ( self::COMBINING_KEYWORDS as $keyword ) {
			if ( is_array( $schema[ $keyword ] ?? null ) ) {
				$schema[ $keyword ] = array_map( fn( $branch ) => is_array( $branch ) ? $this->prepare( $branch ) : $branch, $schema[ $keyword ] );
			}
		}

		if ( is_array( $schema['items'] ?? null ) ) {
			$schema['items'] = $this->prepare( $schema['items'] );
		}

		return $schema;
	}

	/**
	 * The V4 structure read returns unset object keys as null, and V4 props read null as not set.
	 *
	 * @param mixed $value
	 * @return mixed
	 */
	private static function without_nested_nulls( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		$is_list = array_values( $value ) === $value;
		$kept = [];

		foreach ( $value as $key => $child ) {
			if ( null === $child && ! $is_list ) {
				continue;
			}

			$kept[ $key ] = self::without_nested_nulls( $child );
		}

		return $kept;
	}

	/**
	 * @param mixed $value
	 */
	private static function contains_envelope( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( array_key_exists( self::ENVELOPE_TYPE_KEY, $value ) ) {
			return true;
		}

		foreach ( $value as $child ) {
			if ( self::contains_envelope( $child ) ) {
				return true;
			}
		}

		return false;
	}
}
