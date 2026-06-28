<?php
namespace Elementor\Modules\Promotions;

use Elementor\Core\Base\Document;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Theme_Builder_Promotion_Detections {
	private const ELEMENTOR_EDIT_MODE_BUILDER = 'builder';

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

	private static array $content_count_cache = [];
	private static array $template_exists_cache = [];

	private const TEMPLATE_TYPES = [
		'header_footer' => [ 'header', 'footer' ],
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

		if ( null === $content_count || ! self::is_eligible_scenario( $scenario, $content_count ) ) {
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

	private static function is_eligible_scenario( string $scenario, int $content_count ): bool {
		$min_content_count = self::MIN_PUBLISHED_CONTENT_COUNT_BY_SCENARIO[ $scenario ] ?? 0;

		if ( $content_count < $min_content_count ) {
			return false;
		}

		switch ( $scenario ) {
			case self::TYPE_TO_SCENARIO_MAP['post']:
				return ! self::has_published_template( 'single_post' );
			case self::TYPE_TO_SCENARIO_MAP['product']:
				return ! self::has_published_template( 'single_product' );
			case self::TYPE_TO_SCENARIO_MAP['page']:
				return ! self::has_published_template( 'header_footer' );
			default:
				return false;
		}
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

	private static function has_published_template( string $template_key ): bool {
		$template_types = self::TEMPLATE_TYPES[ $template_key ] ?? null;

		if ( empty( $template_types ) ) {
			return false;
		}

		if ( array_key_exists( $template_key, self::$template_exists_cache ) ) {
			return self::$template_exists_cache[ $template_key ];
		}

		$query = new \WP_Query( [
			'post_type' => Source_Local::CPT,
			'post_status' => 'publish',
			'meta_query' => [
				[
					'key' => Source_Local::TYPE_META_KEY,
					'value' => $template_types,
					'compare' => 'IN',
				],
			],
			'posts_per_page' => 1,
			'fields' => 'ids',
			'no_found_rows' => false,
		] );

		self::$template_exists_cache[ $template_key ] = $query->found_posts > 0;

		return self::$template_exists_cache[ $template_key ];
	}
}
