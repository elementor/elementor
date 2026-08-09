<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds a JSON-Schema shaped object from a V3 widget's legacy controls stack,
 * filtered to an allowlist of behavior keys.
 *
 * Legacy control types are mapped to plain JSON Schema:
 *  - text / textarea / wysiwyg / code / hidden / color / date-time -> string
 *  - number             -> number
 *  - switcher           -> boolean-ish string ("yes" | "")
 *  - select / choose    -> string with enum (from options keys or values)
 *  - url                -> object { url, is_external, nofollow }
 *  - media              -> object { url, id }
 *  - icons              -> object { value, library }
 *  - slider             -> object { size, unit }
 *  - dimensions         -> object { top, right, bottom, left, unit, isLinked }
 *  - repeater           -> array (item shape omitted; legacy repeater fields are not introspected)
 *
 * Layout wrappers (`section`, `tab`, `tabs`) are always dropped.
 */
class V3_Json_Schema_Builder {

	const LAYOUT_CONTROL_TYPES = [ 'section', 'tab', 'tabs' ];

	/**
	 * @param mixed         $controls     Widget controls stack.
	 * @param string[]|null $allowed_keys When provided, only these keys are emitted.
	 * @return array{properties: array<string, array>, required: string[]}
	 */
	public static function build( $controls, ?array $allowed_keys = null ): array {
		if ( ! is_array( $controls ) || empty( $controls ) ) {
			return [
				'properties' => [],
				'required' => [],
			];
		}

		$allowed_lookup = null === $allowed_keys
			? null
			: array_fill_keys( $allowed_keys, true );

		$properties = [];

		foreach ( $controls as $control_key => $control ) {
			if ( ! is_array( $control ) || ! is_string( $control_key ) ) {
				continue;
			}

			if ( null !== $allowed_lookup && ! isset( $allowed_lookup[ $control_key ] ) ) {
				continue;
			}

			$control_type = is_string( $control['type'] ?? null ) ? $control['type'] : null;

			if ( $control_type && in_array( $control_type, self::LAYOUT_CONTROL_TYPES, true ) ) {
				continue;
			}

			$entry = self::build_entry( $control, $control_type );
			if ( null === $entry ) {
				continue;
			}

			$properties[ $control_key ] = $entry;
		}

		return [
			'properties' => $properties,
			'required' => [],
		];
	}

	private static function build_entry( array $control, ?string $control_type ): ?array {
		$entry = self::type_entry( $control, $control_type );

		if ( array_key_exists( 'default', $control ) && ! self::has_object_shape( $entry ) ) {
			$entry['default'] = $control['default'];
		}

		if ( isset( $control['description'] ) && is_string( $control['description'] ) ) {
			$entry['description'] = trim( strip_tags( $control['description'] ) );
		}

		return $entry;
	}

	private static function type_entry( array $control, ?string $control_type ): array {
		switch ( $control_type ) {
			case 'number':
				return [ 'type' => 'number' ];

			case 'switcher':
				return [
					'type' => 'string',
					'enum' => [ 'yes', '' ],
				];

			case 'select':
			case 'select2':
			case 'choose':
				return self::enum_entry( $control );

			case 'url':
				return [
					'type' => 'object',
					'properties' => [
						'url' => [ 'type' => 'string' ],
						'is_external' => [ 'type' => 'string', 'enum' => [ 'on', '' ] ],
						'nofollow' => [ 'type' => 'string', 'enum' => [ 'on', '' ] ],
					],
				];

			case 'media':
				return [
					'type' => 'object',
					'properties' => [
						'url' => [ 'type' => 'string' ],
						'id' => [ 'type' => 'number' ],
					],
				];

			case 'icons':
				return [
					'type' => 'object',
					'properties' => [
						'value' => [ 'type' => 'string' ],
						'library' => [ 'type' => 'string' ],
					],
				];

			case 'slider':
				return [
					'type' => 'object',
					'properties' => [
						'size' => [ 'type' => 'number' ],
						'unit' => [ 'type' => 'string' ],
					],
				];

			case 'dimensions':
				return [
					'type' => 'object',
					'properties' => [
						'top' => [ 'type' => 'string' ],
						'right' => [ 'type' => 'string' ],
						'bottom' => [ 'type' => 'string' ],
						'left' => [ 'type' => 'string' ],
						'unit' => [ 'type' => 'string' ],
						'isLinked' => [ 'type' => 'boolean' ],
					],
				];

			case 'repeater':
				return [
					'type' => 'array',
					'items' => [ 'type' => 'object' ],
				];

			default:
				return [ 'type' => 'string' ];
		}
	}

	private static function enum_entry( array $control ): array {
		$entry = [ 'type' => 'string' ];

		$options = $control['options'] ?? null;
		if ( is_array( $options ) && ! empty( $options ) ) {
			$entry['enum'] = self::is_associative_array( $options )
				? array_keys( $options )
				: array_values( $options );
		}

		return $entry;
	}

	private static function has_object_shape( array $entry ): bool {
		$type = $entry['type'] ?? null;
		return 'object' === $type || 'array' === $type;
	}

	private static function is_associative_array( array $arr ): bool {
		return array_keys( $arr ) !== range( 0, count( $arr ) - 1 );
	}
}
