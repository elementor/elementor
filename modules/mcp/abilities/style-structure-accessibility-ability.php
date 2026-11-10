<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Structure_Accessibility_Ability extends Abstract_Ability {
	const URI = 'elementor://style/structure-and-accessibility';
	const FILE_PATH = __DIR__ . '/../static-resources/style/structure-and-accessibility.md';

	protected function get_ability_id(): string {
		return 'elementor/style-structure-and-accessibility';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Building Best Practices: Structure & Accessibility', 'elementor' ),
			__( 'Heading outline, container tags, links vs. buttons, reading order, and WCAG 2.2 AA accessibility rules. Read before composing a page.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Heading outline, container tags, links vs. buttons, reading order, and WCAG 2.2 AA accessibility rules. Read before composing a page.', 'elementor' ),
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
