<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page_State {
	const STATIC_STATE_SETTING = 'e_data_flow_static_state';
	const SOURCES_SETTING = 'e_data_flow_sources';
	const DEFAULT_POSTS_COUNT = 3;
	const MAX_POSTS_COUNT = 20;

	public static function get_source_options(): array {
		return [
			'post_title' => esc_html__( 'Current post: Title', 'elementor' ),
			'post_excerpt' => esc_html__( 'Current post: Excerpt', 'elementor' ),
			'post_date' => esc_html__( 'Current post: Date', 'elementor' ),
			'post_author' => esc_html__( 'Current post: Author', 'elementor' ),
			'site_name' => esc_html__( 'Site: Name', 'elementor' ),
			'site_description' => esc_html__( 'Site: Description', 'elementor' ),
			'user_logged_in' => esc_html__( 'User: Is logged in', 'elementor' ),
			'user_display_name' => esc_html__( 'User: Display name', 'elementor' ),
			'latest_posts' => esc_html__( 'Latest posts (title + link)', 'elementor' ),
		];
	}

	public static function register_controls( Document $document ): void {
		if ( ! $document::get_property( 'has_elements' ) ) {
			return;
		}

		$document->start_controls_section( 'section_data_flow_state', [
			'label' => esc_html__( 'Page State (Data Flow)', 'elementor' ),
			'tab' => Controls_Manager::TAB_SETTINGS,
		] );

		$document->add_control( self::STATIC_STATE_SETTING, [
			'label' => esc_html__( 'Static state (JSON)', 'elementor' ),
			'type' => Controls_Manager::CODE,
			'language' => 'json',
			'rows' => 8,
			'description' => esc_html__( 'Initial page state, e.g. {"count": 0}. Use {{state.count}} in any text to bind it.', 'elementor' ),
		] );

		$document->add_control( self::SOURCES_SETTING, [
			'label' => esc_html__( 'WordPress data', 'elementor' ),
			'type' => Controls_Manager::REPEATER,
			'title_field' => '{{{ key }}}',
			'prevent_empty' => false,
			'fields' => [
				[
					'name' => 'key',
					'label' => esc_html__( 'State key', 'elementor' ),
					'type' => Controls_Manager::TEXT,
				],
				[
					'name' => 'source',
					'label' => esc_html__( 'Source', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'options' => self::get_source_options(),
					'default' => 'post_title',
				],
				[
					'name' => 'count',
					'label' => esc_html__( 'Posts count', 'elementor' ),
					'type' => Controls_Manager::NUMBER,
					'min' => 1,
					'max' => self::MAX_POSTS_COUNT,
					'default' => self::DEFAULT_POSTS_COUNT,
					'condition' => [ 'source' => 'latest_posts' ],
				],
			],
		] );

		$document->end_controls_section();
	}

	public static function resolve( Document $document ): array {
		$state = self::parse_static_state( $document->get_settings( self::STATIC_STATE_SETTING ) );
		$sources = $document->get_settings( self::SOURCES_SETTING );

		if ( ! is_array( $sources ) ) {
			return $state;
		}

		foreach ( $sources as $source ) {
			$key = isset( $source['key'] ) ? sanitize_key( $source['key'] ) : '';
			$source_name = $source['source'] ?? '';

			if ( '' === $key || ! array_key_exists( $source_name, self::get_source_options() ) ) {
				continue;
			}

			$state[ $key ] = self::resolve_source( $source_name, $document->get_post(), (int) ( $source['count'] ?? self::DEFAULT_POSTS_COUNT ) );
		}

		return $state;
	}

	public static function parse_static_state( $raw ): array {
		if ( is_array( $raw ) ) {
			return $raw;
		}

		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return [];
		}

		$decoded = json_decode( $raw, true );

		return is_array( $decoded ) ? $decoded : [];
	}

	public static function resolve_source( string $source, \WP_Post $post, int $count = self::DEFAULT_POSTS_COUNT ) {
		switch ( $source ) {
			case 'post_title':
				return get_the_title( $post );
			case 'post_excerpt':
				return get_the_excerpt( $post );
			case 'post_date':
				return get_the_date( '', $post );
			case 'post_author':
				return get_the_author_meta( 'display_name', $post->post_author );
			case 'site_name':
				return get_bloginfo( 'name' );
			case 'site_description':
				return get_bloginfo( 'description' );
			case 'user_logged_in':
				return is_user_logged_in();
			case 'user_display_name':
				return wp_get_current_user()->display_name;
			case 'latest_posts':
				return self::get_latest_posts( $count );
			default:
				return null;
		}
	}

	private static function get_latest_posts( int $count ): array {
		$posts = get_posts( [
			'numberposts' => max( 1, min( $count, self::MAX_POSTS_COUNT ) ),
			'post_status' => 'publish',
		] );

		return array_map( fn( \WP_Post $post ) => [
			'id' => $post->ID,
			'title' => get_the_title( $post ),
			'link' => get_permalink( $post ),
		], $posts );
	}
}
