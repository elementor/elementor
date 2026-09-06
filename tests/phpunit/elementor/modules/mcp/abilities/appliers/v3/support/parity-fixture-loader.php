<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Support;

use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Discovers and loads parity fixtures under `fixtures/parity/`. Each fixture returns a plain
 * array describing what the MCP surface for a V3 widget should look like from an LLM's
 * perspective — supported/unsupported CSS properties, non-style keys, inner-element aliases.
 *
 * Adding a new V3 widget to MCP means dropping in one map file (production code) and one
 * parity fixture (test), then re-running `Test_V3_Widget_Parity`. Nothing else — no snapshot,
 * no per-widget test class.
 */
class Parity_Fixture_Loader {

	const FIXTURES_DIR = __DIR__ . '/../fixtures/parity/';

	const REQUIRED_KEYS = [
		'widget_type',
		'expected_supported',
		'expected_unsupported',
		'expected_non_style_keys',
		'expected_inner_aliases',
	];

	/**
	 * @return array<string, array<string, mixed>> widget_type => fixture
	 */
	public static function all(): array {
		$fixtures = [];

		foreach ( glob( self::FIXTURES_DIR . '*.php' ) ?: [] as $path ) {
			$fixture = require $path;

			if ( ! is_array( $fixture ) ) {
				throw new \RuntimeException( sprintf( 'Parity fixture %s must return an array.', basename( $path ) ) );
			}

			self::assert_shape( $fixture, basename( $path ) );

			$fixtures[ (string) $fixture['widget_type'] ] = $fixture;
		}

		ksort( $fixtures );

		return $fixtures;
	}

	/**
	 * @return array<string, array<string, mixed>> The widget's controls, resolved through the
	 *                                             existing JSON fixture pipeline.
	 */
	public static function controls( string $widget_type ): array {
		return V3_Widget_Fixtures::widget_config( $widget_type )['controls'];
	}

	/**
	 * True when a controls JSON dump exists on disk for this widget. False for widgets whose
	 * parity fixture is checked in but whose controls capture has not been run yet.
	 */
	public static function has_controls( string $widget_type ): bool {
		return is_readable( __DIR__ . '/../fixtures/controls/' . $widget_type . '.json' );
	}

	/**
	 * @param array<string, mixed> $fixture
	 */
	private static function assert_shape( array $fixture, string $file_name ): void {
		foreach ( self::REQUIRED_KEYS as $key ) {
			if ( ! array_key_exists( $key, $fixture ) ) {
				throw new \RuntimeException( sprintf( 'Parity fixture %s missing required key `%s`.', $file_name, $key ) );
			}
		}

		if ( ! is_string( $fixture['widget_type'] ) || '' === $fixture['widget_type'] ) {
			throw new \RuntimeException( sprintf( 'Parity fixture %s has an invalid `widget_type`.', $file_name ) );
		}

		foreach ( [ 'expected_supported', 'expected_unsupported' ] as $key ) {
			if ( ! is_array( $fixture[ $key ] ) ) {
				throw new \RuntimeException( sprintf( 'Parity fixture %s: `%s` must be an array.', $file_name, $key ) );
			}
		}

		// `expected_non_style_keys` and `expected_inner_aliases` may be `null` to skip the
		// exact-match assertion — useful while a widget's parity fixture is being brought up.
		foreach ( [ 'expected_non_style_keys', 'expected_inner_aliases' ] as $key ) {
			if ( null !== $fixture[ $key ] && ! is_array( $fixture[ $key ] ) ) {
				throw new \RuntimeException( sprintf( 'Parity fixture %s: `%s` must be an array or null.', $file_name, $key ) );
			}
		}
	}
}
