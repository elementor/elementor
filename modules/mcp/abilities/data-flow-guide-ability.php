<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Data_Flow_Guide_Ability extends Abstract_Ability {
	const URI = 'elementor://data-flow/guide';
	const FILE_PATH = __DIR__ . '/../static-resources/data-flow/guide.md';

	protected function get_ability_id(): string {
		return 'elementor/data-flow-guide';
	}

	protected function get_definition(): Ability_Definition {
		$description = __( 'How to make a page stateful: page, container and component state scopes, component params, {{state.key}} text bindings, and element handlers for build-composition, manage-component and manage-elements.', 'elementor' );

		return new Ability_Definition(
			__( 'Data Flow Guide', 'elementor' ),
			$description,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => $description,
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
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( self::FILE_PATH );
	}
}
