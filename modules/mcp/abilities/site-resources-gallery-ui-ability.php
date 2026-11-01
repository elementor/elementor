<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Resources_Gallery_Ui_Ability extends Abstract_Ability {
	const URI = 'ui://elementor/site-resources-gallery';
	const MIME_TYPE = 'text/html;profile=mcp-app';
	const FILE_PATH = __DIR__ . '/../static-resources/ui/site-resources-gallery.html';

	protected function get_ability_id(): string {
		return 'elementor/site-resources-gallery-ui';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Site Resources Gallery UI', 'elementor' ),
			__( 'Interactive gallery of this site’s Elementor widgets, components, and templates for MCP Apps hosts.', 'elementor' ),
			'elementor',
			[
				'type'  => 'array',
				'items' => [
					'type'       => 'object',
					'required'   => [ 'uri', 'mimeType', 'text' ],
					'properties' => [
						'uri'      => [ 'type' => 'string' ],
						'mimeType' => [ 'type' => 'string' ],
						'text'     => [ 'type' => 'string' ],
					],
				],
			],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => self::MIME_TYPE,
					'description' => __( 'Interactive gallery of this site’s Elementor widgets, components, and templates for MCP Apps hosts.', 'elementor' ),
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
		$html = file_get_contents( self::FILE_PATH );

		$item = [
			'uri'      => self::URI,
			'mimeType' => self::MIME_TYPE,
			'text'     => $html,
		];

		$parsed = wp_parse_url( home_url() );
		$site_origin = ! empty( $parsed['host'] )
			? ( $parsed['scheme'] ?? 'https' ) . '://' . $parsed['host']
			: '';

		if ( '' !== $site_origin ) {
			$item['_meta'] = [
				'ui' => [
					'csp' => [
						'resourceDomains' => [ $site_origin ],
						'frameDomains'    => [ $site_origin ],
					],
				],
			];
		}

		return [ $item ];
	}
}
