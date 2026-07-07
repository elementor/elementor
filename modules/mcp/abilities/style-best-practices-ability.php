<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Best_Practices_Ability extends Abstract_Ability {
	const URI = 'elementor://style/best-practices';
	const FILE_PATH = __DIR__ . '/../static-resources/style/best-practices.md';

	protected function get_ability_id(): string {
		return 'elementor/style-best-practices';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Style Best Practices', 'elementor' ),
			__( 'Style Best Practices', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Style Best Practices', 'elementor' ),
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
