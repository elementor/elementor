<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion_Detections {
	private const ELEMENTOR_EDIT_MODE_META_KEY = '_elementor_edit_mode';
	private const ELEMENTOR_EDIT_MODE_BUILDER = 'builder';
	private const TEMPLATE_TYPE_META_KEY = '_elementor_template_type';

	private const SUPPORTED_CONTENT_TYPES = [ 'post', 'page', 'product' ];
	private const TYPE_TO_SCENARIO_MAP = [
		'post' => 'single_post',
		'page' => 'header_footer',
		'product' => 'single_product',
	];

	private static ?array $cache = null;

	private const TEMPLATE_TYPES = [
		'header' => [ 'header' ],
		'footer' => [ 'footer' ],
		'single_post' => [ 'single-post', 'single' ],
		'single_product' => [ 'single-product', 'product' ],
	];

	public static function get(): array {
		if ( null !== self::$cache ) {
			return self::$cache;
		}

		$content_counts = self::get_elementor_published_content_counts();
		$template_presence = self::get_template_presence();

		self::$cache = [
			'contentCounts' => $content_counts,
			'templatePresence' => $template_presence,
		];

		return self::$cache;
	}

	public static function get_promotion_payload( Document $document ): ?array {
		$detections = self::get();
		$scenario = self::get_scenario_for_document( $document );

		if ( ! $scenario ) {
			return null;
		}

		$introduction_key = self::get_introduction_key( $scenario );

		if ( self::is_introduction_viewed( $introduction_key ) || ! self::is_eligible_scenario( $scenario, $detections ) ) {
			return null;
		}

		return [
			'scenario' => $scenario,
			'introductionKey' => $introduction_key,
		];
	}

	private static function get_scenario_for_document( Document $document ): ?string {
		$post_type = \get_post_type( $document->get_main_id() );

		if ( ! $post_type || ! is_string( $post_type ) ) {
			return null;
		}

		return self::TYPE_TO_SCENARIO_MAP[ $post_type ] ?? null;
	}

	private static function get_introduction_key( string $scenario ): string {
		return "introduce_theme_builder_{$scenario}_popup";
	}

	private static function is_introduction_viewed( string $introduction_key ): bool {
		return (bool) User::get_introduction_meta( $introduction_key );
	}

	private static function is_eligible_scenario( string $scenario, array $detections ): bool {
		$counts = $detections['contentCounts'] ?? [];
		$templates = $detections['templatePresence'] ?? [];

		if ( self::TYPE_TO_SCENARIO_MAP['post'] === $scenario ) {
			return ( $counts['post'] ?? 0 ) > 1 && empty( $templates['single_post'] );
		}

		if ( self::TYPE_TO_SCENARIO_MAP['product'] === $scenario ) {
			return ( $counts['product'] ?? 0 ) > 1 && empty( $templates['single_product'] );
		}

		if ( self::TYPE_TO_SCENARIO_MAP['page'] === $scenario ) {
			$has_header = ! empty( $templates['header'] );
			$has_footer = ! empty( $templates['footer'] );

			return ( $counts['page'] ?? 0 ) > 4 && ( ! $has_header || ! $has_footer );
		}

		return false;
	}

	private static function get_elementor_published_content_counts(): array {
		global $wpdb;

		$post_types = array_values( array_filter( self::SUPPORTED_CONTENT_TYPES, 'post_type_exists' ) );

		if ( empty( $post_types ) ) {
			return [];
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$results = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT p.post_type, COUNT(p.ID) as hits
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm
					ON ( p.ID = pm.post_id AND pm.meta_key = %s AND pm.meta_value = %s )
				WHERE p.post_status = %s
					AND p.post_type IN (" . implode( ',', array_fill( 0, count( $post_types ), '%s' ) ) . ')
				  GROUP BY p.post_type',
				array_merge(
					[
						self::ELEMENTOR_EDIT_MODE_META_KEY,
						self::ELEMENTOR_EDIT_MODE_BUILDER,
						'publish',
					],
					$post_types,
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
		global $wpdb;

		$all_template_types = array_values( array_unique( array_merge( ...array_values( self::TEMPLATE_TYPES ) ) ) );

		if ( empty( $all_template_types ) ) {
			return array_fill_keys( array_keys( self::TEMPLATE_TYPES ), false );
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$found_types = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT pm.meta_value
				FROM {$wpdb->posts} p
				INNER JOIN {$wpdb->postmeta} pm
					ON ( p.ID = pm.post_id AND pm.meta_key = %s )
				WHERE p.post_status = %s
					AND p.post_type = %s
					AND pm.meta_value IN (" . implode( ',', array_fill( 0, count( $all_template_types ), '%s' ) ) . ')',
				array_merge(
					[
						self::TEMPLATE_TYPE_META_KEY,
						'publish',
						'elementor_library',
					],
					$all_template_types,
				)
			)
		);

		$presence = [];

		foreach ( self::TEMPLATE_TYPES as $key => $types ) {
			$presence[ $key ] = ! empty( array_intersect( $types, $found_types ) );
		}

		return $presence;
	}
}
