<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads checked-in control dumps for MCP V3 widgets whose runtime controls are
 * unavailable in Core PHPUnit (Pro widgets). The Advanced tab is identical
 * across V3 widgets, so it is stored once and merged here.
 */
class V3_Widget_Fixtures {

	const SHARED_ADVANCED_FILE = 'advanced-shared.json';

	/**
	 * @var array<string, array<string, mixed>>
	 */
	private static $cache = [];

	/**
	 * @return string[]
	 */
	public static function widget_types(): array {
		return [
			'nav-menu',
			'theme-archive-title',
			'theme-post-content',
			'theme-post-excerpt',
			'theme-post-featured-image',
			'theme-post-title',
		];
	}

	/**
	 * @return array{controls: array<string, array<string, mixed>>}
	 */
	public static function widget_config( string $widget_type ): array {
		if ( ! isset( self::$cache[ $widget_type ] ) ) {
			self::$cache[ $widget_type ] = [
				'controls' => array_merge(
					self::read_controls( $widget_type . '.json' ),
					self::read_controls( self::SHARED_ADVANCED_FILE )
				),
			];
		}

		return self::$cache[ $widget_type ];
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	private static function read_controls( string $file_name ): array {
		return self::read_json( __DIR__ . '/controls/' . $file_name )['controls'] ?? [];
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function read_json( string $path ): array {
		if ( ! is_readable( $path ) ) {
			throw new \RuntimeException( sprintf( 'Missing V3 fixture: %s', $path ) );
		}

		$decoded = json_decode( (string) file_get_contents( $path ), true );

		if ( ! is_array( $decoded ) ) {
			throw new \RuntimeException( sprintf( 'Invalid V3 fixture: %s', $path ) );
		}

		return $decoded;
	}
}
