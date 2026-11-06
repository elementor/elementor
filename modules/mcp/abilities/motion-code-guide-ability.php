<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Motion_Code_Guide_Ability extends Abstract_Ability {
	const URI = 'elementor://interactions/motion-code-guide';
	const FILE_PATH = __DIR__ . '/../static-resources/interactions/motion-code-guide.md';

	protected function get_ability_id(): string {
		return 'elementor/motion-code-guide';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Motion Code Guide', 'elementor' ),
			__( 'How to write Pro code-effect interactions: the Motion function contract, editable params, Motion API reference, translation and quality rules, and examples.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'How to write Pro code-effect interactions: the Motion function contract, editable params, Motion API reference, translation and quality rules, and examples.', 'elementor' ),
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
