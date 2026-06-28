<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion_Detections {
	private const ELEMENTOR_EDIT_MODE_BUILDER = 'builder';
	private const TEMPLATE_TYPE_META_KEY = '_elementor_template_type';

	private const SUPPORTED_CONTENT_TYPES = [ 'post', 'page', 'product' ];
	private const TYPE_TO_SCENARIO_MAP = [
		'post' => 'single_post',
		'page' => 'header_footer',
		'product' => 'single_product',
	];
	private const MIN_PUBLISHED_CONTENT_COUNT_BY_SCENARIO = [
		'single_post' => 2,
		'header_footer' => 5,
		'single_product' => 2,
	];

	private static ?array $template_presence_cache = null;
	private static array $content_count_cache = [];

	private const TEMPLATE_TYPES = [
		'header' => [ 'header' ],
		'footer' => [ 'footer' ],
		'single_post' => [ 'single-post', 'single' ],
		'single_product' => [ 'single-product', 'product' ],
	];

	public static function get_promotion_payload( Document $document ): ?array {
		$scenario = self::get_scenario_for_document( $document );

		if ( ! $scenario ) {
			return null;
		}

		$introduction_key = self::get_introduction_key( $scenario );

		if ( self::is_introduction_viewed( $introduction_key ) ) {
			return null;
		}

		$post_type = \get_post_type( $document->get_main_id() );

		if ( ! is_string( $post_type ) ) {
			return null;
		}

		$content_count = self::get_elementor_published_content_count( $post_type );

		if ( null === $content_count || ! self::is_eligible_scenario( $scenario, $content_count, self::get_template_presence() ) ) {
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

	private static function is_eligible_scenario( string $scenario, int $content_count, array $template_presence ): bool {
		$min_content_count = self::MIN_PUBLISHED_CONTENT_COUNT_BY_SCENARIO[ $scenario ] ?? 0;

		if ( $content_count < $min_content_count ) {
			return false;
		}

		if ( self::TYPE_TO_SCENARIO_MAP['post'] === $scenario ) {
			return empty( $template_presence['single_post'] );
		}

		if ( self::TYPE_TO_SCENARIO_MAP['product'] === $scenario ) {
			return empty( $template_presence['single_product'] );
		}

		if ( self::TYPE_TO_SCENARIO_MAP['page'] === $scenario ) {
			$has_header = ! empty( $template_presence['header'] );
			$has_footer = ! empty( $template_presence['footer'] );

			return ! $has_header || ! $has_footer;
		}

		return false;
	}

	private static function get_elementor_published_content_count( string $post_type ): ?int {
		if ( ! in_array( $post_type, self::SUPPORTED_CONTENT_TYPES, true ) || ! post_type_exists( $post_type ) ) {
			return null;
		}

		if ( array_key_exists( $post_type, self::$content_count_cache ) ) {
			return self::$content_count_cache[ $post_type ];
		}

		$query = new \WP_Query( [
			'post_type' => $post_type,
			'post_status' => 'publish',
			'meta_key' => Document::BUILT_WITH_ELEMENTOR_META_KEY,
			'meta_value' => self::ELEMENTOR_EDIT_MODE_BUILDER,
			'posts_per_page' => 1,
			'fields' => 'ids',
			'no_found_rows' => false,
		] );

		self::$content_count_cache[ $post_type ] = $query->found_posts;

		return self::$content_count_cache[ $post_type ];
	}

	private static function get_template_presence(): array {
		if ( null !== self::$template_presence_cache ) {
			return self::$template_presence_cache;
		}

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

		self::$template_presence_cache = $presence;

		return self::$template_presence_cache;
	}
}
