<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Converts an envelope-shaped JSON schema (as produced by `Prop_Type::to_json_schema()`) into the
 * plain shape the LLM should send in `element_config` / dynamic-tag `settings`.
 *
 * Rule: whenever a subschema looks like `{ type: object, properties: { $$type: {const: K}, value: V } }`,
 * replace it with the plain form of `V`, preserving top-level metadata (`description`, `examples`).
 * `anyOf` branches are recursed and duplicates are collapsed so redundant variants
 * (e.g. `string` vs `global-color-variable`) don't clutter the schema.
 */
class Plain_Llm_Schema_Converter {

	const ENVELOPE_TYPE_KEY = '$$type';

	const ENVELOPE_VALUE_KEY = 'value';

	const PRESERVED_META_KEYS = [ 'description', 'examples' ];

	public static function convert( array $schema ): array {
		return ( new self() )->walk( $schema );
	}

	private function walk( array $schema ): array {
		if ( $this->is_envelope( $schema ) ) {
			return $this->unwrap_envelope( $schema );
		}

		if ( isset( $schema['anyOf'] ) && is_array( $schema['anyOf'] ) ) {
			$schema['anyOf'] = $this->walk_any_of( $schema['anyOf'] );
		}

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			$schema['properties'] = $this->walk_properties( $schema['properties'] );
		}

		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = $this->walk( $schema['items'] );
		}

		return $schema;
	}

	private function is_envelope( array $schema ): bool {
		if ( ( $schema['type'] ?? null ) !== 'object' ) {
			return false;
		}

		$properties = $schema['properties'] ?? null;

		if ( ! is_array( $properties ) ) {
			return false;
		}

		$type_marker = $properties[ self::ENVELOPE_TYPE_KEY ] ?? null;

		if ( ! is_array( $type_marker ) || ! isset( $type_marker['const'] ) ) {
			return false;
		}

		return array_key_exists( self::ENVELOPE_VALUE_KEY, $properties );
	}

	private function unwrap_envelope( array $envelope ): array {
		$inner = $envelope['properties'][ self::ENVELOPE_VALUE_KEY ];

		$plain = is_array( $inner ) ? $this->walk( $inner ) : [];

		foreach ( self::PRESERVED_META_KEYS as $meta_key ) {
			if ( isset( $envelope[ $meta_key ] ) && ! isset( $plain[ $meta_key ] ) ) {
				$plain[ $meta_key ] = $envelope[ $meta_key ];
			}
		}

		return $plain;
	}

	private function walk_any_of( array $branches ): array {
		$converted = [];

		foreach ( $branches as $branch ) {
			$converted[] = is_array( $branch ) ? $this->walk( $branch ) : $branch;
		}

		return $this->dedupe( $converted );
	}

	private function walk_properties( array $properties ): array {
		foreach ( $properties as $key => $value ) {
			if ( is_array( $value ) ) {
				$properties[ $key ] = $this->walk( $value );
			}
		}

		return $properties;
	}

	private function dedupe( array $branches ): array {
		$seen = [];
		$unique = [];

		foreach ( $branches as $branch ) {
			$fingerprint = json_encode( $branch );

			if ( isset( $seen[ $fingerprint ] ) ) {
				continue;
			}

			$seen[ $fingerprint ] = true;
			$unique[] = $branch;
		}

		return $unique;
	}
}
