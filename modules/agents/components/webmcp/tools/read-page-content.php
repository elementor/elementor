<?php

namespace Elementor\Modules\Agents\Components\Webmcp\Tools;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Read_Page_Content extends Abstract_Webmcp_Tool {

	private Agent_Ready_Settings $settings;

	private Markdown_Endpoint $markdown_endpoint;

	public function __construct( Agent_Ready_Settings $settings, Markdown_Endpoint $markdown_endpoint ) {
		$this->settings          = $settings;
		$this->markdown_endpoint = $markdown_endpoint;
	}

	public function get_slug(): string {
		return 'read-page-content';
	}

	public function get_label(): string {
		return __( 'Read page content', 'elementor' );
	}

	public function get_description(): string {
		return __( 'Get the main content of a public page or post as clean Markdown, without layout, scripts or styles. Use the id returned by search_site_content.', 'elementor' );
	}

	public function get_admin_description(): string {
		return __( 'Get the main text of a page or post without layout clutter.', 'elementor' );
	}

	public function get_input_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'id' => [
					'type' => 'integer',
					'description' => __( 'The id of the page or post to read.', 'elementor' ),
					'minimum' => 1,
				],
			],
			'required' => [ 'id' ],
		];
	}

	public function is_relevant(): bool {
		return $this->settings->is_markdown_enabled();
	}

	public function execute( $input = null ) {
		$post = get_post( (int) ( ( (array) $input )['id'] ?? 0 ) );

		if ( ! ( $post instanceof \WP_Post ) || ! $this->markdown_endpoint->is_markdown_access_allowed( $post ) ) {
			return new \WP_Error( self::ERROR_NOT_FOUND, __( 'Page not found.', 'elementor' ) );
		}

		return [
			'id' => $post->ID,
			'url' => (string) get_permalink( $post ),
			'format' => 'markdown',
			'content' => $this->markdown_endpoint->build_markdown( $post ),
		];
	}
}
