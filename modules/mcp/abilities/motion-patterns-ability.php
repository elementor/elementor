<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Motion_Patterns_Ability extends Abstract_Ability {
	const URI = 'elementor://interactions/motion-patterns';
	const FILE_PATH = __DIR__ . '/../static-resources/interactions/motion-patterns.md';

	protected function get_ability_id(): string {
		return 'elementor/motion-patterns';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Motion Patterns', 'elementor' ),
			__( 'Graded Motion pattern cards for code-effect interactions: APIs, animated properties, fields to expose, and adapted snippets.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Graded Motion pattern cards for code-effect interactions: APIs, animated properties, fields to expose, and adapted snippets.', 'elementor' ),
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
