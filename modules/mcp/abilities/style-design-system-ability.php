<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Design_System_Ability extends Abstract_Ability {
	const URI = 'elementor://style/design-system';
	const FILE_PATH = __DIR__ . '/../static-resources/style/design-system.md';

	protected function get_ability_id(): string {
		return 'elementor/style-design-system';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Building Best Practices: Design System', 'elementor' ),
			__( 'Variables and global classes: what deserves a variable, naming conventions, values, and writing good classes. Read before creating or changing variables or classes.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Variables and global classes: what deserves a variable, naming conventions, values, and writing good classes. Read before creating or changing variables or classes.', 'elementor' ),
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
