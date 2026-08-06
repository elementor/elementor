<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Design_Taste_Ability extends Abstract_Ability {
	const URI = 'elementor://style/design-taste';
	const FILE_PATH = __DIR__ . '/../static-resources/style/design-taste.md';

	protected function get_ability_id(): string {
		return 'elementor/design-taste';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Design Taste', 'elementor' ),
			__( 'Read when committing a design system (colors, fonts, type scale, rhythm). Curated palettes, pairings, anti-slop kill-list, contrast floors.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Read when committing a design system (colors, fonts, type scale, rhythm). Curated palettes, pairings, anti-slop kill-list, contrast floors.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		if ( ! file_exists( self::FILE_PATH ) ) {
			return new \WP_Error(
				'resource_not_found',
				__( 'Static resource file not found', 'elementor' ),
				[ 'status' => 404 ]
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( self::FILE_PATH );
	}
}
