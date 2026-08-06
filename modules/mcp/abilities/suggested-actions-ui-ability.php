<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Suggested_Actions_Ui_Ability extends Abstract_Ability {
	const URI = 'ui://elementor/suggested-actions';
	const MIME_TYPE = 'text/html;profile=mcp-app';
	const FILE_PATH = __DIR__ . '/../static-resources/ui/suggested-actions.html';

	protected function get_ability_id(): string {
		return 'elementor/suggested-actions-ui';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Suggested Actions UI', 'elementor' ),
			__( 'Interactive suggested next-step action chips rendered by MCP Apps hosts.', 'elementor' ),
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => self::MIME_TYPE,
					'description' => __( 'Interactive suggested next-step action chips rendered by MCP Apps hosts.', 'elementor' ),
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function get_html() {
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

	public function execute( $input = [] ) {
		$html = $this->get_html();

		if ( is_wp_error( $html ) ) {
			return $html;
		}

		return [
			[
				'uri'      => self::URI,
				'mimeType' => self::MIME_TYPE,
				'text'     => $html,
			],
		];
	}
}
