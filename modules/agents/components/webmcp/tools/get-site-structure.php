<?php

namespace Elementor\Modules\Agents\Components\Webmcp\Tools;

use Elementor\Modules\Agents\Classes\Post_Noindex;
use Elementor\Modules\Agents\Classes\Post_Title;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Site_Structure extends Abstract_Webmcp_Tool {

	const MAX_MENU_ITEMS = 50;

	const MAX_FALLBACK_PAGES = 20;

	const ALLOWED_URL_PROTOCOLS = [ 'http', 'https' ];

	const UTILITY_PAGE_SLUGS = [
		'terms' => [ 'terms', 'terms-and-conditions', 'terms-of-service', 'terms-of-use' ],
		'contact' => [ 'contact', 'contact-us' ],
	];

	private Content_Generator $generator;

	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct( Content_Generator $generator, Prompt_Injection_Sanitizer $sanitizer ) {
		$this->generator = $generator;
		$this->sanitizer = $sanitizer;
	}

	public function get_slug(): string {
		return 'get-site-structure';
	}

	public function get_label(): string {
		return __( 'Explore site structure', 'elementor' );
	}

	public function get_description(): string {
		return __( 'Get a lightweight map of this site: a short overview, the main navigation menus, key pages such as the home, privacy policy, terms and contact pages, and the available content types.', 'elementor' );
	}

	public function get_admin_description(): string {
		return __( 'Get a map of your site’s main pages, navigation, and key links.', 'elementor' );
	}

	public function get_input_schema(): array {
		return [];
	}

	public function is_relevant(): bool {
		return true;
	}

	public function execute( $input = null ) {
		$structure = [
			'site' => [
				'name' => $this->sanitizer->sanitize( get_bloginfo( 'name' ) ),
				'tagline' => $this->sanitizer->sanitize( get_bloginfo( 'description' ) ),
				'url' => home_url( '/' ),
				'language' => get_bloginfo( 'language' ),
			],
			'navigation' => $this->get_navigation(),
			'key_pages' => $this->get_key_pages(),
			'content_types' => $this->get_content_types(),
		];

		/**
		 * Filters the site structure returned by the WebMCP site structure tool.
		 * Use it to add utility links such as terms or contact pages.
		 *
		 * @param array $structure Keys: site, navigation, key_pages, content_types.
		 */
		return (array) apply_filters( 'elementor/agents/webmcp/site_structure', $structure );
	}

	private function get_navigation(): array {
		$menus = [];

		foreach ( $this->get_assigned_menus() as $menu ) {
			$items = $this->build_menu_tree( (array) wp_get_nav_menu_items( $menu->term_id ) );

			if ( ! empty( $items ) ) {
				$menus[] = [
					'name' => $this->sanitizer->sanitize( $menu->name ),
					'items' => $items,
				];
			}
		}

		if ( empty( $menus ) ) {
			return [
				[
					'name' => '',
					'items' => $this->get_fallback_pages(),
				],
			];
		}

		return $menus;
	}

	/**
	 * Menus not assigned to a theme location are not shown to visitors, so they stay private.
	 *
	 * @return \WP_Term[]
	 */
	private function get_assigned_menus(): array {
		$menus = array_map( 'wp_get_nav_menu_object', array_unique( array_filter( get_nav_menu_locations() ) ) );

		return array_values( array_filter( $menus, fn( $menu ) => $menu instanceof \WP_Term ) );
	}

	private function build_menu_tree( array $menu_items, int $parent_id = 0 ): array {
		$tree = [];

		foreach ( array_slice( $menu_items, 0, self::MAX_MENU_ITEMS ) as $menu_item ) {
			if ( (int) $menu_item->menu_item_parent !== $parent_id || ! $this->is_menu_item_public( $menu_item ) ) {
				continue;
			}

			$url = esc_url_raw( (string) $menu_item->url, self::ALLOWED_URL_PROTOCOLS );

			if ( '' === $url ) {
				continue;
			}

			$entry = [
				'title' => $this->sanitizer->sanitize( Post_Title::to_plain_text( $menu_item->title ) ),
				'url' => $url,
			];

			$children = $this->build_menu_tree( $menu_items, (int) $menu_item->ID );

			if ( ! empty( $children ) ) {
				$entry['children'] = $children;
			}

			$tree[] = $entry;
		}

		return $tree;
	}

	private function is_menu_item_public( \WP_Post $menu_item ): bool {
		if ( 'post_type' !== $menu_item->type ) {
			return true;
		}

		return $this->is_public_post( get_post( (int) $menu_item->object_id ) );
	}

	private function get_fallback_pages(): array {
		$pages = get_pages( [
			'parent' => 0,
			'number' => self::MAX_FALLBACK_PAGES,
			'sort_column' => 'menu_order,post_title',
		] );

		return array_values( array_map(
			fn( \WP_Post $page ) => [
				'title' => $this->sanitizer->sanitize( Post_Title::to_plain_text( get_the_title( $page ) ) ),
				'url' => (string) get_permalink( $page ),
			],
			array_filter( (array) $pages, [ $this, 'is_public_post' ] )
		) );
	}

	private function get_key_pages(): array {
		$pages = [
			'home' => [
				'title' => __( 'Home', 'elementor' ),
				'url' => home_url( '/' ),
			],
		];

		$privacy_url = get_privacy_policy_url();

		if ( '' !== $privacy_url ) {
			$pages['privacy_policy'] = [
				'title' => __( 'Privacy Policy', 'elementor' ),
				'url' => $privacy_url,
			];
		}

		foreach ( self::UTILITY_PAGE_SLUGS as $key => $slugs ) {
			$page = $this->find_public_page( $slugs );

			if ( $page ) {
				$pages[ $key ] = [
					'title' => $this->sanitizer->sanitize( Post_Title::to_plain_text( get_the_title( $page ) ) ),
					'url' => (string) get_permalink( $page ),
				];
			}
		}

		return $pages;
	}

	/**
	 * @param string[] $slugs
	 */
	private function find_public_page( array $slugs ): ?\WP_Post {
		foreach ( $slugs as $slug ) {
			$page = get_page_by_path( $slug );

			if ( $this->is_public_post( $page ) ) {
				return $page;
			}
		}

		return null;
	}

	private function get_content_types(): array {
		$types = [];

		foreach ( $this->generator->get_available_post_types() as $name => $label ) {
			$count = (int) ( wp_count_posts( $name )->publish ?? 0 );

			if ( $count > 0 ) {
				$types[] = [
					'name' => $name,
					'label' => $label,
					'count' => $count,
				];
			}
		}

		return $types;
	}

	private function is_public_post( $post ): bool {
		return $post instanceof \WP_Post
			&& 'publish' === $post->post_status
			&& '' === $post->post_password
			&& is_post_publicly_viewable( $post )
			&& ! Post_Noindex::is_noindex( $post->ID );
	}
}
