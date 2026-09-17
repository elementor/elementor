<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Wordpress_Best_Practices_Ability extends Abstract_Ability {
	const URI = 'elementor://wordpress/best-practices';
	const FILE_PATH = __DIR__ . '/../static-resources/wordpress/best-practices.md';

	protected function get_ability_id(): string {
		return 'elementor/wordpress-best-practices';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'WordPress Best Practices', 'elementor' ),
			__( 'Opinionated WordPress patterns for Elementor builds: repeating layouts (single template vs N pages), include-all + exclude-exceptions condition scoping, Post Content placement, dynamic tags.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Opinionated WordPress patterns for Elementor builds: repeating layouts (single template vs N pages), include-all + exclude-exceptions condition scoping, Post Content placement, dynamic tags.', 'elementor' ),
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
