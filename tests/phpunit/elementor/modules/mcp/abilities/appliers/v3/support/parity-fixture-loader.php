<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Support;

use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads parity fixtures for compiled explicit V3 maps. Each fixture describes
 * the LLM-facing contract a compiled map must satisfy: supported CSS properties
 * per target, unsupported properties, settings keys, and catalog visibility.
 */
class Parity_Fixture_Loader {

	const FIXTURES_DIR = __DIR__ . '/../fixtures/parity/';

	const LAUNCH_WIDGET_TYPES = [
		'button',
		'container',
		'divider',
		'heading',
		'html',
		'icon',
		'image',
		'nav-menu',
		'spacer',
		'text-editor',
		'theme-archive-title',
		'theme-post-content',
		'theme-post-excerpt',
		'theme-post-featured-image',
		'theme-post-title',
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
	 * @return array<string, mixed>
	 */
	public static function compiled_expectations( array $fixture ): array {
		$style_targets = $fixture['expected_style_targets'] ?? null;

		if ( ! is_array( $style_targets ) ) {
			$aliases = $fixture['expected_style_target_aliases'] ?? $fixture['expected_inner_aliases'] ?? [];
			$supported = $fixture['expected_supported'] ?? [];
			$style_targets = [];

			if ( is_array( $aliases ) && ! empty( $aliases ) ) {
				foreach ( $aliases as $alias ) {
					$style_targets[ $alias ] = $supported;
				}
			} elseif ( is_array( $supported ) ) {
				$style_targets = [ (string) $fixture['widget_type'] => $supported ];
			}
		}

		return [
			'widget_type' => $fixture['widget_type'],
			'catalog_visibility' => $fixture['expected_catalog_visibility'] ?? null,
			'default_style_target' => $fixture['expected_default_style_target'] ?? null,
			'settings' => $fixture['expected_settings'] ?? $fixture['expected_non_style_keys'] ?? null,
			'style_targets' => $style_targets,
			'unsupported' => $fixture['expected_unsupported'] ?? [],
		];
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public static function controls( string $widget_type ): array {
		return V3_Widget_Fixtures::widget_config( $widget_type )['controls'];
	}

	public static function has_controls( string $widget_type ): bool {
		return is_readable( __DIR__ . '/../fixtures/controls/' . $widget_type . '.json' );
	}

	/**
	 * @param array<string, mixed> $fixture
	 */
	private static function assert_shape( array $fixture, string $file_name ): void {
		if ( ! is_string( $fixture['widget_type'] ?? null ) || '' === $fixture['widget_type'] ) {
			throw new \RuntimeException( sprintf( 'Parity fixture %s has an invalid `widget_type`.', $file_name ) );
		}

		$has_supported = array_key_exists( 'expected_supported', $fixture ) || array_key_exists( 'expected_style_targets', $fixture );
		$has_unsupported = array_key_exists( 'expected_unsupported', $fixture );

		if ( ! $has_supported || ! $has_unsupported ) {
			throw new \RuntimeException( sprintf( 'Parity fixture %s must declare supported and unsupported CSS properties.', $file_name ) );
		}

		foreach ( [ 'expected_supported', 'expected_unsupported', 'expected_style_targets', 'expected_settings', 'expected_non_style_keys', 'expected_inner_aliases', 'expected_style_target_aliases' ] as $key ) {
			if ( array_key_exists( $key, $fixture ) && null !== $fixture[ $key ] && ! is_array( $fixture[ $key ] ) ) {
				throw new \RuntimeException( sprintf( 'Parity fixture %s: `%s` must be an array or null.', $file_name, $key ) );
			}
		}
	}
}
