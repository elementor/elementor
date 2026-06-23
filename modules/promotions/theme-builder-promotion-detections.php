<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use WP_Query;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion_Detections {
	private const ELEMENTOR_EDIT_MODE_META_KEY = '_elementor_edit_mode';
	private const ELEMENTOR_EDIT_MODE_BUILDER = 'builder';
	private const TEMPLATE_TYPE_META_KEY = '_elementor_template_type';

	private const SUPPORTED_CONTENT_TYPES = [ 'post', 'page', 'product' ];

	private const TEMPLATE_TYPES = [
		'header' => [ 'header' ],
		'footer' => [ 'footer' ],
		'single_post' => [ 'single-post', 'single' ],
		'single_product' => [ 'single-product', 'product', 'single' ],
	];

	public static function get(): array {
		$content_counts = self::get_elementor_published_content_counts();
		$template_presence = self::get_template_presence();

		return [
			'contentCounts' => $content_counts,
			'templatePresence' => $template_presence,
		];
	}

	public static function get_promotion_payload( Document $document ): array {
		$detections = self::get();
		$scenario = self::get_scenario_for_document( $document );

		if ( ! $scenario ) {
			return [
				'shouldShow' => false,
				'scenario' => null,
				'introductionKey' => null,
			];
		}

		$introduction_key = self::get_introduction_key( $scenario );

		return [
			'shouldShow' => self::should_show_promotion( $scenario, $detections ),
			'scenario' => $scenario,
			'introductionKey' => $introduction_key,
		];
	}

	private static function get_scenario_for_document( Document $document ): ?string {
		$post_type = \get_post_type( $document->get_main_id() );

		if ( ! $post_type || ! is_string( $post_type ) ) {
			return null;
		}

		switch ( $post_type ) {
			case 'post':
				return 'single_post';
			case 'product':
				return 'single_product';
			case 'page':
				return 'header_footer';
			default:
				return null;
		}
	}

	private static function get_introduction_key( string $scenario ): string {
		return "introduce_theme_builder_{$scenario}_popup";
	}

	private static function should_show_promotion( string $scenario, array $detections ): bool {
		$counts = $detections['contentCounts'] ?? [];
		$templates = $detections['templatePresence'] ?? [];

		if ( 'single_post' === $scenario ) {
			return ( $counts['post'] ?? 0 ) > 1 && empty( $templates['single_post'] );
		}

		if ( 'single_product' === $scenario ) {
			return ( $counts['product'] ?? 0 ) > 1 && empty( $templates['single_product'] );
		}

		if ( 'header_footer' === $scenario ) {
			$has_header = ! empty( $templates['header'] );
			$has_footer = ! empty( $templates['footer'] );

			return ( $counts['page'] ?? 0 ) > 1 && ( ! $has_header || ! $has_footer );
		}

		return false;
	}

	private static function get_elementor_published_content_counts(): array {
		global $wpdb;

		$post_types = array_values( array_filter( self::SUPPORTED_CONTENT_TYPES, 'post_type_exists' ) );

		if ( empty( $post_types ) ) {
			return [];
		}

		$placeholders = implode( ',', array_fill( 0, count( $post_types ), '%s' ) );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT p.post_type, COUNT(p.ID) as hits
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm
					ON ( p.ID = pm.post_id AND pm.meta_key = %s AND pm.meta_value = %s )
				WHERE p.post_status = %s
					AND p.post_type IN ($placeholders)
					AND p.post_type != %s
				GROUP BY p.post_type",
				array_merge(
					[
						self::ELEMENTOR_EDIT_MODE_META_KEY,
						self::ELEMENTOR_EDIT_MODE_BUILDER,
						'publish',
					],
					$post_types,
					[
						'elementor_library',
					]
				)
			)
		);

		$counts = array_fill_keys( $post_types, 0 );

		foreach ( $results as $row ) {
			$counts[ $row->post_type ] = (int) $row->hits;
		}

		return $counts;
	}

	private static function get_template_presence(): array {
		$presence = [];

		foreach ( self::TEMPLATE_TYPES as $key => $types ) {
			$presence[ $key ] = self::has_published_templates_of_types( $types );
		}

		return $presence;
	}

	private static function has_published_templates_of_types( array $template_types ): bool {
		$template_types = array_values( array_filter( $template_types ) );

		if ( empty( $template_types ) ) {
			return false;
		}

		$args = [
			'post_type' => 'elementor_library',
			'post_status' => 'publish',
			'posts_per_page' => 1,
			'fields' => 'ids',
			'no_found_rows' => true,
			'update_post_term_cache' => false,
			'update_post_meta_cache' => false,
			'meta_query' => [
				[
					'key' => self::TEMPLATE_TYPE_META_KEY,
					'value' => $template_types,
					'compare' => 'IN',
				],
			],
		];

		$query = new WP_Query( $args );

		return ! empty( $query->posts );
	}
}
