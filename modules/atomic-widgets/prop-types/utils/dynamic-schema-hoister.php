<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Deduplicates the dynamic-tag branch that appears once per dynamic-capable field of a widget.
 *
 * The dynamic subschema is bulky (long description + full tag-name enum) and repeats verbatim across
 * every prop that accepts a dynamic value. This walker detects those branches structurally, hoists
 * each unique variant (keyed by its sorted `name.enum`) into a shared `$defs` map, and replaces every
 * in-tree occurrence with a local `{ "$ref": "#/$defs/<key>" }`. Semantics are preserved; payload
 * size is cut substantially on real widgets.
 */
class Dynamic_Schema_Hoister {

	const DEFS_KEY = '$defs';

	const DEF_NAME_PREFIX = 'dynamic_';

	const DYNAMIC_TAGS_RESOURCE_MARKER = 'elementor://dynamic-tags';

	/**
	 * @param array<string, array> $properties Widget properties (after plain-LLM conversion).
	 * @return array{properties: array<string, array>, defs: array<string, array>}
	 */
	public static function hoist( array $properties ): array {
		$hoister = new self();

		foreach ( $properties as $key => $schema ) {
			$properties[ $key ] = $hoister->walk( $schema );
		}

		return [
			'properties' => $properties,
			'defs' => $hoister->defs,
		];
	}

	/** @var array<string, array> */
	private array $defs = [];

	/** @var array<string, string> Fingerprint => def name. */
	private array $fingerprint_to_name = [];

	private function walk( $schema ) {
		if ( ! is_array( $schema ) ) {
			return $schema;
		}

		if ( $this->is_dynamic_branch( $schema ) ) {
			return $this->hoist_branch( $schema );
		}

		if ( isset( $schema['anyOf'] ) && is_array( $schema['anyOf'] ) ) {
			foreach ( $schema['anyOf'] as $i => $branch ) {
				$schema['anyOf'][ $i ] = $this->walk( $branch );
			}
		}

		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			foreach ( $schema['properties'] as $key => $sub ) {
				$schema['properties'][ $key ] = $this->walk( $sub );
			}
		}

		if ( isset( $schema['items'] ) && is_array( $schema['items'] ) ) {
			$schema['items'] = $this->walk( $schema['items'] );
		}

		return $schema;
	}

	private function is_dynamic_branch( array $schema ): bool {
		if ( ( $schema['type'] ?? null ) !== 'object' ) {
			return false;
		}

		$properties = $schema['properties'] ?? null;

		if ( ! is_array( $properties ) || ! isset( $properties['name'], $properties['settings'] ) ) {
			return false;
		}

		$name_description = $properties['name']['description'] ?? '';

		if ( ! is_string( $name_description ) || false === strpos( $name_description, self::DYNAMIC_TAGS_RESOURCE_MARKER ) ) {
			return false;
		}

		if ( ( $properties['settings']['type'] ?? null ) !== 'object' ) {
			return false;
		}

		$required = $schema['required'] ?? null;

		return is_array( $required ) && in_array( 'name', $required, true );
	}

	private function hoist_branch( array $branch ): array {
		$fingerprint = $this->fingerprint( $branch );

		if ( ! isset( $this->fingerprint_to_name[ $fingerprint ] ) ) {
			$name = $this->allocate_name( $fingerprint );
			$this->fingerprint_to_name[ $fingerprint ] = $name;
			$this->defs[ $name ] = $branch;
		}

		return [ '$ref' => '#/' . self::DEFS_KEY . '/' . $this->fingerprint_to_name[ $fingerprint ] ];
	}

	private function fingerprint( array $branch ): string {
		$enum = $branch['properties']['name']['enum'] ?? null;

		if ( ! is_array( $enum ) || empty( $enum ) ) {
			return 'any';
		}

		$sorted = $enum;
		sort( $sorted );

		return md5( implode( '|', $sorted ) );
	}

	private function allocate_name( string $fingerprint ): string {
		if ( 'any' === $fingerprint ) {
			return self::DEF_NAME_PREFIX . 'any';
		}

		$base = self::DEF_NAME_PREFIX . substr( $fingerprint, 0, 8 );
		$name = $base;
		$suffix = 2;

		while ( isset( $this->defs[ $name ] ) ) {
			$name = $base . '_' . $suffix;
			$suffix++;
		}

		return $name;
	}
}
