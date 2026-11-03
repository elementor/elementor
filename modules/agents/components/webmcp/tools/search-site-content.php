<?php

namespace Elementor\Modules\Agents\Components\Webmcp\Tools;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Search_Site_Content extends Abstract_Webmcp_Tool {

	const MAX_QUERY_LENGTH = 200;

	const DEFAULT_LIMIT = 10;

	const MAX_LIMIT = 20;

	private Agent_Ready_Settings $settings;

	private Markdown_Content_Catalog $catalog;

	private Content_Generator $generator;

	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct(
		Agent_Ready_Settings $settings,
		Markdown_Content_Catalog $catalog,
		Content_Generator $generator,
		Prompt_Injection_Sanitizer $sanitizer
	) {
		$this->settings  = $settings;
		$this->catalog   = $catalog;
		$this->generator = $generator;
		$this->sanitizer = $sanitizer;
	}

	public function get_slug(): string {
		return 'search-site-content';
	}

	public function get_label(): string {
		return __( 'Search site content', 'elementor' );
	}

	public function get_description(): string {
		return __( 'Search the public pages and posts of this site. Returns structured results with id, title, url, publish date and excerpt, so there is no need to parse HTML.', 'elementor' );
	}

	public function get_admin_description(): string {
		return __( 'Let agents find relevant pages and posts easily.', 'elementor' );
	}

	public function get_input_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'query' => [
					'type' => 'string',
					'description' => __( 'Words to look for in titles and content.', 'elementor' ),
					'minLength' => 1,
					'maxLength' => self::MAX_QUERY_LENGTH,
				],
				'post_type' => [
					'type' => 'string',
					'description' => __( 'Optional post type slug to limit the search to, for example "post" or "page".', 'elementor' ),
				],
				'limit' => [
					'type' => 'integer',
					'description' => __( 'Maximum number of results.', 'elementor' ),
					'minimum' => 1,
					'maximum' => self::MAX_LIMIT,
					'default' => self::DEFAULT_LIMIT,
				],
			],
			'required' => [ 'query' ],
		];
	}

	public function is_relevant(): bool {
		foreach ( $this->get_searchable_post_types() as $post_type ) {
			if ( (int) ( wp_count_posts( $post_type )->publish ?? 0 ) > 0 ) {
				return true;
			}
		}

		return false;
	}

	public function execute( $input = null ) {
		$input = (array) $input;
		$query = sanitize_text_field( (string) ( $input['query'] ?? '' ) );

		if ( '' === $query ) {
			return [ 'results' => [] ];
		}

		$items = $this->catalog->search_content(
			$this->resolve_post_types( (string) ( $input['post_type'] ?? '' ) ),
			$query,
			min( self::MAX_LIMIT, max( 1, (int) ( $input['limit'] ?? self::DEFAULT_LIMIT ) ) )
		);

		return [ 'results' => array_map( [ $this, 'sanitize_item' ], $items ) ];
	}

	/**
	 * @return string[]
	 */
	private function get_searchable_post_types(): array {
		if ( $this->settings->is_markdown_enabled() ) {
			return $this->settings->get_markdown_post_types();
		}

		return array_keys( $this->generator->get_available_post_types() );
	}

	/**
	 * @return string[]
	 */
	private function resolve_post_types( string $requested ): array {
		$searchable = $this->get_searchable_post_types();

		if ( '' === $requested ) {
			return $searchable;
		}

		return array_values( array_intersect( $searchable, [ $requested ] ) );
	}

	private function sanitize_item( array $item ): array {
		$item['title']   = $this->sanitizer->sanitize( $item['title'] );
		$item['excerpt'] = $this->sanitizer->sanitize( $item['excerpt'] );

		return $item;
	}
}
