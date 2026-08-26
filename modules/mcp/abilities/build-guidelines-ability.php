<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Build_Guidelines_Ability extends Abstract_Ability {
	const URI = 'elementor://build-guidelines';
	const FILE_PATH = __DIR__ . '/../static-resources/build-guidelines.md';

	protected function get_ability_id(): string {
		return 'elementor/build-guidelines';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Build Guidelines', 'elementor' ),
			__( 'Authoritative engine + WordPress rules for MCP builds: styling contract (breakpoint spelling, value-shape traps, variables and classes), sizing/layout defaults, and repeating-layout / single-template patterns.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => __( 'Authoritative engine + WordPress rules for MCP builds: styling contract (breakpoint spelling, value-shape traps, variables and classes), sizing/layout defaults, and repeating-layout / single-template patterns.', 'elementor' ),
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
