<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Loads checked-in control dumps for MCP-allowlisted V3 widgets.
 *
 * Core's PHPUnit suite has no Elementor Pro, so the V3 mapping pipeline is exercised
 * against dumps captured from the MCP REST runtime instead of live widget instances.
 * The Advanced tab is registered globally by Elementor and is identical across widgets,
 * so it is stored once and merged into every widget config here.
 */
class V3_Widget_Fixtures {

	const SHARED_ADVANCED_FILE = 'advanced-shared.json';

	/**
	 * @var array<string, array<string, mixed>>
	 */
	private static array $cache = [];

	/**
	 * @return string[]
	 */
	public static function widget_types(): array {
		return [
			'nav-menu',
			'search',
			'table-of-contents',
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
