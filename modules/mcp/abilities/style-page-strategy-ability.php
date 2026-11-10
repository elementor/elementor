<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Page_Strategy_Ability extends Abstract_Ability {
	const URI = 'elementor://style/page-strategy';
	const FILE_PATH = __DIR__ . '/../static-resources/style/page-strategy.md';

	protected function get_ability_id(): string {
		return 'elementor/style-page-strategy';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Building Best Practices: Page Strategy', 'elementor' ),
			__( 'Visitor brief, first-screen mirror test, path to one decision, attention, motion, and the originality process. Read before designing a new page or restyling one.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Visitor brief, first-screen mirror test, path to one decision, attention, motion, and the originality process. Read before designing a new page or restyling one.', 'elementor' ),
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
