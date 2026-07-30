<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Static_Markdown_Resources {

	public static function ability_slugs(): array {
		$slugs = [];

		foreach ( self::definitions() as $definition ) {
			$slugs[] = self::uri_to_ability_slug( $definition['uri'] );
		}

		return $slugs;
	}

	public static function register_abilities(): void {
		if ( ! function_exists( 'wp_register_ability' ) ) {
			return;
		}

		foreach ( self::definitions() as $definition ) {
			$definition_object = new Ability_Definition(
				$definition['name'],
				$definition['description'],
				'elementor',
				[ 'type' => 'string' ],
				[
					'mcp' => [
						'type' => 'resource',
						'uri' => $definition['uri'],
						'public' => true,
						'mimeType' => 'text/markdown',
						'description' => $definition['description'],
					],
				],
				fn() => current_user_can( 'edit_posts' )
			);

			$file_path = $definition['file'];
			$ability_definition = $definition_object->to_array();
			$ability_definition['execute_callback'] = static function () use ( $file_path ) {
				return self::read_file( $file_path );
			};

			wp_register_ability(
				self::uri_to_ability_slug( $definition['uri'] ),
				$ability_definition
			);
		}
	}

	public static function catalog(): array {
		$entries = [];

		foreach ( self::definitions() as $definition ) {
			$entries[] = [
				'uri' => $definition['uri'],
				'name' => $definition['name'],
				'description' => $definition['description'],
				'mimeType' => 'text/markdown',
			];
		}

		return $entries;
	}

	public static function executors(): array {
		$executors = [];

		foreach ( self::definitions() as $definition ) {
			$file_path = $definition['file'];
			$executors[ $definition['uri'] ] = [
				'execute' => static function () use ( $file_path ) {
					return self::read_file( $file_path );
				},
				'mimeType' => 'text/markdown',
			];
		}

		return $executors;
	}

	private static function definitions(): array {
		$base = __DIR__ . '/../../static-resources';

		return [
			[
				'uri' => 'elementor://style/design-taste',
				'name' => 'Design Taste',
				'description' => 'Read when committing a design system (colors, fonts, type scale, rhythm). Curated palettes, pairings, anti-slop kill-list, contrast floors.',
				'file' => $base . '/style/design-taste.md',
			],
		];
	}

	private static function uri_to_ability_slug( string $uri ): string {
		return 'elementor/' . str_replace( '/', '-', substr( $uri, strlen( 'elementor://' ) ) );
	}

	private static function read_file( string $file_path ) {
		if ( ! file_exists( $file_path ) ) {
			return new \WP_Error(
				'resource_not_found',
				__( 'Static resource file not found', 'elementor' ),
				[ 'status' => 404 ]
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( $file_path );
	}
}
